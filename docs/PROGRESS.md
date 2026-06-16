# PROGRESS.md — Bexhearts Build Tracker

> ## ⚠️ Protocol for AI agents (Claude, Codex, Antigravity, etc.) and humans
>
> This file is the **single source of truth** for project state. Whenever you are asked to create a todo list, plan work, or implement anything:
>
> 1. **Read this file first.** Find which phase/item the requested work belongs to. If the request doesn't map to an existing item, add it to the right phase (or the Backlog) before starting.
> 2. **Respect the order.** If a requested task depends on an earlier unfinished item (e.g. building UI for a flow whose API is broken), flag the dependency before proceeding.
> 3. **Update statuses when you finish work** — change `[ ]`/`[~]` to `[x]`, and remove fixed items from Known Bugs. Add newly discovered bugs to Known Bugs with file references.
> 4. **Never run database migrations against any environment.** Migrations are applied manually by the owner via Supabase Studio (local and VPS). Your job ends at writing the numbered file in `supabase/migrations/`.
> 5. **Schema changes are append-only.** New numbered migration file every time; never edit applied migrations.
> 6. Functionality first, polish later: the current priority is making every flow in Phases 3–5 **and the Phase 4B engagement layer** actually work end-to-end before any visual/UI-library work (Phase 8).
> 7. **Tests ship with the work, not after.** Every feature or bugfix includes unit tests for its logic (API hooks, utils, stores, schemas) in `__tests__/`, and `npm run typecheck && npm run lint && npm test` must pass before the task is considered done. Phase 7 tracks the backfill of existing gaps; new code never adds to that backlog.
>
> Status legend: `[x]` done & verified · `[~]` partially done (see note) · `[ ]` not started

---

## What Bexhearts is

A subscription mobile app for **Christian couples** to grow their relationship and faith together. One couple = two linked users. Core loop: do something together daily/weekly, keep the streak alive.

**Positioning (locked 2026-06-10, owner decision — do not relitigate):**
- **Faith-forward, unapologetically.** Scripture-led devotionals and prayer are the center of the product, not a flavor. We are NOT a secular couples app with a Christian skin; we own the underserved "app for Christian couples" niche (vs. Paired/Couply/Love Nudge in the secular lane). A secular sibling app is a possible LATER spin-off from the same codebase + different content pack — out of scope until this app has product-market fit.
- **Beachhead audience: the dating → engaged → newlywed journey.** Functionality serves all couples; marketing, ASO, and the first content packs target these three stages with stage-specific messaging (e.g. "christian dating boundaries", "christian premarital", "newlywed devotional") all funneling into the one app.
- **Product implication:** onboarding must ask relationship stage (dating / engaged / married + duration), stored on the couple, so devotional/date/boundary content can be stage-relevant and paywalls stage-targeted. See Phase 3 item and the migration note in Phase 1.

**Pillars — two layers:**

*Depth core (the moat — mostly built):*
1. **Daily devotionals** — scripture + reflection + a "couple action"; both partners complete it, can share reflection responses.
2. **Shared prayer journal** — either partner adds prayers; mark answered; realtime sync between partners.
3. **Weekly check-ins** *(premium)* — each partner rates emotional/spiritual/communication connection 1–5 + gratitude/growth/prayer notes; compare over time.
4. **Boundaries & temptations** *(premium)* — shared accountability commitments with action plans.
5. **Date ideas** — curated library with cost/duration/scripture tie; save, complete, rate.
6. **Streaks** — couple-level streak for consecutive daily engagement.

*Engagement layer (the daily-touch "connective tissue" — NEW, from the 2026-06-13 competitive analysis of Couple Joy + Cozy; built in Phase 4B):*
7. **Daily question (answer privately → reveal)** — a faith+relationship prompt both answer separately, then unlock each other's answer; tied to the day's devotional. *(Couple Joy's core loop, faith-themed — the single highest-leverage add.)*
8. **Home-screen widget** — verse of the day + couple streak + "partner just prayed".
9. **"Praying for you" tap** — one tap sends the partner a "🙏 praying for you right now" push.
10. **Couple challenges** — themed multi-day plans (7-day prayer challenge, 30 days of gratitude); a premium + virality lever.
11. **Milestones & countdowns** — anniversary, engagement-versary, baptism/faith milestones.
12. **Daily mood share** — one-tap emoji "spiritual + emotional weather"; feeds the widget and the praying-for-you moment. Kept deliberately lightweight so it does NOT compete with the weekly check-in (different cadence + depth).
13. **Memories timeline** — "our story" feed assembling answered prayers + completed devotionals + completed dates + photos.

*Business:*
14. **Monetization** — free tier + premium (RevenueCat entitlement `premium`, Superwall paywalls). Leaning toward gating **content volume** (full history, all challenges, unlimited daily questions, partner-comparison views, memories) over gating whole features — faith audiences pay for *more of the thing they came for* (cf. Hallow, Couple Joy's unlimited-questions paywall). See Phase 5.

**Deliberately OUT of scope (do NOT build — from the same 2026-06-13 analysis):** virtual pet/plant/home + stars economy (Cozy), generic games (Never Have I Ever / Would You Rather), in-app couple chat, distance/LDR tracking, doodle sharing. *(One narrow exception parked in Backlog: a single "faith garden" streak visual — a reward, not an economy.)*

**Release scope:**
- **v1.0 (launch):** the full depth core + the entire engagement layer above, all verified working.
- **v1.x fast-follow (first 4–8 weeks post-launch):** expansion/polish of those — more challenge packs, the faith-garden streak visual, deeper comparison views. The line exists to stop scope creeping *past* it, not to cut anything from v1.0.

**Architecture rules of the road:**
- All Supabase table access goes through hooks in `src/api/` (TanStack Query). Screens never call `supabase.from()` directly.
- Auth/session → `src/stores/auth.store.ts`; couple context → `src/stores/couple.store.ts`; both hydrated by `src/providers/AuthProvider.tsx`.
- Cross-partner data isolation is enforced by RLS using `public.get_my_couple_id()` — every couple-scoped table policy depends on it.
- Paid SDKs (RevenueCat/Superwall/PostHog) are wrapped in `src/services/` and silently no-op when env keys are placeholders, so local dev never needs them.

---

## Phase 0 — Project foundation
- [x] Expo SDK 54 + TypeScript + Expo Router scaffold (`app/`, `app.config.ts`)
- [x] Path alias `@/* → src/*`, ESLint, Jest configured
- [x] Folder architecture (api / components / features / services / stores / theme)
- [x] `.env.example` with all required vars; placeholder-detection so missing paid keys don't crash
- [x] **Initial git commit** — done 2026-06-13; pushed to `github.com/chiebvka/bexhearts` (`main`).
- [ ] CI (GitHub Actions: typecheck + lint + test on PR)

## Phase 1 — Database & backend
- [x] Initial schema migration `supabase/migrations/00001_initial_schema.sql` — 9 tables (profiles, couples, devotionals, devotional_progress, prayers, check_ins, boundaries, date_ideas, couple_dates), `handle_new_user` trigger, `updated_at` triggers, `get_my_couple_id()` helper, `link_partner()` RPC, RLS on every table, realtime publication for prayers/devotional_progress/couples
- [x] Migration `00002_restrict_invite_lookup.sql` — invite codes only resolvable via the `link_partner` RPC
- [x] Seed data (`supabase/seed.sql`) — 7 sample devotionals, 10 date ideas
- [x] Local stack config (`supabase/config.toml`, custom ports 55321–55324, email confirmation off for dev)
- [~] TypeScript DB types — `src/types/database.ts` is hand-written to match schema; regenerate via `supabase gen types typescript --local` once local DB is up and treat generated output as authoritative
- [ ] **Missing UPDATE RLS policy on `check_ins`** (needed for resubmitting the weekly check-in — see Bug #1)
- [ ] **Streak engine** — `couples.streak_count` / `streak_last_date` exist and the UI displays them, but NOTHING ever updates them. Needs a DB function/trigger (e.g. on `devotional_progress` insert: if both partners completed today and last_date = yesterday → increment; if gap → reset) — new migration file
- [ ] Storage bucket + RLS for avatars (`avatar_url` column exists; no bucket, no upload path)
- [ ] **Relationship stage** — new migration: `relationship_stage` (`dating` | `engaged` | `married`) + `stage_started_on` (date) on `couples`; stage tags on `devotionals`/`date_ideas` content (the existing `category` columns may suffice — decide when writing it). Powers stage-relevant content + paywall targeting (see Positioning)
- [ ] **Engagement-layer schema** (new migration(s), for the Phase 4B features — design table-by-table when building each step, couple-scoped RLS via `get_my_couple_id()` like existing tables): `daily_questions` content + `daily_question_responses` (answer-then-reveal); `moods` (one row per user per day); `couple_milestones` (label, date, recurring flag); `challenges` content + `couple_challenge_progress` (or reuse `date_ideas.is_challenge` — decide); "praying for you" can be push-only (no table needed)
- [ ] Server-side premium enforcement (optional hardening: `is_premium` devotionals/date_ideas are currently readable by any authenticated user; gating is client-only)
- [ ] `couples.subscription_tier` is never synced from RevenueCat (needs webhook → edge function, or drop the column and rely on RevenueCat alone)

## Phase 2 — Auth & session
- [x] Email/password sign-up, sign-in, sign-out (`src/features/auth/`, `authService`)
- [x] Session persistence + auth state listener + store hydration (`AuthProvider`)
- [x] Route gating in `app/index.tsx`: unauthenticated → sign-in; no profile → onboarding; no couple → partner-invite; else → tabs
- [x] Forgot-password screen sends reset email
- [~] Apple Sign-In — `authService.signInWithApple()` + config plugin exist; no UI button wired into the sign-in screen; untestable until a dev build exists
- [ ] **Password reset deep-link handler** — reset email redirects to `bexhearts://reset-password` but no such route exists in `app/`; the link goes nowhere (see Bug #3)
- [ ] Secure session storage — swap plain AsyncStorage for the encrypted LargeSecureStore pattern (aes-js + expo-secure-store) per Supabase docs. Pre-launch requirement, not a dev blocker
- [ ] Account deletion (App Store REQUIRES this for apps with accounts)

## Phase 3 — Onboarding & partner linking (the make-or-break flow)
- [x] Welcome → profile setup (name, denomination) → sets `onboarding_completed`
- [x] Invite code generation (collision-safe charset, 48h expiry) + couple row creation (`useInviteCode`)
- [x] Partner linking via `link_partner` RPC with self-link/already-linked guards (`usePartnerLink`)
- [x] Share/copy invite code UI
- [ ] **End-to-end verification with two real users against local Supabase** — never been run; do this before anything else once the stack is up
- [ ] Handle the "waiting for partner" state gracefully (partner A generated a code but B hasn't joined: A can use the app solo, but partner-dependent UI should degrade)
- [ ] Invite code collision retry (`createCouple` would throw on the rare unique-violation; catch & regenerate)
- [ ] Avatar upload during profile setup (needs Phase 1 storage bucket + `expo-image-picker` — not yet a dependency)
- [ ] Relationship-stage question in onboarding (dating / engaged / married + how long) — stored on the couple; depends on the Phase 1 relationship-stage migration. Keep onboarding ≤1 extra screen

## Phase 4 — Core features (all CRUD wired; none verified against a live DB)
- [x] **Devotionals** — today's devotional, history (30 days), detail screen, complete-with-reflection (`src/api/devotionals.ts`) — *has Bug #2*
- [x] **Prayers** — list/create/update/delete, answered toggle, archive flag (`src/api/prayers.ts`)
- [x] **Check-ins** — weekly form (3 ratings + 3 text fields), history of 12 weeks (`src/api/check-ins.ts`) — *has Bug #1*
- [x] **Boundaries** — list/create/update with type boundary|temptation (`src/api/boundaries.ts`)
- [x] **Dates** — browse ideas by category, save to couple, complete with rating/notes (`src/api/dates.ts`)
- [x] **Dashboard** — greeting, both avatars, streak counter, quick actions, today's devotional card
- [ ] **Smoke-test every flow above against local Supabase** and fix what breaks (RLS denials, column mismatches, etc.)
- [ ] Wire up realtime — `src/services/supabase/realtime.ts` defines `subscribeToPrayers` / `subscribeToDevotionalProgress` / `subscribeToCoupleUpdates` but **nothing calls them**; partner updates currently appear only on refetch
- [ ] Partner visibility moments (see partner's reflection after both complete; see partner's check-in after both submit — the "comparison" view)
- [ ] Empty states verified for all lists (components exist; verify with real empty DB)

## Phase 4B — Engagement & connection layer (NEW — competitive analysis 2026-06-13; none built yet)
> The "daily-touch" features that give Bexhearts Couple-Joy/Cozy-level stickiness on top of the depth core. All v1.0. Each needs: schema (Phase 1 engagement-layer migration), an `src/api/` hook, UI, and tests. Build order is set in `docs/STEPS.md`.
- [ ] **Daily question (answer privately → reveal)** — same daily faith+relationship prompt to both; answer separately; unlock each other's answer once both submit. Reuses the partner-visibility pattern from Phase 4. *Highest-leverage add (Couple Joy's core loop).*
- [ ] **Daily mood share** — one-tap emoji per partner per day; lightweight; feeds the widget + praying-for-you. Keep distinct from the weekly check-in (different cadence/depth).
- [ ] **"Praying for you" tap** — one tap → push to partner ("🙏 praying for you right now"). Tiny build, high emotional payoff. Depends on push *sending* (Phase 6).
- [ ] **Couple challenges** — themed multi-day plans (7-day prayer, 30 days gratitude); content-driven; premium + shareable. `date_ideas.is_challenge` already exists — decide reuse vs a dedicated `challenges` model.
- [ ] **Milestones & countdowns** — anniversary, engagement-versary, baptism/faith dates; surfaced on the dashboard + as notifications.
- [ ] **Home-screen widget** — verse of the day + streak + "partner just prayed". Native iOS/Android widget (needs a config plugin; **bigger lift — confirm Expo feasibility before committing**, may slip to v1.x).
- [ ] **Memories timeline** — "our story" feed assembling answered prayers + completed devotionals + completed dates + photos. Mostly assembly of existing data; low backend cost.

## Phase 5 — Monetization
- [x] RevenueCat wrapper: init, identify, entitlement check, offerings, restore (`src/services/revenuecat/`)
- [x] Superwall wrapper: init, trigger paywall by event, identify/reset (`src/services/superwall/`)
- [x] `PremiumGate` component wraps gated screens (check-ins, boundaries) with paywall events
- [x] `useEntitlement` / `useOfferings` hooks
- [ ] Create products in App Store Connect / Play Console; configure RevenueCat dashboard (entitlement `premium`) + Superwall campaigns
- [ ] Real keys in env; end-to-end sandbox purchase test on a dev build
- [ ] Decide & enforce the free/premium feature split consistently (currently: check-ins + boundaries gated; devotional/date `is_premium` flags exist but are not enforced anywhere)
- [ ] **Shift the gating model toward content-volume gating** (decision 2026-06-13): candidate split — free = today's devotional + limited daily questions + basic widget; premium = full history, all challenges, unlimited questions, partner-comparison views, memories. Faith audiences convert better on "more of the thing" than on locked features. Reconcile with the check-ins+boundaries gating above and the Phase 4B features
- [ ] Restore purchases surfaced in Profile/Settings UI
- [ ] **Install attribution + funnel analytics** — wire store/TikTok acquisition source into PostHog so marketing can see which content drives install → couple-linked → trial → paid (required by `docs/MARKETING.md` M0). Today PostHog tracks in-app events but not acquisition source.

## Phase 6 — Notifications & engagement
- [x] Push token registration + permission flow + token saved to profile (`src/services/notifications/`)
- [x] Notification response listeners scaffold (`handlers.ts`)
- [ ] **Sending side doesn't exist** — nothing ever sends a push. Needs scheduled jobs (pg_cron + edge function on VPS, or a tiny worker) for: daily devotional reminder, partner-completed nudge, weekly check-in reminder, streak-about-to-break warning
- [ ] Notification preferences (per-type opt-out) in Settings

## Phase 7 — Quality & testing
- [x] Jest infra: native-module mocks (`__tests__/setup/jest.setup.ts`), `renderWithProviders` helper
- [x] Unit tests: auth store, couple store, invite-code utils
- [ ] Tests for `getWeekOf` / date helpers (streak & check-in correctness depends on them)
- [ ] API hook tests with mocked Supabase client (the upsert bugs below would have been caught)
- [ ] Component tests for the 4 main forms (sign-up, profile setup, check-in, prayer)
- [ ] Error/offline handling pass: `useNetworkStatus` exists but no global offline banner; mutation errors surfaced inconsistently (some toasts, some inline)
- [ ] Sentry (or similar) crash reporting — currently zero crash visibility in production

## Phase 8 — UI/UX polish (only after Phases 3–5 verified working)
- [x] Design tokens (`src/theme/`), shared primitives (Button, Card, Input, Avatar, Badge, EmptyState, ErrorBoundary…)
- [ ] Decision: stick with the hand-rolled component kit vs adopt a UI library — **recommendation: stick with what exists**, it's consistent and complete enough; revisit only if a specific need appears
- [ ] Loading skeletons, pull-to-refresh, haptics pass, animations (reanimated is installed, unused)
- [ ] Dark mode (theme tokens are light-only; `userInterfaceStyle: 'light'` currently forced)
- [ ] Accessibility pass (labels, touch targets, dynamic type)
- [ ] Real app icon + splash (current assets are defaults)

## Phase 9 — Production backend (VPS / Coolify)
- [ ] Deploy Supabase via Coolify; HTTPS domain; strong secrets
- [ ] Apply migrations + production seed content via VPS Studio (manual, owner-run)
- [ ] SMTP for auth emails; decide on email confirmation + deep links
- [ ] Backups (automated pg_dump or Coolify backup schedule) — non-negotiable before real users
- [ ] Production env vars in EAS (URL + anon key per environment)
- [ ] Staging vs production strategy (even just two Coolify Supabase instances)

## Phase 10 — Release
- [ ] `eas init` → real projectId in `app.config.ts`
- [ ] Dev builds both platforms; verify native features (push, purchases, Apple Sign-In)
- [ ] Real devotional/date-idea content (seed data is 7 days/10 ideas of sample copy) — built as stage-aware packs per the positioning: dating, engaged/premarital, newlywed
- [ ] Privacy policy + Terms hosted at real URLs (constants in `src/constants/app.ts` point to placeholders)
- [ ] App Store assets, screenshots, review-readiness (incl. account deletion from Phase 2)
- [ ] TestFlight + Play internal testing round with real couples
- [ ] Submit

---

## 🐛 Known bugs (verified by code reading, not yet fixed)

1. **Weekly check-in resubmission fails — `src/api/check-ins.ts` `useSubmitCheckIn`**: uses `.upsert()` without `onConflict: 'couple_id,user_id,week_of'`, so the conflict target defaults to the PK (`id`, freshly generated) → second submit in the same week throws a unique-constraint violation on `UNIQUE(couple_id, user_id, week_of)` instead of updating. AND even with `onConflict` fixed, `check_ins` has no UPDATE RLS policy, so the update path is denied. Fix = code change + new migration adding the policy.
2. **Devotional re-completion fails — `src/api/devotionals.ts` `useCompleteDevotional`**: same `.upsert()` problem; needs `onConflict: 'devotional_id,user_id'` to match `UNIQUE(devotional_id, user_id)`. (UPDATE policy exists for this table, so code-only fix.)
3. **Password reset link is a dead end**: `authService.resetPassword` redirects to `bexhearts://reset-password`, but no `reset-password` route exists in `app/` and no code handles the recovery token from the URL.
4. **Streak is display-only**: dashboard shows `streak_count` but no code path ever increments or resets it (see Phase 1).

## 💡 Backlog / ideas (unprioritized — NOT in v1.0)
> Note: memories timeline, milestones/anniversary reminders, and the home-screen widget were promoted OUT of here into the v1.0 engagement layer (Phase 4B).
- **"Faith garden / tree" streak visual** — the one nurture-mechanic kept from Cozy; a v1.x lightweight streak reward, NOT a full pet/economy
- **Quizzes / relationship games** as an acquisition/virality play (deferred from the engagement layer)
- **Secular sibling app** — same codebase, different content pack; only after this app reaches PMF
- Devotional content CMS or admin script instead of raw SQL seeds
- Localization (es/pt strong fit for the niche)

---

*Last full audit: 2026-06-10 (schema, all API modules, services, providers, stores, screens, tests read end-to-end).*
*Updated 2026-06-13: positioning locked (faith-forward; dating→engaged→newlywed beachhead); engagement layer (Phase 4B) + content-volume gating added from the Couple Joy + Cozy competitive analysis; "tests ship with the work" protocol rule added. Docs reorganized under `docs/` with `STEPS.md` + `MARKETING.md` indexed in `CLAUDE.md`/`AGENTS.md`.*
