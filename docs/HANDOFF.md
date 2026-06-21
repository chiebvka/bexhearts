# HANDOFF — paste this into a new chat to resume Bexhearts

> **Purpose:** bootstrap a fresh AI session (or a new chat when the context window fills). This is a pointer + running notes, NOT the source of truth. Keep it updated as work progresses. Last updated: **2026-06-21**.

## 1. Read these first (in order)
1. **`CLAUDE.md`** (root) — agent protocol + the doc index + cross-update rule. (`AGENTS.md` is the identical mirror for Codex/Antigravity.)
2. **`docs/PROGRESS.md`** — WHAT & WHY + status (positioning, features, phases, decisions, known bugs). The source of truth.
3. **`docs/STEPS.md`** — HOW & in what ORDER. **Its "👉 Current position" marker tells you exactly where we are and what's next.**
4. **`docs/MARKETING.md`** — go-to-market (only when doing marketing).
5. **`README.md`** — how to run the app + local Supabase.

## 2. What Bexhearts is (one paragraph)
A subscription **mobile app (Expo/React Native + Supabase)** for **Christian couples** — daily devotionals, shared prayer journal, weekly check-ins, boundaries, date ideas, streaks, plus a "daily-touch" engagement layer (daily question, mood, "praying for you", challenges, milestones, memories). Positioning is **faith-forward**, beachhead audience **dating → engaged → newlywed**. Monetization: **free trial → hard paywall, billing per-COUPLE** (invited partner inherits, never a second paywall). Solo is a *state, not a segment*.

## 3. Where we are NOW (update this as we go)
- **Branch:** `authflow` (off `dev` off `main`). Many commits; push when asked.
- **Stage B (Auth):** **B1 (auth foundation) is COMPLETE** — M1 encrypted `LargeSecureStore`; M2 email sign-up + 6-digit OTP confirmation (app + `confirm-signup.html`, `enable_confirmations = true`); M3 sign-in hardening + password eye toggle + `BackButton`; M4 persistent session (AppState auto-refresh + `reauthenticate` stub); M5 "last used" hint (AsyncStorage) + `SignOutLink` on onboarding; M6 route gating verified.
- **Verified in the iOS simulator:** sign-up → OTP email in Mailpit → verify → onboarding. Sign-out lives on the Profile tab (+ a link on onboarding).
- **B2 (password reset via OTP) ✓** — enumeration-safe forgot-password → code screen → set new password; recovery template `reset-password.html` + config; **Bug #3 resolved**. (Restart Supabase to load the recovery template.)
- **NEXT: B3 (social sign-in — Apple + Google).** Needs the **development build** (Path B) + Apple/Google credentials. **Owner is working through `docs/B3-SETUP.md`** (dev build steps + account/credential creation + bring-back checklist). When the owner returns with credentials + a working dev build, the agent: gets the dev build running (CocoaPods, dedupe RevenueCat, `expo prebuild`/`run:ios`), then wires Apple + Google (`signInWithIdToken`), records `setLastUsedMethod('apple'|'google')`. Then **B4 (account deletion)** → **Stage C (onboarding/partner-linking)**.
- **To resume B3:** read `docs/B3-SETUP.md` §"Notes for the wiring agent" + the owner's filled bring-back checklist.

## 4. Critical environment facts (don't relearn the hard way)
- **Running on Expo Go (Path A).** `react-native-worklets` is pinned to **0.5.1** to match Expo Go's native module (do not bump). **🚧 We MUST switch to a Development Build by Step B3** (see the infra-debt block in STEPS.md) — Expo Go CANNOT run `react-native-mmkv` v3, RevenueCat, Superwall, or native Apple/Google auth.
- **Do NOT import `src/lib/storage.ts` (MMKV) until the dev build** — it crashes Expo Go. Use `expo-secure-store`/AsyncStorage instead.
- **After any babel/native/config change, restart Metro with `npx expo start -c`** (plain reload won't pick it up).
- **Local Supabase ports:** API `55321`, DB `55322`, Studio `55323`, **Mailpit (email inbox) `55324`**. `.env` uses the **publishable key** (`sb_publishable_...`) as `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- **Email confirmation is ON locally** → every signup needs the OTP code from Mailpit (`http://127.0.0.1:55324`). Local "from" is a default `admin@email.com`; production fixes it via ZeptoMail SMTP.
- **Tests/gate:** `npm run typecheck && npm run lint && npm test` must pass before any task is done. Migrations are **written only** (never run); owner applies them in Studio.

## 5. Locked decisions worth remembering
- Auth: Apple + Google + email, "last used" hint; persistent session; **password reset & signup confirmation use 6-digit OTP codes, NOT deep links** (resolves Bug #3).
- Email: auth via **Supabase Custom SMTP → ZeptoMail** (US `smtp.zeptomail.com`, sender `noreply@auth.bexhearts.com`); transactional via **Supabase Edge Functions + `fetch`** (Phase 6, no app package); subdomains `auth` / `notifications` / `marketing`.
- Design: **buttons & inputs have NO border radius** (square corners); brand **purple `#9849FA`** + cream `#F8F4EC`; dark mode is documented (PROGRESS Phase 8) but not built.

## 6. How to use this file
When resuming: read §1's files, then check `docs/STEPS.md`'s current-position marker. Update §3 here whenever a step completes, and refresh "Last updated" at the top.
