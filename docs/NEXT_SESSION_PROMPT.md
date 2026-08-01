# Paste this to start the next session

> Written 2026-07-31 at the end of the pre-launch hardening session, because
> that session's context ran out. Everything below is either verified against
> the repo or explicitly flagged as unverified.

---

Read `CLAUDE.md`, then `docs/HANDOFF.md` (START HERE + the PRE-LAUNCH ORDER
block + every 2026-07-27, 2026-07-28 and 2026-07-30 block), then
`docs/J1_F3_RUNBOOK.md`, `docs/APP_STORE.md` and `docs/EDGE_FUNCTIONS.md`.
The gate (`npm run typecheck && npm run lint && npm test` — currently **416
passing**) and the render-verify-on-sims rule from CLAUDE.md apply to
everything.

## State of play

**Goal of this session: get deployed.** The app is feature-complete for v1 and
there is **no known code-level blocker left on App Store submission**. What
remains is my own hardware/account work plus a short list of fixes.

- Branch `authflow`, last commit `e9f42d5`. **⚠️ ~216 files are UNCOMMITTED** —
  the entire analytics / comp-access / journal-export / Apple-revocation /
  CI / landing-page body of work. **Commit early in this session before doing
  anything risky.** `ios/` is gitignored, so none of the native churn is in
  that count.
- **Migrations 00001–00037 are ALL applied locally.** 00036 (comp access) and
  00037 (apple credentials) were applied by me. Never run migrations yourself;
  new work gets new numbered files I apply.
- The iOS **dev build compiles, installs and runs** with `expo-dev-client`.
  Real app icon and splash verified on device.
- **Superwall was REMOVED** because `SuperwallKit` doesn't compile on Xcode
  26.6 (tested on both 3.12.4 and 4.5.0 — upgrading is not a fix). It blocked
  the entire build. I still need to consciously confirm or reverse that; the
  restore path is documented in `src/services/superwall/client.ts`.

## Do these first, in order

### 1. Fix seven documentation defects I found but did NOT fix

I audited `docs/EDGE_FUNCTIONS.md` and `docs/J1_F3_RUNBOOK.md` line-by-line
against the repo at the end of last session. **B and F are the two that would
actually cost me time mid-deploy.**

`docs/EDGE_FUNCTIONS.md`
- **A** — header (lines ~3–7) still says *"Bexhearts has two edge functions
  today"*. There are **five**. Part 2 was updated; the header wasn't.
- **B** — Part 1 step 3's local `supabase/functions/.env` list has only
  `ANTHROPIC_API_KEY` + the five `R2_*`. **The four `APPLE_*` secrets are
  missing**, so following it leaves `apple-revoke` silently no-opping — and it
  returns HTTP 200, so it looks healthy. (My real `.env` currently has exactly
  those six keys, confirming the gap.)
- **C** — line ~172 says *"edit the two placeholders in **Part 3**"*. There is
  no Part 3. Both placeholders are at the top of `00029` and are still
  unreplaced in the file.
- **D** — Part 2 step 7's migration example stops at `00026`; it should name
  **00036 and 00037** as required for the VPS.

`docs/J1_F3_RUNBOOK.md`
- **E** — the *"⚠️ First: the native project is STALE"* section is now **false**.
  All eight listed deps are integrated (verified in `ios/Podfile.lock`, which
  is current, plus 40 `expo-dev-*` lines). It reads as a blocker I've already
  cleared.
- **F** — the install/launch commands are incomplete now that `expo-dev-client`
  is installed: `simctl launch` lands on the *launcher screen*, not the app.
  Metro must be started first with `--dev-client`, and the working deep link
  isn't documented:
  `xcrun simctl openurl booted "bexhearts://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"`
- **G** — two contradictory social sign-in checklist entries: one ✅ "verified
  2026-07-30", one ☐ "never been verified on-device". Delete the stale one.

### 2. Point the app at my live self-hosted Supabase (Coolify VPS)

It's already running. The app reads `EXPO_PUBLIC_*` **at bundle time**, so a
`.env` change needs a rebuild, not just a reload. I'll paste the env details
when you ask. Walk me through:

1. `EXPO_PUBLIC_SUPABASE_URL` = the **Kong/API gateway** domain (sanity check:
   `curl https://<domain>/rest/v1/` returns JSON, not HTML) and
   `EXPO_PUBLIC_SUPABASE_ANON_KEY` from the Coolify Supabase env.
2. **Apply all 37 migrations on the VPS, in order.** It's a different database;
   nothing local carries over. This is the step that bites people.
3. Auth: `SITE_URL`, `bexhearts://` redirect, email confirmations ON, and
   **ZeptoMail SMTP** — Mailpit doesn't exist on the VPS, so without SMTP
   nobody can sign up.
4. Edge functions: volume copy + container restart per `docs/EDGE_FUNCTIONS.md`
   Part 2 (**not** `supabase functions deploy` — that's cloud-only). All five
   folders. Set secrets incl. the four `APPLE_*`.
5. Enable `pg_cron` + `pg_net`, then the 00029 jobs.
6. Regenerate types against the remote, and **delete the one hand-added line**
   in `src/types/database.ts` (`has_comp_access`, clearly marked) since 00037
   now exists for real.
7. Rebuild.

### 3. Then walk `docs/J1_F3_RUNBOOK.md` top to bottom

Especially **F3·B — buy on partner A's device, confirm partner B is entitled
without buying.** That test decides whether the per-couple billing bet (F2)
actually shipped. If it fails, do not ship.

### 4. Then `docs/APP_STORE.md`

§1 demo account is the hard blocker (a fully-paywalled app is rejected without
one). §6b is the four Apple secrets — the `invalid_client` gotcha is that
**native** Sign in with Apple uses the **bundle ID** as `client_id`, not a
Services ID.

## Things decided or discovered in conversation that are NOT in the docs

- **Do NOT pay for EAS Build.** The "20 minutes to an hour" people complain
  about is mostly *queue* time on the free shared tier. I have a Mac with
  Xcode — local builds have no queue and took ~6 minutes. Use Xcode
  **Product → Archive** for store submission. Revisit EAS only when Android
  ships or CI needs to build.
- **The red `No script URL provided` screen was never a build failure.** A
  Debug build carries no JS bundle; `simctl install`+`launch` doesn't inject
  the Metro URL that `expo run:ios`/Xcode does, and without `expo-dev-client`
  there was no launcher to enter one. Fixed by installing it.
- **Apple + Google sign-in are verified as far as possible without
  credentials.** Both buttons render on the dev build and both reach iOS's own
  system UI (Apple: *"sign in to your Apple Account in Settings"*; Google: the
  `accounts.google.com` consent sheet). **What's left is mine:** sign the
  simulator/device into an Apple ID and a Google account and complete both
  flows. Straight after the Apple one, check
  `SELECT user_id, created_at FROM apple_credentials;` — a row proves the
  revocation pipeline is capturing tokens. Empty means the Apple secrets aren't
  set.
- **Home-screen widgets (E7): post-launch, not now.** A widget is a separate
  Swift mini-program that cannot run RN code or call Supabase — the app writes
  JSON into a shared **App Group** container and the widget reads it. Needs
  `@bacons/apple-targets`, a prebuild, and a device; never works in Expo Go.
  Android is a completely separate Kotlin implementation. ~2–4 days. Strong
  retention lever for a streak app, but it's a native side-project and the
  standing rule is *add no new features pre-launch*.
- **Mascot — I'm choosing from five concepts** (Ember the streak flame, Grace
  the dove, Cord the three-strand braid, Lumen the lantern, Pip the logo with
  a face). Agent recommendation was **Pip** (it *is* the app icon, so every
  appearance reinforces the mark), then **Cord** (Ecclesiastes 4:12 is already
  the welcome-screen hero verse, and loading = the strands braiding). Intended
  placements, best first: **AI prayer composing** (the one genuinely slow
  moment), **empty states** (what App Review sees), the "you're both in for
  today" streak beat, and the post-linking team moment. **Deliberately NOT on
  the paywall** — a cute character beside a price reads as manipulation.
  I'll tell you which one I picked; treat it as a new feature and schedule it
  accordingly.
- **Landing site** (`/Users/Ebuka/Projects/bexheartslandingcodex`) was rebuilt
  last session: the fake CSS phone mockups are gone, replaced by three **real**
  light-mode screenshots in device frames (devotional / date library / prayers,
  all free of personal data), plus download badges linking to `bexoni.com`.
  The badges are **deliberately not Apple's or Google's official artwork** —
  Apple's guidelines forbid recreating their badge, and no listing URL exists
  yet. Swap instructions are in `components/StoreBadges.tsx`; regeneration
  steps in that repo's `docs/APP_SCREENSHOTS.md`. `next build` clean, 28 tests.

## Environment gotchas that will waste time otherwise

- **CocoaPods dies without a UTF-8 locale on this Mac** (`Unicode Normalization
  not appropriate for ASCII-8BIT`). Prefix pod commands with
  `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`, or add `export LANG=en_US.UTF-8` to
  `~/.zshrc`.
- **`pod install` does NOT refresh the app icon or splash** — only
  `npx expo prebuild` regenerates `ios/Bexhearts/Images.xcassets`. A stale
  catalog is how the placeholder icon shipped into the first green build.
- **Don't use `-quiet` on `xcodebuild` when debugging** — it suppresses the
  BUILD SUCCEEDED/FAILED line while a stale `.app` stays on disk, so a failed
  build looks like it worked. Check the binary's timestamp.
- **Never `npx expo run:ios`** — it targets the connected physical iPhone and
  needs signing. Xcode with a Simulator destination, or the `xcodebuild`
  command in the runbook.
- Simulator **text injection drops characters**; taps and swipes are reliable.
- Expo Go must be **fully terminated**, not just reloaded, to pick up a new
  manifest.

## Standing rules

Write migrations for me to run, never run them yourself. Update
PROGRESS/STEPS/HANDOFF **and** the legal docs in the same pass. Analytics
events stay structural-only (`src/features/analytics/schema.ts` is the
enforcement point). Query data must survive `JSON.parse(JSON.stringify(x))`.
End with a summary of what you did, why, and what's next.
