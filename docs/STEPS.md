# STEPS.md — Bexhearts Build Playbook

> **What this file is:** the **HOW & in what ORDER** to build Bexhearts, end to end. `docs/PROGRESS.md` owns the *what & why & status*; this file owns the *sequence*. When an item here is finished, flip its status in `PROGRESS.md` (don't restate status here).
>
> **How to use it:**
> - Work **top to bottom** — steps are dependency-ordered. Don't start a step whose "Depends on" isn't done.
> - Every step is split into **modules**; each module is a *build unit + its unit test*. Tests ship with the module, not later (protocol rule 7).
> - A step is **Done when** `npm run typecheck && npm run lint && npm test` is green **and** its manual check passes.
> - **Migrations:** when a step needs schema, you only *write* `supabase/migrations/0000X_*.sql`. The owner applies it in Supabase Studio (local now, VPS later). Never run it yourself. After it's applied, regenerate types: `supabase gen types typescript --local > src/types/database.ts`.
>
> **👉 Current position (2026-06-18):** Stage A effectively done — **app boots to the sign-in screen in Expo Go** (after the worklets fix + `expo install --fix`; brand purple/cream + square corners applied). **Stage B in progress on `authflow`:** **B1·M1 (encrypted `LargeSecureStore`) ✓ done + tested.** Next: **B1·M2 (email sign-up)**. Still on Expo Go (Path A) — dev build due by B3 (see infra-debt block). Open: A1·M2 (CI), A2 (confirm schema in Studio + regen types).
>
> Stage map: **A** foundation · **B** auth · **C** onboarding/linking · **D** core-loop hardening · **E** engagement layer · **F** monetization · **G** notifications · **H** quality/polish · **I** production backend · **J** release. (Maps to PROGRESS Phases 0→10.)
>
> ## 🚧 OPEN INFRA DEBT — must convert to a Development Build by Step B3
> We are **temporarily on Expo Go** (Path A): aligned `react-native-worklets`→`0.5.1` + patch versions via `expo install --fix` so JS matches Expo Go's native modules, fixing the `Exception in HostFunction` crash. **This is a bridge, not the destination.** Expo Go CANNOT run this app's required native modules — `react-native-mmkv` v3 ("last used"), `react-native-purchases` (RevenueCat), `@superwall/react-native-superwall`, native Apple/Google auth, push. **By Step B3 (social sign-in) we MUST move to a Development Build (Path B):**
> 1. `brew install cocoapods` (not yet installed).
> 2. Dedupe the duplicate `react-native-purchases` (8.12.0 top-level vs 7.28.1 bundled in Superwall) via a package.json `overrides` — verify it doesn't break Superwall's purchase controller.
> 3. `npx expo prebuild --clean` + `npx expo run:ios` (and `run:android`).
> Once on a dev build, restore MMKV for "last used" (B1·M5) instead of the Expo-Go-friendly `expo-secure-store` fallback, and re-pin reanimated/worklets to latest if desired (the dev build compiles exact declared versions, so the Expo Go version-match constraint disappears).

---

## STAGE A — Foundation & "make it run" (PROGRESS Phase 0 + Phase 1 verification)

### Step A1 — Version control & CI baseline
**Goal:** the repo has history and a green CI gate before any feature work.
**Depends on:** nothing.
**Modules:**
- M1 — First git commit on a branch (repo currently has ZERO commits); push to remote.
- M2 — GitHub Actions workflow running `typecheck` + `lint` + `test` on PRs *(verify the workflow goes green)*.
**Verify:** CI passes on a throwaway PR.
**Done when:** commit exists, CI is green.
**Flips in PROGRESS:** Phase 0 — initial commit, CI.

### Step A2 — Local backend up & schema applied
**Goal:** local Supabase is running with the full schema + seed, and the app's env points at it.
**Depends on:** A1. README "Part 2".
**Modules:**
- M1 — `supabase start`; owner applies `00001` + `00002` + `seed.sql` in Studio (or confirms auto-apply); verify all 9 tables + seed rows exist.
- M2 — Fill `.env` with the local anon key; regenerate `src/types/database.ts` from the live DB.
**Verify:** Studio shows tables + 7 devotionals/10 date ideas; `tsc` passes against regenerated types.
**Done when:** schema verified in Studio, types regenerated, no type errors.
**Flips in PROGRESS:** Phase 1 — TS types item.

### Step A3 — App boots & reaches sign-in
**Goal:** `npm start` → app launches and lands on the sign-in screen with no red-screen.
**Depends on:** A2.
**Modules:**
- M1 — `npm start` in its own terminal (Metro is long-running; keep it open). In the dev menu press **`i`** (iOS sim), **`a`** (Android emulator), or scan the **QR** with a physical phone (`w` = web). If the iOS-sim Expo Go download errors (`UND_ERR_SOCKET`), just retry `i`; if it persists, disable any VPN/proxy or use a physical device.
- M2 — Run `npx expo install --fix` to clear the "packages should be updated" warnings (uses Expo's SDK-matched versions, not `npm update`); re-run tests; commit as a small chore. **(Done 2026-06-18.)**
- M3 — Fix any env/build breakage so the sign-in screen renders.
> **Resolved 2026-06-18 — the `Exception in HostFunction` startup crash:** Reanimated 4's Babel plugin is `react-native-worklets/plugin` (was wrongly `react-native-reanimated/plugin` in `babel.config.js`), AND the installed JS `react-native-worklets` (0.8.1) was newer than Expo Go's native (0.5.1) → JSI mismatch. Fix: corrected the Babel plugin + `expo install --fix` pinned worklets→0.5.1 (compatible with reanimated 4.1.7's `0.5 - 0.8` range) + added `.npmrc` `legacy-peer-deps=true` (kills the web-only `react-dom` ERESOLVE). **After any Babel/version change you MUST restart with `npx expo start -c`** (clear cache) or the old bundle keeps crashing. Secondary noise: `posthog-react-native` calls the now-removed `expo-file-system` legacy `writeAsStringAsync` — non-fatal in dev (analytics disabled), clean up later.
**Physical-device note:** a phone can't reach `127.0.0.1` — to use auth/data on a real device, set `EXPO_PUBLIC_SUPABASE_URL` to the Mac's LAN IP and restart with `npx expo start -c`. (For UI eyeballing only, not needed.) Push/RevenueCat/Superwall/native social-auth don't work in Expo Go — those need a dev build (Step J1).
**Verify:** sign-in screen renders (sim and/or physical device).
**Done when:** clean boot; no console errors on the auth route; version warnings cleared.

---

## STAGE B — Auth (PROGRESS Phase 2)
> Auth + onboarding (Stage C) are **ONE user funnel** — build them to feel seamless. Decisions locked 2026-06-17 (see PROGRESS "Auth & onboarding decisions"). Build + unit tests can proceed before A3 is fully green; on-device manual verification waits on the app running. Branch: `authflow`.

### Step B1 — Auth foundation (email/password + secure session + gating)
**Goal:** sign up / sign in / sign out with email, securely-stored persistent sessions, correct route gating, "last used" hint.
**Depends on:** A3 (for manual verify only).
**Modules (each = build + unit test):**
- M1 — Harden the Supabase client → encrypted `LargeSecureStore` (`aes-js` + `expo-secure-store` + `react-native-get-random-values`), replacing plain AsyncStorage in `src/services/supabase/client.ts` *(test: storage wrapper set/get/remove round-trips)*.
- M2 — Email sign-up: form + zod schema + `useAuth.signUp` + error states *(test: schema + hook happy/error with mocked Supabase)*.
- M3 — Email sign-in + sign-out *(test: same pattern)*.
- M4 — Persistent session: confirm `autoRefreshToken`/`persistSession`; session survives app restart; stub a re-auth gate for sensitive actions *(test: store hydration)*.
- M5 — "Last used" hint: persist last sign-in method (MMKV); show a "Last used" tag on that method when returning signed-out *(test: persistence helper)*.
- M6 — Verify route gating in `app/index.tsx` (auth → onboarding → couple → tabs).
**Verify:** sign up fresh → onboarding; kill/reopen → session persists; sign out → sign-in shows "last used".
**Done when:** green + manual flow on a simulator/device.
**Flips in PROGRESS:** Phase 2 — email auth, session, gating, secure storage, "last used".

### Step B2 — Password reset via 6-digit OTP code (closes Bug #3)
**Goal:** reliable mobile password reset with an emailed code — no deep link.
**Depends on:** B1.
**Modules:**
- M1 — Configure the Supabase recovery email template to send `{{ .Token }}` (6-digit code) instead of a magic link *(config; carry to prod in Stage I)*.
- M2 — "Forgot password" → enter email → trigger the code send; switch the existing screen from "sends link" to "sends code" *(test: hook)*.
- M3 — "Enter code + new password" screen → `verifyOtp({ type: 'recovery' })` → `updateUser({ password })` + success/redirect *(test: schema + hook)*.
**Verify:** request reset → read the code from Inbucket (`:55324`) → enter code + new password → sign in with it.
**Done when:** green + reset round-trip works. **Resolves Bug #3** (deep-link approach dropped).
**Flips in PROGRESS:** Phase 2 — OTP reset; removes Bug #3.

### Step B3 — Social sign-in (Apple + Google)
**Goal:** one-tap sign-in with Apple and Google.
**Depends on:** B1. **Native verification needs a dev build (Step J1)** — build the wiring now, verify on the dev build.
**Modules:**
- M1 — Apple sign-in button wired to `authService.signInWithApple()` (iOS) *(test: hook)*.
- M2 — Google sign-in: provider config + button + handler *(test: hook)*.
- M3 — Always show Apple whenever Google is shown (App Store rule); ensure "last used" (B1·M5) covers social methods.
**Verify:** on a dev build, Apple + Google each create/sign-in a user and land in the funnel.
**Done when:** green; wiring complete (manual verify deferred to J1).
**Flips in PROGRESS:** Phase 2 — social sign-in (Apple + Google).

### Step B4 — Account deletion
**Goal:** a signed-in user can permanently delete their account (App Store requirement).
**Depends on:** B1.
**Modules:**
- M1 — Migration: a `delete_my_account()` SECURITY DEFINER RPC (or edge function) that removes the auth user + cascades *(write file; owner applies)*.
- M2 — Settings UI entry + confirm dialog (re-auth per the session decision) + call + sign-out *(test: hook calls RPC, clears stores)*.
**Verify:** delete a test account → user + their rows gone in Studio → app returns to sign-in.
**Done when:** green + verified in Studio.
**Flips in PROGRESS:** Phase 2 — account deletion.

---

## STAGE C — Onboarding & partner linking (PROGRESS Phase 3 — the make-or-break flow)
> **Funnel order (locked 2026-06-17):** Welcome/value → Sign up (Stage B) → Profile (name) → Relationship stage (C1) → 1–2 personalization Qs + plan summary (C1b) → 🔓 **Paywall: 7-day free trial, per-couple** (Superwall; placement here, full wiring in Stage F) → Partner invite/link (C2) → Dashboard. Auth + onboarding are one UX funnel.
> **Solo = a state, not a segment:** single-player-safe features work; two-sided features are locked-until-partner empty states (locked, NOT paywalled). One wall (paywall), one carrot (partner).

### Step C1 — Relationship-stage capture
**Goal:** onboarding records the couple's stage (dating/engaged/married) for stage-aware content + paywalls.
**Depends on:** B1. Positioning block in PROGRESS.
**Modules:**
- M1 — Migration: `relationship_stage` + `stage_started_on` on `couples` *(write file; owner applies; regen types)*.
- M2 — One onboarding screen/question writing it to the couple *(test: schema + write hook)*.
**Verify:** complete onboarding → stage saved on the couple row in Studio.
**Done when:** green + value persisted.
**Flips in PROGRESS:** Phase 1 relationship-stage migration; Phase 3 stage question.

### Step C1b — Personalization + plan summary + paywall placement
**Goal:** capture 1–2 personalization answers, show a personalized plan summary, then trigger the onboarding paywall (free trial).
**Depends on:** C1. Paywall *wiring* is Stage F (per-couple) — here we only place the trigger in the funnel.
**Modules:**
- M1 — 1–2 personalization questions ("what do you want to grow in?") stored on profile/couple *(test: schema + write hook)*.
- M2 — Personalized plan-summary screen ("Here's your couple's journey…").
- M3 — Trigger the Superwall paywall (7-day free trial) at this point; must no-op gracefully when keys are placeholders (dev) so the funnel continues to partner-link.
**Verify:** funnel reaches the paywall after the summary; in dev (no keys) it skips cleanly to partner-link.
**Done when:** green + funnel order correct.
**Flips in PROGRESS:** Phase 3 onboarding funnel + personalization questions.

### Step C2 — Two-user partner linking, end-to-end (the never-run flow)
**Goal:** two real users link into one couple and both see each other.
**Depends on:** C1.
**Modules:**
- M1 — Invite-code collision retry in `createCouple` (catch unique-violation → regenerate) *(test)*.
- M2 — **Solo-mode** (partner not yet linked): single-player-safe features work (devotional + personal reflection, personal prayer, streak); two-sided features show locked-until-partner empty states; gentle resend-invite nudges *(test: gating by `isLinked`)*.
- M3 — Run the full two-user smoke test (README "Part 3").
**Verify:** A generates code → B signs up + enters it → both land on the dashboard showing each other's avatar; RLS lets each read shared data, denies cross-couple.
**Done when:** green + the two-user flow works against local Supabase.
**Flips in PROGRESS:** Phase 3 — E2E verification, collision retry, waiting-for-partner.

### Step C3 — Avatar upload
**Goal:** users can set a profile photo during/after onboarding.
**Depends on:** C2.
**Modules:**
- M1 — Migration: `avatars` storage bucket + RLS *(write file; owner applies)*.
- M2 — Add `expo-image-picker`; upload flow in profile setup writing `avatar_url` *(test: upload helper with mocked storage)*.
**Verify:** pick an image → it uploads → appears on dashboard for both partners.
**Done when:** green + photo visible to partner.
**Flips in PROGRESS:** Phase 1 storage bucket; Phase 3 avatar upload.

---

## STAGE D — Core-loop hardening (PROGRESS Phase 4 — fix bugs + verify against live DB)

### Step D1 — Devotionals (fixes Bug #2)
**Depends on:** C2.
**Modules:**
- M1 — Fix `useCompleteDevotional` upsert → add `onConflict: 'devotional_id,user_id'` *(test: re-complete doesn't throw)*.
- M2 — Verify today/history/detail/complete against live DB.
- M3 — Partner reflection reveal (see partner's reflection once both complete) *(test)*.
**Verify:** both partners complete today's devotional, re-complete without error, each sees the other's reflection.
**Done when:** green + manual flow works.
**Flips in PROGRESS:** Phase 4 devotionals + partner-visibility; removes Bug #2.

### Step D2 — Prayers (+ realtime)
**Depends on:** C2.
**Modules:**
- M1 — Verify list/create/update/delete/answered/archive against live DB.
- M2 — Wire `subscribeToPrayers` in the prayers screen (subscribe + invalidate query on event + cleanup) *(test: subscription handler invalidates)*.
**Verify:** partner A adds a prayer → appears on partner B's device live (two simulators).
**Done when:** green + live cross-device update works.
**Flips in PROGRESS:** Phase 4 prayers + part of realtime wiring.

### Step D3 — Check-ins (fixes Bug #1)
**Depends on:** C2.
**Modules:**
- M1 — Migration: UPDATE RLS policy on `check_ins` *(write file; owner applies)*.
- M2 — Fix `useSubmitCheckIn` upsert → `onConflict: 'couple_id,user_id,week_of'` *(test: resubmit updates, doesn't throw)*.
- M3 — Verify weekly form + 12-week history; partner comparison once both submit.
**Verify:** submit, then resubmit the same week → updates cleanly; partner sees comparison after both submit.
**Done when:** green + resubmit + comparison work.
**Flips in PROGRESS:** Phase 1 check_ins UPDATE policy; Phase 4 check-ins; removes Bug #1.

### Step D4 — Boundaries
**Depends on:** C2.
**Modules:** M1 — Verify list/create/update (boundary|temptation) against live DB *(test on hook)*.
**Verify:** create both types; partner sees them.
**Done when:** green + verified.
**Flips in PROGRESS:** Phase 4 boundaries.

### Step D5 — Dates
**Depends on:** C2.
**Modules:** M1 — Verify browse-by-category → save → complete with rating/notes *(test on hooks)*.
**Verify:** save an idea, complete it with a rating; both partners see it in couple dates.
**Done when:** green + verified.
**Flips in PROGRESS:** Phase 4 dates.

### Step D6 — Streak engine (fixes Bug #4)
**Goal:** the couple streak actually increments/resets.
**Depends on:** D1 (and the daily-engagement signal).
**Modules:**
- M1 — Migration: a DB function/trigger that updates `couples.streak_count` / `streak_last_date` when both partners complete the day's action (last_date = yesterday → +1; = today → noop; gap → reset to 1) *(write file; owner applies)*.
- M2 — Tests for `getWeekOf` + the date helpers the logic relies on.
- M3 — Ensure the dashboard reads the live streak (hydrate from couple row).
**Verify:** simulate two consecutive days of joint completion → streak shows 2; skip a day → resets.
**Done when:** green + streak behaves over simulated days.
**Flips in PROGRESS:** Phase 1 streak engine; Phase 4 streak; removes Bug #4; Phase 7 date-helper tests.

### Step D7 — Remaining realtime + couple updates
**Depends on:** D2.
**Modules:** M1 — Wire `subscribeToDevotionalProgress` + `subscribeToCoupleUpdates` (invalidate on event, cleanup) *(test)*.
**Verify:** partner completing a devotional / streak changing reflects live on the other device.
**Done when:** green + live updates verified.
**Flips in PROGRESS:** Phase 4 realtime; empty-states verified.

> **✅ Milestone — the core loop works.** After D7, the depth core is verified end-to-end against a live DB. This is the right point to consider an internal TestFlight/Play build for yourself.

---

## STAGE E — Engagement layer (PROGRESS Phase 4B)
> Each step: schema migration (write file; owner applies; regen types) → `src/api/` hook → UI → tests. Build in this order; the daily question is highest-leverage.

### Step E1 — Daily question (answer privately → reveal)
**Depends on:** D1 (reuses the partner-reveal pattern).
**Modules:**
- M1 — Migration: `daily_questions` content + `daily_question_responses` *(write; owner applies)*.
- M2 — `src/api/daily-questions.ts` hooks (today's question, submit, reveal-when-both) *(test)*.
- M3 — UI: answer privately → unlock on both-submitted + realtime.
**Verify:** both answer separately → answers reveal to each other only after both submit.
**Done when:** green + reveal gating works across two devices.
**Flips in PROGRESS:** Phase 4B daily question.

### Step E2 — Daily mood share
**Depends on:** C2.
**Modules:** M1 — Migration: `moods` (one row/user/day). M2 — hook + one-tap UI + dashboard surface *(test)*.
**Verify:** set mood → partner sees it; one row per day (re-tap updates).
**Done when:** green + verified.
**Flips in PROGRESS:** Phase 4B mood.

### Step E3 — "Praying for you" tap
**Depends on:** **G1** (ad-hoc push sending).
**Modules:** M1 — button → send Expo push to partner's `push_token` *(test: send helper called with partner token)*.
**Verify:** tap → partner's device receives the push.
**Done when:** green + push received on a physical device/dev build.
**Flips in PROGRESS:** Phase 4B praying-for-you.

### Step E4 — Couple challenges
**Depends on:** D1.
**Modules:** M1 — Decide reuse `date_ideas.is_challenge` vs dedicated `challenges` + `couple_challenge_progress` migration. M2 — hooks + multi-day progress UI *(test)*.
**Verify:** start a 7-day challenge → progress persists per day for the couple.
**Done when:** green + multi-day progress works.
**Flips in PROGRESS:** Phase 4B challenges.

### Step E5 — Milestones & countdowns
**Depends on:** C1.
**Modules:** M1 — Migration: `couple_milestones`. M2 — hook + add/edit UI + dashboard countdown *(test)*. (Reminders depend on **G2**.)
**Verify:** add an anniversary → countdown shows on dashboard.
**Done when:** green + countdown renders.
**Flips in PROGRESS:** Phase 4B milestones.

### Step E6 — Memories timeline
**Depends on:** D1–D5.
**Modules:** M1 — `src/api/memories.ts` assembling answered prayers + completed devotionals + dates (+ photos) *(test)*. M2 — timeline UI.
**Verify:** completed items appear chronologically in "our story".
**Done when:** green + feed renders from real data.
**Flips in PROGRESS:** Phase 4B memories.

### Step E7 — Home-screen widget (feasibility-gated)
**Depends on:** D6.
**Modules:** M1 — **Spike first:** confirm Expo widget feasibility (config plugin / native module). If too costly, defer to v1.x and note it. M2 — Widget: verse + streak + "partner just prayed".
**Verify:** widget shows live values on a dev build.
**Done when:** green + widget renders, OR a documented decision to defer.
**Flips in PROGRESS:** Phase 4B widget.

---

## STAGE F — Monetization (PROGRESS Phase 5)

### Step F1 — Gating model
**Depends on:** Stages D + E (the things being gated must exist).
**Modules:** M1 — Implement the content-volume gating decision (free vs premium split) consistently across devotionals/questions/challenges/check-ins/boundaries/comparisons/memories *(test: gate logic)*.
**Verify:** a free account hits the intended walls; premium unlocks them.
**Done when:** green + gates behave per the decided split.
**Flips in PROGRESS:** Phase 5 gating items.

### Step F2 — Store + RevenueCat/Superwall config
**Depends on:** F1.
**Modules:** M1 — Create products in App Store Connect / Play Console; configure RevenueCat entitlement `premium` + Superwall campaigns; put real keys in env.
**Verify:** offerings load on a dev build.
**Done when:** offerings + paywall render with real config.
**Flips in PROGRESS:** Phase 5 dashboard config.

### Step F3 — Purchase E2E + restore
**Depends on:** F2, **J1** (dev build).
**Modules:** M1 — Sandbox purchase round-trip; M2 — restore-purchases UI in Settings *(test: restore hook)*.
**Verify:** sandbox buy unlocks premium; restore works on a reinstall.
**Done when:** green + sandbox purchase + restore verified.
**Flips in PROGRESS:** Phase 5 purchase test + restore UI.

---

## STAGE G — Notifications (PROGRESS Phase 6)

### Step G1 — Ad-hoc push sending
**Goal:** the app can send a push *now* (powers "praying for you" + partner-completed nudges).
**Depends on:** B1 (tokens already registered).
**Modules:** M1 — Send via Expo Push API to a partner's token (a small helper / edge function) *(test: payload + target)*.
**Verify:** trigger a send → partner device receives it.
**Done when:** green + push received.
**Flips in PROGRESS:** Phase 6 sending (ad-hoc part).

### Step G2 — Scheduled notifications
**Depends on:** **I1** (needs a scheduler on the VPS).
**Modules:** M1 — pg_cron + edge function (or worker) for: daily devotional reminder, weekly check-in reminder, streak-about-to-break warning, milestone reminders.
**Verify:** scheduled job fires at the configured time in a staging env.
**Done when:** jobs fire reliably in staging.
**Flips in PROGRESS:** Phase 6 scheduled sending.

### Step G3 — Notification preferences
**Depends on:** G1.
**Modules:** M1 — Per-type opt-out in Settings, persisted to profile *(test)*.
**Verify:** disabling a type stops that push.
**Done when:** green + prefs respected.
**Flips in PROGRESS:** Phase 6 preferences.

---

## STAGE H — Quality & polish (PROGRESS Phase 7 + 8)

### Step H1 — Test backfill
**Depends on:** Stage D.
**Modules:** M1 — API-hook tests with a mocked Supabase client; M2 — component tests for the 4 main forms (sign-up, profile setup, check-in, prayer).
**Done when:** coverage of the critical paths is green.
**Flips in PROGRESS:** Phase 7 hook + component tests.

### Step H2 — Error/offline + crash reporting
**Modules:** M1 — Global offline banner via `useNetworkStatus`; consistent mutation-error surfacing; M2 — Sentry (graceful no-op without a key).
**Done when:** offline state is visible, errors are consistent, crashes report in a build.
**Flips in PROGRESS:** Phase 7 error/offline + Sentry.

### Step H3 — UI/UX polish
**Depends on:** core loop verified (Stage D).
**Modules:** loading skeletons · pull-to-refresh · haptics · reanimated animations · (optional) dark mode · accessibility pass · real app icon + splash.
**Done when:** polish items shipped; a11y checked.
**Flips in PROGRESS:** Phase 8 items.

---

## STAGE I — Production backend on VPS/Coolify (PROGRESS Phase 9)

### Step I1 — Deploy Supabase (Coolify)
**Modules:** M1 — Coolify Supabase service; HTTPS domain; strong `POSTGRES_PASSWORD`/`JWT_SECRET`.
**Done when:** the hosted API + Studio are reachable over HTTPS.

### Step I2 — Schema + content on the VPS
**Modules:** M1 — Owner applies every `supabase/migrations/` file in order, then real content, via the hosted Studio.
**Done when:** prod DB matches the repo's migrations; real content seeded.

### Step I3 — Auth for production
**Modules:** SMTP (Resend/Postmark); decide email confirmation + deep links; set `site_url` + redirect allow-list to `bexhearts://`.
**Done when:** real signup/reset emails send and links resolve.

### Step I4 — Backups + envs
**Modules:** automated backups (pg_dump/Coolify schedule); staging vs prod strategy; EAS production env vars (URL + anon key).
**Done when:** backups run; EAS builds point at prod.
**Flips in PROGRESS:** Phase 9 items.

---

## STAGE J — Release (PROGRESS Phase 10)

### Step J1 — EAS + dev builds + native verification
**Modules:** `eas init` → real projectId in `app.config.ts`; dev builds both platforms; verify **push, purchases, Apple Sign-In** (all untestable in Expo Go).
**Done when:** native features verified on real builds. *(Unblocks F3, E3, E7.)*

### Step J2 — Real content packs
**Modules:** stage-aware devotional + date-idea + challenge + daily-question packs for dating / engaged-premarital / newlywed.
**Done when:** enough launch content for each stage.

### Step J3 — Legal + store assets
**Modules:** hosted privacy policy + terms (replace placeholders in `src/constants/app.ts`); screenshots, app preview, metadata; confirm account-deletion present.
**Done when:** store listings complete + review-ready.

### Step J4 — Beta with real couples
**Modules:** TestFlight + Play internal testing; gather feedback; fix blockers.
**Done when:** a beta round completed with real couples.

### Step J5 — Submit
**Modules:** production builds; `eas submit` both stores; respond to review.
**Done when:** approved + live.
**Flips in PROGRESS:** Phase 10 items.

---

*Created 2026-06-13. Keep in sync with `docs/PROGRESS.md` (statuses) and `docs/MARKETING.md` (go-to-market) per the cross-update rule in `CLAUDE.md`/`AGENTS.md`.*
