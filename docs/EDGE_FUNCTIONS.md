# Edge Functions — owner's guide (local + self-hosted Coolify VPS)

> Written 2026-07-18 for the owner. Bexhearts has two edge functions today —
> `compose-prayer` (AI prayers, needs `ANTHROPIC_API_KEY`) and
> `avatar-upload-url` (R2 presigns, needs the `R2_*` secrets) — and the
> notification system (G1) will add more. They all live in
> `supabase/functions/<name>/index.ts` and deploy the same way.

## The one mental model

An edge function is a tiny Deno web server. Supabase runs all of them inside
ONE container (the "edge runtime"). Your app calls
`https://<your-supabase>/functions/v1/<function-name>`, the gateway (Kong)
forwards it to that container, and the container runs the matching folder's
`index.ts`. Secrets (API keys) are just environment variables on that
container — they never ship in the app.

**Two very different workflows:**
- **Local (your Mac):** the Supabase CLI runs the container for you and
  hot-reloads your code. Great for development.
- **Self-hosted (Coolify VPS):** there is NO `supabase functions deploy` —
  that CLI command only works against Supabase's paid cloud. On self-hosted
  you deploy by **copying the function folders into a volume on the VPS and
  restarting the functions container**. That's it. Don't let anyone tell you
  it's more complicated.

---

## Part 1 — Local (your Mac), step by step

You already do most of this; written out so nothing is tribal knowledge.

1. **Start Docker Desktop** (whale icon in the menu bar must be running).
2. **Start local Supabase** from the repo root:
   ```bash
   supabase start
   ```
   API → `http://127.0.0.1:55321`, Studio → `:55323`, Mailpit → `:55324`.
3. **Check the secrets file** the functions read locally:
   `supabase/functions/.env` — it must contain:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   R2_ACCOUNT_ID=...
   R2_BUCKET=...
   R2_PUBLIC_BASE_URL=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   ```
   (This file is git-ignored. `SUPABASE_URL` / `SUPABASE_ANON_KEY` are injected
   automatically — never put them here.)
4. **Serve ALL functions** (one terminal, leave it running):
   ```bash
   supabase functions serve --env-file supabase/functions/.env
   ```
   No function name after `serve` — that serves every folder and hot-reloads
   when you edit a file. (The old mistake: `serve avatar-upload-url` serves
   ONLY that one and compose-prayer 404s.)
5. **Smoke-test it's up** (401 = perfect, it means "running but you didn't
   send a user token"):
   ```bash
   curl -i -X POST http://127.0.0.1:55321/functions/v1/compose-prayer \
     -H "Content-Type: application/json" -d '{}'
   ```
6. **Use the app normally** (`npx expo start`, sims). The app's
   `EXPO_PUBLIC_SUPABASE_URL` already points at `:55321`, so
   `supabase.functions.invoke('compose-prayer')` hits your local serve.
7. **Logs:** the `functions serve` terminal prints every request +
   `console.log` from the functions. That terminal is your debugger.

---

## Part 2 — Self-hosted Supabase on Coolify (VPS), step by step

Do this once at Phase 9 (I1), then repeat only steps 4–6 when functions change.

1. **Confirm the functions container exists.** In Coolify → your Supabase
   service → the compose/stack view, look for a container named like
   `supabase-edge-functions` (image `supabase/edge-runtime:...`). Coolify's
   official Supabase template includes it. If yours somehow doesn't, stop —
   redeploy from the current Coolify Supabase template rather than
   hand-writing the service.

2. **Find the functions volume path on the VPS.** In Coolify → the
   edge-functions container → Storages/Volumes tab, note the host path mapped
   to `/home/deno/functions`. It's typically something like:
   `/data/coolify/services/<service-id>/volumes/functions/`
   Inside it there's a `main/` folder — that's the router that dispatches
   `/functions/v1/<name>` to `<name>/index.ts`. **Never delete `main/`.**

3. **Set the secrets as environment variables** on the edge-functions
   container (Coolify → container → Environment Variables). The full list, and
   what breaks without each:

   | Secret | Needed by | If missing |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | compose-prayer | AI prayer composition fails |
   | `R2_ACCOUNT_ID` | avatar-upload-url | photo + avatar uploads fail |
   | `R2_BUCKET` | avatar-upload-url | ” |
   | `R2_PUBLIC_BASE_URL` | avatar-upload-url | ” |
   | `R2_ACCESS_KEY_ID` | avatar-upload-url | ” |
   | `R2_SECRET_ACCESS_KEY` | avatar-upload-url | ” |
   | `APPLE_TEAM_ID` | apple-revoke | **Apple token revocation silently no-ops → App Store rejection risk (5.1.1(v))** |
   | `APPLE_KEY_ID` | apple-revoke | ” |
   | `APPLE_PRIVATE_KEY` | apple-revoke | ” |
   | `APPLE_CLIENT_ID` | apple-revoke | ” (`com.bexhearts.app`) |

   (The template already wires `SUPABASE_URL`, the anon/service keys, and
   `JWT_SECRET` — leave those as the template set them. `send-notification`
   and `notification-sweep` need nothing beyond those.)

   > The Apple ones are the ones to double-check before submitting: every
   > function here degrades *quietly* when a secret is absent, which is right
   > for uptime and dangerous for compliance. `apple-revoke` returns
   > `{ configured: false }` and a 200 — it looks healthy. See
   > `docs/APP_STORE.md` §6b for how to verify it end-to-end.

4. **Copy the function folders from your Mac to the VPS volume.** From the
   repo root on your Mac (adjust user/host/path):
   ```bash
   rsync -av --exclude '.env' supabase/functions/ \
     root@your-vps:/data/coolify/services/<service-id>/volumes/functions/
   ```
   This copies **all five function folders** plus `deno.json` alongside the
   existing `main/`. The `--exclude '.env'` matters — secrets go in step 3,
   never as a file on the volume.

   As of 2026-07-30 the five are:

   | Function | What it does | Called by |
   |---|---|---|
   | `avatar-upload-url` | Presigns R2 uploads (avatars + journal photos) | the app |
   | `compose-prayer` | AI-composed prayer (Haiku), consent + crisis guarded | the app |
   | `send-notification` | The ONE door for every notification | the app + cron |
   | `notification-sweep` | Hourly per-couple scheduled notifications | pg_cron |
   | `apple-revoke` | Apple token revocation on account deletion (5.1.1(v)) | the app + optional cron |

5. **Restart the edge-functions container** (Coolify → container → Restart).
   It rescans the volume on boot.

6. **Smoke-test every function from anywhere.** A **401 is success** here — it
   means the function is deployed and rejecting an unauthenticated call, which
   is exactly what it should do:
   ```bash
   for fn in avatar-upload-url compose-prayer send-notification \
             notification-sweep apple-revoke; do
     printf '%-22s ' "$fn"
     curl -s -o /dev/null -w '%{http_code}\n' -X POST \
       "https://<your-supabase-domain>/functions/v1/$fn" \
       -H 'Content-Type: application/json' -d '{}'
   done
   ```
   Read the results as:
   - **401** → deployed and secured. What you want.
   - **404** → the folder didn't land next to `main/`. Re-check step 4's path.
   - **502/503** → the container is down. Check its logs in Coolify.
   - **200** → look closer. Only `apple-revoke` should ever 200 unauthenticated,
     and only if it somehow bypassed its auth check — investigate.

7. **Apply the matching migrations in the VPS Studio** (as always, in order —
   e.g. `00026_usage_rate_limits.sql` before expecting rate limits to work;
   functions degrade open without it).

8. **Point the app at prod** (Phase 9/10): `EXPO_PUBLIC_SUPABASE_URL` in the
   EAS build env → `https://<your-supabase-domain>`. `functions.invoke`
   needs no other change.

**Updating a function later = steps 4 → 5 → 6.** Nothing else.

## The cron jobs (G3 — added 2026-07-19)

`00029_notification_cron.sql` schedules two pg_cron jobs. **Edit the two
placeholders in Part 3 BEFORE running it** (the URL Postgres uses to reach
the functions, and that environment's service_role key — full instructions
are at the top of the file):

- **`notification-sweep`** — hourly at :05, POSTs to the `notification-sweep`
  function, which computes each couple's local hour and sends the scheduled
  reminders (9am devotional + grace notice, 10am milestones, 12pm prayer
  digest, Sun 6pm check-in, 7pm streak-at-risk) through `send-notification`.
  It's idempotent — running it twice in an hour re-sends nothing.
- **`process-account-deletions`** — daily 03:00 UTC, executes the 7-day-grace
  account deletions (pure SQL, no placeholders needed).

**Check they're alive** (Studio SQL editor):
```sql
SELECT jobname, schedule, active FROM cron.job;
SELECT jobname, status, return_message, start_time
FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

**Trigger the sweep by hand** (any terminal; expects `{"planned":N,...}`):
```bash
curl -s -X POST <YOUR_SUPABASE_URL>/functions/v1/notification-sweep \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" -H "Content-Type: application/json" -d '{}'
```
With the wrong/no key it returns 401 — that's the auth working.

**VPS note:** the sweep needs the `pg_cron` + `pg_net` extensions (Part 1 of
00029 creates them) and the edge-functions container reachable from Postgres —
inside Coolify's docker network `http://kong:8000` is the reliable URL.

## Gotchas worth remembering
- `supabase functions deploy` fails against self-hosted — it's cloud-only.
  Volume copy + restart IS the self-hosted deploy.
- Our functions check the caller's JWT themselves (`auth.getUser()`), so
  they're safe even if the gateway's JWT verification is loose.
- Rate limits (00026) are enforced by the DATABASE function
  `consume_usage_credit` — tune limits by re-running its `CREATE OR REPLACE`
  in Studio; the containers don't need touching.
- pg_cron/webhook senders for notifications (G1+) will call these functions
  FROM the database — that needs the `pg_net` extension enabled on the VPS
  Postgres; noted in the Stage G specs.
