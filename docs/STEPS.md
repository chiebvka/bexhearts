# STEPS.md — Bexhearts Build Playbook

> **What this file is:** the **HOW & in what ORDER** to build Bexhearts, end to end. `docs/PROGRESS.md` owns the *what & why & status*; this file owns the *sequence*. When an item here is finished, flip its status in `PROGRESS.md` (don't restate status here).
>
> **How to use it:**
> - Work **top to bottom** — steps are dependency-ordered. Don't start a step whose "Depends on" isn't done.
> - Every step is split into **modules**; each module is a *build unit + its unit test*. Tests ship with the module, not later (protocol rule 7).
> - A step is **Done when** `npm run typecheck && npm run lint && npm test` is green **and** its manual check passes.
> - **Migrations:** when a step needs schema, you only *write* `supabase/migrations/0000X_*.sql`. The owner applies it in Supabase Studio (local now, VPS later). Never run it yourself. After it's applied, regenerate types: `supabase gen types typescript --local > src/types/database.ts`.
>
> **👉 CURRENT POSITION (2026-07-28) — PRE-LAUNCH HARDENING IS DONE; THE DEV BUILD IS UNBLOCKED. Read this, then `docs/HANDOFF.md`'s 2026-07-27/28 block. The 2026-07-18 block below is now history.**
> Gate: **403 tests** green. **⚠️ Owner applies `00036_comp_access.sql` — the only outstanding migration.**
> Shipped this round: **analytics** (PostHog live and verified landing; structural-only enforced by an allowlist in `src/features/analytics/schema.ts`; email dropped from identify) · **comp/free-access list** (00036; table ships, rows never; one `useEntitlementAccess` hook enforced at every gate) · **first-run/zero-data pass** (live-walked; `togetherLabel` bug fixed; 8 regression tests) · **journal PDF export** (`expo-print`; author-only boundaries; verified end-to-end) · **`database.ts` regenerated — zero drift** · **CI** (`.github/workflows/gate.yml` + a migrations append-only check) · **store-compliance fixes** (unused camera permission removed, photo purpose string corrected, export-compliance flag) · **J1 unblocked** (pods refreshed, `expo prebuild` re-run so the icon/splash are finally real, **Superwall removed — it doesn't compile under Xcode 26.6 and blocked everything**).
> **WORK NEXT, IN THIS ORDER:**
> 1. **`docs/J1_F3_RUNBOOK.md` top to bottom** — dev build checks (icon/splash/push token/social buttons), then **F3 sandbox purchase**, and above all **F3·B: buy on partner A's device, confirm partner B is entitled without buying.** That test decides whether F2 actually shipped; if it fails, do not ship.
> 2. **The three H2 items** in the same runbook (airplane-mode cold start · 3G multi-photo background upload · a real Sentry crash, checked for PII).
> 3. **Apple token revocation on account deletion** — still OPEN, still required by Guideline 5.1.1(v), B3-blocked since June.
> 4. **`docs/APP_STORE.md`** — §1 demo account first; a fully-paywalled app is rejected without one.
> 5. **A human QA sweep of every screen on the dev build** — the only item left from the 2026-07-26 pre-launch list.
> **ADD NO NEW FEATURES.** E1 daily question, E2 mood, Bible reader, widgets and alternate icons all still wait.
>
> **👉 Current position (2026-07-18) — superseded by the block above; kept for history.** The 2026-07-18 planning round (invite format · AI rate limits · notifications · offline/uploads · waitlist RLS · streak breakdown · how-it-works surfaces) is owner-decided and folded into the steps below (E8–E11, G1–G4, H2). **Landing-site work SHIPPED same day:** `/invite/[code]` + `/invite` pages (share-sheet links no longer 404), `/how-it-works` page (streak/points/rewards breakdown, "you're a team" framing), streak FAQ on the home page, waitlist locked to service-role (**⚠️ owner runs `supabase/waitlist_rls_fix.sql` in the LANDING repo's Supabase** — drops the anon insert policy that bypassed rate limiting). **OWNER-LOCKED BUILD ORDER (work top to bottom when asked "what's next"):**
> 1. ~~**E8 — How-it-works app surfaces**~~ **✅ BUILT 2026-07-18** (content module + modal + 3 entry links + onboarding beats + team moment + Home names; 214 tests, sim-verified — see PROGRESS Phase 4B).
> 2. ~~**Dark mode**~~ **✅ BUILT 2026-07-18** (light/dark token sets + live `colors` getters + `themedStyles` codemod over 54 files + System/Light/Dark resolver + keyed re-mount; 224 tests, all three modes sim-verified — details in PROGRESS Phase 8).
> 3. ~~**AI rate limiting** (E9)~~ **✅ BUILT 2026-07-18** (migration `00026_usage_rate_limits.sql` — **⚠️ owner applies; enforcement off until then**; `consume_usage_credit` gate in compose-prayer + avatar-upload-url; gentle limit card; 226 tests — details in PROGRESS Phase 4B).
> 4. **Notifications G1–G4** — **G1 ✅ BUILT 2026-07-18** (00027 applied; serve restarted; bell + inbox live). **G2 ✅ BUILT 2026-07-19** (⚠️ owner applies `00028`; 9 partner events + E3 + Dates-v2 + debounce; realtime → ROOT layout; verified live). **G3 ✅ BUILT 2026-07-19** (⚠️ owner EDITS + applies `00029` (URL+key placeholders) + restarts serve; hourly `notification-sweep` fn w/ tested planner — 9am/10am/12pm/Sun-6pm/7pm local jobs + the B4 deletion cron; 250 tests). **G4 ✅ BUILT 2026-07-19** (Settings toggles + quiet hours; 254 tests) — **THE NOTIFICATION EPIC IS COMPLETE.** Manual/campaign lane stays deferred until real users.
> 4b. ~~**Implement the real LOGO**~~ **✅ DONE 2026-07-25** (single app icon + splash + adaptive + notification + favicon; landing OG/Twitter/favicon; #9747FF unified; site kept intentionally light/cream; nav CTA → purple). Original note: implement the real LOGO — assets DELIVERED at `/Users/Ebuka/Documents/VPS-agents/Bexhearts/SVG/` (Assets 12–15; full spec + iOS-18 light/dark/tinted plan + Android adaptive plan + the #9747FF-vs-#9849FA unification decision recorded in PROGRESS Phase 4B).** App icon + splash + adaptive/notification icons in `app.config.ts`/assets + landing-site brand/favicon/OG. **⬅️ NEXT.** *(Related, parked until after J1 + engineer variants: premium alternate app icons — see PROGRESS Phase 4B.)*
> 5. ~~**E10 — Streak breakdown v2**~~ ✅ **BUILT 2026-07-25** (00030 migration + Us hub v2; owner applies `00030_longest_streak.sql`).
> 6. ~~**H2 — Reliability round**~~ ✅ **BUILT 2026-07-25** (compression + upload outbox + query-cache persistence + offline banner/mutation toasts + Sentry no-op scaffold; no migration; airplane/3G/crash re-verify rides the J1 dev build).
> 7. ~~**E11 — Long-distance mode design round + onboarding quiz expansion**~~ ✅ **BUILT 2026-07-25** (design locked with the owner, then shipped: `00031` LDR migration + virtual dates + their-time clock + ✈️ Next visit preset; owner applies `00031_ldr_mode.sql`).
> **➡️ THE 2026-07-18 ORDERED LIST IS COMPLETE.**
> 8. ~~**E12 — LDR round 2 + global date ideas**~~ ✅ **BUILT 2026-07-26** (owner-requested follow-up after reviewing E11: virtual-first + "For your next visit" split, westernmost streak anchor, real clock w/ asleep state, ✈️ visit countdown, 59 globally-rooted ideas. ⚠️ owner applies `00032` + `00033`).
> **⬅️ NEXT: F2 enforcement** (per-couple RevenueCat alias + real gating) — store products/keys are already live and it's the last thing between the app and revenue. **Then: date-ideas country tags + per-country rankings** (owner-recorded 2026-07-26, deliberately sequenced after F2 — see PROGRESS Phase 4B).
> Then the pre-existing queue resumes: F2 enforcement (per-couple RC alias), E1 daily question, E2 mood, E7 widget spike, Bible reader, i18n, store compliance.
>
> **👉 Current position (2026-06-18):** Stage A done — app boots in Expo Go (purple/cream + square corners). **Stage B on `authflow`:** **B1·M1 (encrypted `LargeSecureStore`) ✓** and **B1·M2 (email sign-up + OTP confirmation) ✓** — app-side AND Supabase-side (`enable_confirmations = true` + `confirm-signup.html` template). **Owner must restart Supabase** (`supabase stop && supabase start`) to apply, then test reading the code from Mailpit (:55324). **B1·M3 (sign-in/out hardening) ✓** — sign-in routes unconfirmed users to verify (fresh code), sign-out cleanup, password show/hide eye toggle on `Input`, `BackButton` on verify-email/onboarding. **B1·M4 (persistent session) ✓** — foreground `AppState` auto-refresh; `authService.reauthenticate` stub. **B1·M5 ("last used" hint) ✓** — AsyncStorage-backed; `SignOutLink` added to onboarding (sign-out was unreachable mid-onboarding; primary sign-out is on the Profile tab). **M6 (route gating) ✓** — `app/index.tsx` gates auth→onboarding→couple→tabs (verified via the sign-up→onboarding path). **➡️ B1 auth foundation COMPLETE.** **B2 (password reset via OTP) ✓** — enumeration-safe forgot-password → `reset-password` code screen → `verifyRecoveryOtp` + `updatePassword`; recovery email template + config; **Bug #3 resolved** (deep link gone). Needs a **Supabase restart** to load the recovery template. **B3 (social sign-in — Apple + Google) WIRING COMPLETE (2026-06-21):** dev build built; `@react-native-google-signin` v16 + conditional plugin; `authService.signInWithGoogle/Apple` → `signInWithIdToken`; `SocialAuthButtons` on sign-in + sign-up (Apple iOS-only, Google when configured, per-method "last used"); graceful degradation; provider config pre-wired in `config.toml` (apple/google `enabled = false` until creds); tested. **B3 remaining = owner creds + on-device verify:** flip apple `enabled = true` once the Apple acct is approved; set Google iOS client ID + Web client ID/secret env + flip google `enabled = true` + rebuild; restart Supabase. **B4 (account deletion) DONE (2026-06-21):** migration `00003_delete_my_account.sql` (SECURITY DEFINER `delete_my_account()`, cascades remove profile + couple data); Settings danger row → `delete-account` screen (re-auth for email users, social skip) → RPC → sign out → sign-in; tested. **Owner: apply `00003` in Studio + regen types, then verify a test account + rows vanish.** **➡️ Stage B (Auth) COMPLETE** except the owner-side B3 credential flips + on-device social verify. **Stage C STARTED — C1 (relationship-stage capture) DONE (2026-06-21):** migration `00004_relationship_stage.sql` (nullable `relationship_stage` + `stage_started_on` on `couples`); new `relationship-stage` onboarding screen between profile-setup and partner-invite; stashed in `onboarding.store` → written onto the couple at `createCouple`; `onboarding_completed` moved to the stage screen so gating can't skip it; tested. **⚠️ Owner: apply `00004` in Studio + regen types (onboarding writes the column at runtime).** Open C1 decisions flagged in PROGRESS (partner_b inherits stage; kill-window gap). **B4 hardening (2026-06-21):** migration `00005` (7-day grace soft-delete + non-destructive partner hand-off; drops `delete_my_account`); reactivation on sign-in; PII purge (PostHog/Superwall/RevenueCat) on sign-out; delete screen now warns subscriptions aren't cancelled + links to store settings; `refreshInviteCode`/`regenerateCode` re-invite path; greeting now device-time-based (`getGreeting`). **⚠️ Owner: apply `00005`.** Documented TODOs: Apple token revocation on delete (Phase 2/10), pg_cron schedule for `process_due_account_deletions` (G2), server-side RevenueCat customer deletion (Phase 5), per-couple billing alias + keep-until-period-end (Phase 5), home-screen widget cross-platform spike (E7). **C1b DONE (2026-06-21):** migration `00006_personalization.sql` (`profiles.growth_focus`); `personalize` screen (multi-select growth focus) → `plan-summary` screen (personalized by name/stage/focus) → CTA fires `triggerPaywall('onboarding_paywall')` (no-ops in dev) → partner-invite. Full funnel now: `profile-setup → relationship-stage → personalize → plan-summary → partner-invite`. **⚠️ Owner: apply `00006`.** **C2 (two-user partner linking) code DONE (2026-06-21):** M1 collision retry (`withUniqueInviteCode`); fixed the joiner partner-context bug (`usePartnerLink` now resolves the partner on link — was stuck solo until restart); M2 solo-mode (`isLinked` gate + dashboard `WaitingForPartnerCard` with share/regenerate); `createCouple` now generates the code internally. **M3 = owner runs the two-user smoke test** (README "Manual smoke test"). Known gap: inviter sees the new partner only after reopening until couple realtime (D7). **B3 credentials WIRED (2026-06-23); on-device verify DEFERRED (2026-06-26).** Apple provider enabled; Google Web/iOS/Android client IDs in `.env` + `config.toml`; Web secret in `.env`. `pod install` works (static frameworks). But `npx expo run:ios` keeps targeting a connected physical iPhone (+ Xcode 26.5 `devicectl` parse quirk) → needs signing; deferred to a later dev-build pass (build via **Xcode** with a Simulator destination when ready). Social buttons now **hide in Expo Go** so dev continues there. **C3 (avatar upload) DONE (2026-06-26): Cloudflare R2 + DiceBear presets** — `profile/avatar.tsx` (preset cycler works now; photo upload via `avatar-upload-url` Edge Function → R2, needs owner R2 secrets + serve + a rebuild for `expo-image-picker`). **Bottom-nav icons** → Ionicons, purple fill (chosen). **➡️ Stage C COMPLETE.** **STAGE D STARTED — D1 (devotionals) code DONE (2026-06-29):** **D1·M1** fixed Bug #2 (`useCompleteDevotional` upsert now `onConflict: 'devotional_id,user_id'`; `__tests__/api/devotionals.test.ts`); **D1·M3** partner-reflection reveal (`src/features/devotional/reflectionReveal.ts` state machine → `PartnerReflection` on the devotional screen, `isLinked`-gated locked-until-partner; `__tests__/features/devotionalReveal.test.ts`). **D1·M2 = owner live-DB verify** (both partners complete today's devotional; re-complete + reveal). **D3 (check-ins) code DONE (2026-06-29):** **D3·M1** migration `00008_check_ins_update_policy.sql` (missing UPDATE RLS policy — **⚠️ owner applies in Studio**); **D3·M2** fixed Bug #1 (`useSubmitCheckIn` upsert now `onConflict: 'couple_id,user_id,week_of'`; `__tests__/api/check-ins.test.ts`); **D3·M3** partner comparison (`src/features/check-in/comparison.ts` state machine → `CheckInComparison` card on the Connect hub, `isLinked`-gated, `useThisWeekComparison` hook; `__tests__/features/checkInComparison.test.ts`). **D3·M2b = owner live-DB verify** (submit + resubmit same week → updates; comparison reveals after both submit). **D2 (prayers + realtime) code DONE (2026-06-29):** `usePrayersRealtime` wires `subscribeToPrayers` on the prayers screen (invalidate + cleanup; `__tests__/api/prayers.test.ts`); screen split into **Praying / Answered** sections (`partitionPrayers`), **archive** action + **answered celebration**. Migration **`00009_prayers_couple_update.sql`** lets **either partner** mark answered/archive (**⚠️ owner applies**). **Prayer-flow product decisions LOCKED** (see PROGRESS Phase 4 Prayers): lifecycle Active→Answered→Archived (no expiry), either-partner lifecycle control, gentle triage nudge + one daily digest (Phase 6), praise-report thread deferred to v1.x. **D2 owner live-DB verify** (two devices: add on A → live on B; either partner answers/archives). **D4 (boundaries) code DONE (2026-06-29, "verify + polish only"):** screen split Boundaries vs grace-framed Temptation plans (`partitionBoundaries`); **category** chip picker + badge (`categories.ts`, freeform DB column); **deactivate** (Retire/Resolve); **either partner** can update/deactivate via migration **`00010_boundaries_category_and_couple_update.sql`** (adds `category` + couple-UPDATE policy — **⚠️ owner applies + regen types**; `database.ts` hand-updated so it compiles now). Tested `__tests__/features/boundaries.test.ts`. **Boundaries decisions LOCKED** (see PROGRESS Phase 4 Boundaries): keep boundary/temptation split; **gamification = boundaries "days-honored" streak (after D6), temptations grace-only (no relapse streak, a never-resets victories count)**; category added to future-proof the template library + UGC packs. **Deferred to own steps:** stage-aware template library, mutual-agreement handshake, "I'm struggling now" accountability tap (push/E3). **D4 owner live-DB verify** (create both types w/ category; partner sees; either partner deactivates). **D5 (dates) code DONE (2026-06-29, owner: "combine all 3, nothing forced"):** closed the broken loop (couple-dates had no screen) — **Ideas | Our Dates** segmented view; Our Dates grouped by derived status Planned/Saved/**Memories** (`dateHelpers.ts`); **custom/log-your-own** dates + **scheduling** via JS-only presets (`SchedulePicker`, no native date-picker) + **memory-first completion** (rating+note) + **discussion questions** rendered. Migration **`00011_couple_dates_custom_and_schedule.sql`** (date_idea_id nullable + custom_title/description + scheduled_for + CHECK — **⚠️ owner applies + regen types**; `database.ts` hand-updated so it compiles now). Tested `__tests__/features/dateHelpers.test.ts`. **Dates decisions LOCKED** (PROGRESS Phase 4 Dates): all-3 scope; memory-first capture now, timeline → E6; stage content → J2; **date photos = fast-follow on the C3b R2 pipeline**. **D5 owner live-DB verify** (save library + create custom + schedule + complete w/ rating+note; partner sees). **D6 (streak engine) code DONE (2026-06-29 — fixes Bug #4):** migration **`00012_streak_engine.sql`** = `update_couple_streak()` trigger on `devotional_progress` + `couples.timezone`/`grace_days_remaining`/`grace_week`. Rules LOCKED: anchor = daily devotional; everyone-in-couple required (1 solo / 2 linked, solo streak "levels up" on link); yesterday→+1 / today→noop / single-miss→weekly **grace day** else reset; day computed in couple tz. Canonical logic mirrored + tested in `src/features/dashboard/streak.ts` (`__tests__/features/streak.test.ts`). Dashboard reads the live streak + a **"waiting on your partner" nudge** (`getStreakDayState`); `createCouple` seeds the couple timezone. **⚠️ Owner applies `00012` + regen types** (`database.ts` hand-updated so it compiles now). **D6 owner live-DB verify** (both complete today → count goes up; only one → stays + "waiting" nudge; simulate a missed day → grace holds once/week). **D7 (remaining realtime) code DONE (2026-06-29):** `useCoupleRealtime` wires `subscribeToDevotionalProgress` + `subscribeToCoupleUpdates`, mounted once in `app/(tabs)/_layout.tsx` (invalidate devotionals + couple/partner on event, cleanup on sign-out; `__tests__/api/coupleRealtime.test.ts`). **✅ MILESTONE — the core loop (D1–D7) is code-complete** and verified against the live DB as the owner applies each migration. **D7 owner live-DB verify** (two devices: partner completes devotional → reveal + streak update live). **NEXT (post-core-loop): Stage E engagement layer.** **E6 Journal design IRONED OUT + LOCKED (2026-06-29)** — see PROGRESS Phase 4B: B+C hybrid feed, our purple/cream identity (v0 maroon/serif retired), one-purple-family entry icons, fanned-polaroid photo preview → full-screen swipeable viewer, light reactions (❤️/🙏 + one note), and a new **`Journal` tab** via an **IA restructure** (Home · Grow · Connect · Journal · Profile — relocates the D5 Dates tab). Manual entries = Memory + Special Day, so **E5 milestones + E6 memories build together**; multi-image gallery via a separate `bexhearts-memories` R2 bucket is a fast-follow on the C3b pipeline. **Onboarding: DECISION to expand into a 4–6-Q couple quiz + plan reveal** (inviter only; partner B inherits). Still to iron out: **F1 paywall gating model + integration** and the **store-guidelines (Apple + Google) compliance pass**. **IA restructure + E5/E6 Journal — CODE DONE (2026-07-04):** tabs now **Home · Grow · Connect · Journal · Profile** (Dates hidden via `href:null`, reachable from Home; active-tab purple pill). **Journal** (`app/(tabs)/journal/`) assembles memories + milestones + answered prayers + completed dates (`buildTimeline`), B+C hybrid cards, month headers, `useJournalRealtime`; create Memory + Special Day (countdown); memory detail + light reactions (❤️/🙏 + note); `FannedPolaroids` ready for photos. Migration **`00013_journal.sql`** (4 tables — **⚠️ owner applies + regen types**). Tested `__tests__/features/journal.test.ts`; gate green (**141 tests**). **Photos + full-screen viewer = the gallery fast-follow on the `bexhearts-memories` R2 bucket** (needs owner R2 secrets). **NEXT: owner finishes C3b R2 secrets** (unblocks avatar + memory photos), then **F1 paywall** (gate the now-built features), then the **onboarding quiz** + store-compliance pass. Also E1 daily question (Connect), E2 mood, E3 praying-for-you (needs push/G1). **Nav polish DONE (2026-07-04): active-tab icon restyle** — solid `#9849FA` filled glyph (26px) dominating a snug `primary[100]` chip (padding 12/4, radius 14) in `app/(tabs)/_layout.tsx`; if the sim still shows a pale icon it's a stale bundle → `npx expo start -c`. **PHOTOS/GALLERY + JOURNAL POLISH BUILT (2026-07-04d):** edge fn presigns both R2 prefixes (one bucket); `src/api/uploads.ts` shared presign→PUT; multi-select picker (`src/lib/imagePicker.ts`); `useAddMemoryImages`; memory-form photo upload; polaroids on feed cards; full-screen `PhotoViewer` (paging/counter/share/iOS pinch-zoom); milestone edit/delete (special-day-form edit mode); reaction+image realtime (channel + per-memory invalidation). Migration **`00014_memory_images_realtime.sql`** (**⚠️ owner applies**). **SIGN-IN HANG root-caused #2 + FIXED:** async `onAuthStateChange` callback blocked `signInWithPassword` (supabase-js awaits it) → callback now sync, hydration deferred, auth calls bounded 12s (`src/utils/withTimeout.ts`); regression tests added. Gate green (**160 tests**). **UX round (2026-07-04f):** journal-add `back()+push` race fixed (`replace`; memories/special-days actually save now); tab-bar pill clipping fixed (explicit bar/icon-slot heights) — both sim-verified via `simctl` screenshots; **custom in-app Calendar** (`src/lib/calendar.ts` + `ui/Calendar.tsx`, tested) replaces typed dates in special-day-form; **ModalHeader X** on all 8 modals; **Settings expanded** (Appearance pref persisted, Restore Purchases, share/rate/about/legal, version). Gate green (**171 tests**). **(2026-07-04h):** cold-start mis-route to partner-invite fixed (gate trusts `profile.couple_id`; AuthProvider hydrates couple context before `setSession` — verified via scripted cold restart); `ModalHeader` close guards `canGoBack`; calendar month/year = native **scroll wheels** via `@react-native-picker/picker` (Expo Go bundled; dev build needs `pod install` later), years 1910→now+15; prayers personal/shared live (00015 applied). **(2026-07-05e/f) DATE LIBRARY + DEVOTIONAL PIPELINE BUILT:** `00018` (idea metadata + `date_idea_ratings` + couple-level aggregate RPC) + `00019` (340-idea seed, statically validated) + `00020` (devotional evergreen-pool rotation via `get_today_devotional()`, `devotional_drafts` staging, `promote_approved_devotionals()`) + `00021` (60 AI-drafted launch devotionals — **owner reviews in Studio, approves, promotes**); date-complete stars also rate the library idea; `useTodayDevotional` → RPC. All owner-run in Studio, in order. **(2026-07-05) PRAYER FOCUS + AI + STREAK A+D BUILT:** migration **`00016`** (activity_log + prayer AI cache + consent — **⚠️ owner applies**); `compose-prayer` edge fn (Haiku, consent + crisis guard, cached per prayer; **owner: serve ALL functions** `supabase functions serve --env-file supabase/functions/.env`); prayer-focus session modal (durations, keep-awake, consent sheet, Amen→activity); prayers Ours|Mine + Pray now; Grow "Prayer time" card; StreakCounter week-dots/grace/trackables → Us hub (heatmap + per-activity streaks + badges); activity logging on devotional/check-in/journal mutations; tests in `activity.test.ts` + `prayerFocus.test.ts`; gate green (**185 tests**), all screens sim-verified. Email infra: auth via Supabase Custom SMTP → ZeptoMail (`smtp.zeptomail.com`, US) for prod; local uses Mailpit (:55324). Transactional = Phase 6 edge functions. Open: A1·M2 (CI), A2 (regen types), dev build by B3.
>
> **2026-07-10 addendum:** decisions round with the owner (devotionals / pricing / marketing) executed. **Devotional repeat policy DECIDED** — communal rotation + grow the pool; "you've read this before" affordance = v1.x. **`00023_devotional_local_day.sql`** (couple-timezone day boundary for `get_today_devotional()`; also fixes the 00020 override-skipped-by-OFFSET bug) + **`00024_devotional_drafts_seed_2.sql`** (40 more drafts → 100-devotional pool; generator promoted into the repo at `scripts/gen-devotionals.mjs`) — **⚠️ owner applies both in Studio** (00024 flow: run → review → approve → `promote_approved_devotionals()`). **Launch pricing LOCKED:** $79.99/yr + $12.99/mo, per couple, 3-day trial; weekly ($6.99/wk) held for post-launch Superwall tests (`plans.ts` updated; F2 creates the store products at these prices). **Marketing:** 2-month slideshow run approved — 60 posts × 4 theme accounts in 2-week waves of 15/account, cross-posted TikTok/IG/FB, wave 1 waitlist-CTA (MARKETING §2.10). **Next:** wave-1 content production → F2/F3 store products + launch checklist (realistic store-live ≈ 2 weeks; TestFlight first). **Boundaries round (same day, owner approved):** template library v1 (`src/features/boundaries/templates.ts` — 18 stage-aware boundary + 6 temptation templates, client-side, no migration; "Start from a template" rail prefills the form, filtered by couple stage + category chip) + form simplification (why = optional; action-plan field removed for plain boundaries; category-aware title placeholders; form keyed by register). Sim-verified, gate green (**192 tests**). Handshake + days-honored gamification = post-launch queue. **Transparency round D1–D7 BUILT same day (owner locked all pre-launch; 205 tests, sim-verified):** D1 stale-points-cache fix (65≠85 explained: no invalidation, not bad data) · D2 points-history modal (This week/All time, per-row who/what/when; couple-private) · D3 check-in notes finally collected + sharing model (gratitude revealed once both submit; growth/prayer private w/ share toggles) · D4 migration **`00025`** (couple_events audit trail + archived_at + boundary deactivation stamps + share flags + streak trigger logs grace_used/streak_reset + boundaries realtime) · D5 Victories 🏆 / Past covenants sections w/ restore + attribution + **author-only resolve on temptation plans** + live sync · D6 journal date/prayer entries now open detail modals (date-view: edit stars/note + Save-as-a-Moment; prayer-view: full circle w/ AI prayer) · D7 anniversary milestone presets (owner: NO weekly recap — recaps only year-end/app-anniversary/relationship anniversaries, data via couple_events) · AI-prayer disclosure sheet removed (consent stamped silently on Compose; policy = disclosure surface). **⚠️ Owner applies 00025 BEFORE testing check-ins or boundary retire.**
>
> Stage map: **A** foundation · **B** auth · **C** onboarding/linking · **D** core-loop hardening · **E** engagement layer · **F** monetization · **G** notifications · **H** quality/polish · **I** production backend · **J** release. (Maps to PROGRESS Phases 0→10.)
>
> ## ✅ DEV BUILD DONE (2026-06-21) — Expo-Go bridge retired for B3
> The **Development Build (Path B) is built**: CocoaPods installed, `ios/` prebuilt, `ios/Podfile.lock` present, `package.json` scripts switched to `expo run:ios|android`. The app's required native modules (MMKV v3, RevenueCat, Superwall, native Apple/Google auth, push) now compile in. Daily loop is now `npx expo start` → press `i` (opens the dev build, not Expo Go); rebuild only on native-dep/config changes (see `docs/B3-SETUP.md` Part 5).
> **Still open / deferred:**
> - **RC dedupe DEFERRED to Stage F (monetization).** The duplicate `react-native-purchases` (8.12.0 top-level vs 7.28.1 bundled in Superwall) is an `expo-doctor` warning, **not** a build blocker — RN autolinking links only the top-level 8.x, and the dev build compiled fine with the duplicate. Forcing Superwall (declares `^7.21.1`) onto 8.x via `overrides` is the change B3-SETUP says must be **runtime-verified against Superwall's purchase controller** — impossible until Superwall/RevenueCat have real keys (Stage F). Do it there, with verification.
> - **MMKV for "last used"** — B1·M5 still uses the AsyncStorage fallback; the dev build now allows switching to MMKV if desired (non-blocking; "last used" is a non-sensitive UI hint).
> - **Re-pin reanimated/worklets** to latest if desired (the dev build compiles exact declared versions, so the Expo-Go version-match constraint is gone). Non-blocking.

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

### Step E8 — How-it-works surfaces (owner-approved 2026-07-18; build BEFORE dark mode)
**Depends on:** D6 (streak rules locked), 00017 (point values locked).
**Modules:** M1 — **Concise onboarding beats** (owner: brief, not long — full breakdowns live on dedicated pages): a compact 3-rule strip on `plan-summary` (both-finish-the-devotional · weekly grace day · everything earns points), a one-liner on `partner-invite` ("your solo days count and carry over when they join") *(test: copy renders per screen)*. M2 — **Partner-B "you're a team" moment**: post-link screen for the joiner (they skip onboarding and currently learn nothing) — "You're linked with <name> 💜", two rules (light the flame together · points are earned as a couple), CTA to today's devotional *(test: shown once on link)*. M3 — **In-app "How Bexhearts works" screen** (streak rules incl. timezone + grace, points table mirroring the 00017 trigger values, honest rewards note, leaderboard masking) linked from the Home streak card, the Us hub, and Profile. M4 — **Partner name on Home** (first names with the avatars; groundwork for E11's "their time"). Reference mockups: the session artifact "Streaks & Points transparency plan" (concise revision).
**Verify:** sims — onboarding beats render, joiner sees the team moment once, How-it-works opens from all three entry points, partner name shows on Home.
**Done when:** green + sim-verified.
**Flips in PROGRESS:** Phase 4B how-it-works item.

### Step E9 — AI rate limiting (owner-locked 2026-07-18)
**Depends on:** compose-prayer live (00016).
**Modules:** M1 — Migration: `ai_usage` counters + a SECURITY DEFINER `consume_ai_credit(kind)` RPC enforcing **40 composed prayers/day per couple + 150/month per couple** (limits live in the function so the owner can tune in Studio); also truncate the request text sent to the model (~1,000 chars). M2 — enforce in `compose-prayer` before the Anthropic call; distinct 429-style response. M3 — client handling: gentle toast, owner-approved register — suggest praying again tomorrow and praying together right now (e.g. "You've composed a lot of prayers today 💜 They'll be here tomorrow — for now, maybe pray this one together in your own words."), no error styling *(test: RPC math + client mapping)*. M4 — same helper guards `avatar-upload-url` presigns (junk-upload abuse).
**Verify:** 41st compose in a day returns the gentle message; counter resets next day; month cap enforced.
**Done when:** green + limits verified against local Supabase.
**Flips in PROGRESS:** Phase 4B AI rate-limit item; ToS fair-use note in the same pass.

### Step E10 — Streak breakdown v2 (Us hub analytics; owner-approved 2026-07-18) — ✅ BUILT 2026-07-25
**Status:** all four modules shipped (migration `00030_longest_streak.sql` — ⚠️ owner applies; gate green 268 tests; sim-verified + `__tests__/components/usHub.test.tsx` covers the filter/tap interactions). See PROGRESS Phase 4B for the full ship list.
**Depends on:** D6, 00016 (activity_log), 00025 (couple_events logs streak_reset/grace_used).
**Modules:** M1 — Migration: `couples.longest_streak` + started/ended dates, maintained by `update_couple_streak()`, one-time backfill from `devotional_progress` history. M2 — per-activity rows get **best + last-done** ("best 4 · last Jul 12") via an all-time SQL aggregate RPC (client only fetches 120 days). M3 — heatmap **7d / 30d / All** filter chips (All = server-side daily-counts RPC, small payload) + **tap-a-cell tooltip** (date + count, Claude-tracker style). M4 — copy: hero labeled as the devotional-anchored couple streak ("Best streak: N days · dates" line) so it stops looking contradicted by the heatmap; per the owner, streaks can NEVER be disabled by users (only their notifications, G4) and there is NO pause/vacation mode.
**Verify:** sims — a broken streak shows its best-streak history; filters change the grid; tapping a cell shows the date.
**Done when:** green + sim-verified.
**Flips in PROGRESS:** Phase 4B streak-analytics item.

### Step E11 — Long-distance mode (design round first) + onboarding quiz expansion — ✅ BUILT 2026-07-25
**Status:** design round run with the owner 2026-07-25 (four decisions locked: quiz+toggle capture · LDR question ONLY this round · `is_virtual` flag + 12 new seeds + filter chip · clock AND next-visit preset both ship), then built the same day. Migration `00031_ldr_mode.sql` — ⚠️ owner applies. Gate green 293 tests; onboarding/dates/profile sim-verified, logs clean. Full ship list in PROGRESS Phase 4B. **Quiz expansion beyond the LDR question stays parked** until J2 content packs make more answers pay off (the standing payoff rule).
**Depends on:** E8 (quiz absorbs its beats), owner design session.
**Modules:** M1 — design with owner: `couples.is_long_distance` captured in the expanded onboarding quiz (so the question personalizes for real) + Profile toggle; LDR/virtual filters + tagging pass on the 350-idea date library; "their time" clock beside the partner name (rides E8·M4); countdown-to-next-visit milestone preset. M2+ — build per the agreed design.
**Verify:** per design.
**Done when:** design locked with owner, then green + sim-verified.
**Flips in PROGRESS:** Phase 4B LDR item + onboarding-quiz item.

---

## STAGE F — Monetization (PROGRESS Phase 5)

### Step E12 — LDR round 2 + global date ideas (owner round 2026-07-26) — ✅ BUILT
**Depends on:** E11 (00031), 00030.
**Modules:** M1 — virtual-first ordering + "For your next visit" sink (`buildIdeaSections`, SectionList on the Ideas tab; flat once a chip is picked). M2 — `00032`: streak anchor = westernmost partner (offset helper + recompute fn + trigger on `profiles.timezone` + backfill). M3 — `partnerClock`/`partnerClockLabel`: partner local time + 🌙 from their own quiet-hours pref, fallback 10pm–7am. M4 — `useNextVisit` + Home countdown card, ungated. M5 — `00033`: 59 globally-rooted, cheap, faith-centred ideas (West/East Africa, LatAm, South/SE Asia, MENA, universal).
**Verify:** sims — LDR couple sees the split; countdown appears when a ✈️ milestone is set; clock shows a moon overnight.
**Done when:** green + sim-verified. ✅ 315 tests.
**Flips in PROGRESS:** Phase 4B LDR item + the global-ideas item.

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

## STAGE G — Notifications (PROGRESS Phase 6 — architecture owner-locked 2026-07-18)

> **Stack decision (owner: "prefer Supabase over Firebase"):** transport = **Expo Push Service** (the app already registers Expo push tokens to `profiles.push_token`; Expo wraps APNs + FCM — the ONLY Google touchpoint is uploading an FCM server key to the Expo project once for Android delivery; **no Firebase SDK ever enters the app**). Brain = **Supabase**: edge functions + pg_cron + DB webhooks, all self-hostable. **Self-hosted notes (Coolify VPS):** enable the `pg_cron` + `pg_net` extensions in the stack's Postgres; the Supabase docker-compose already ships the edge-runtime container — functions deploy by placing them in the mounted `functions/` volume (same folder layout as `supabase/functions/`); Studio on the VPS manages cron jobs via SQL. Exact owner steps get written into each step's handoff when built.
> **Three lanes:** (1) **event-driven** (partner actions) — build now; (2) **scheduled** (pg_cron) — build now; (3) **manual/campaign broadcasts — DESIGNED, EXPLICITLY DEFERRED (owner 2026-07-18) until real users exist** (design: a `broadcasts` table the owner inserts into via Studio; a cron sweep sends pending rows; no admin UI needed). Do not build lane 3 yet.
> **Privacy rule (non-negotiable):** push payloads NEVER contain prayer/journal/check-in content — religious content is sensitive data. Payloads are generic ("A new shared prayer was added"); content stays behind the tap. Update PRIVACY_POLICY.md per category in the same pass as each build.

### Step G1 — Push infra + in-app notification center
**Goal:** one `send-notification` edge function everything routes through, plus the in-app inbox the owner asked for.
**Depends on:** B1 (tokens registered). Real-device pushes need the dev build (J1); the inbox itself is pure Supabase and testable in Expo Go/sims.
**Modules:** M1 — Migration: `notifications` table (recipient user_id, couple_id, category, title, body, deep-link route, read_at; couple-scoped RLS) + `profiles.notification_prefs jsonb` (per-USER — each partner controls their own phone). M2 — `send-notification` edge fn: writes the inbox row, checks the recipient's prefs + quiet hours, sends via Expo Push API (receipt handling; prunes dead tokens) *(test: pref gating logic)*. M3 — **push-token hygiene**: clear `push_token` on sign-out and account deletion (today a shared device keeps delivering the previous user's pushes). M4 — **in-app notification bell (top of Home) + notifications page** (owner ask 2026-07-18): unread badge via realtime on `notifications`, list marks read, rows deep-link (reuse the `ModalHeader` canGoBack guard) *(test: unread count, partition)*.
**Verify:** sims — an inserted notification appears on the bell + page live and deep-links; prefs block delivery; sign-out clears the token.
**Done when:** green + sim-verified (OS-level push delivery re-verified on the dev build at J1).
**Flips in PROGRESS:** Phase 6 infra + inbox items.

### Step G2 — Event-driven (partner-activity) notifications
**Depends on:** G1.
**Modules:** M1 — DB webhooks/triggers → `send-notification` for the owner-approved default-ON set: praying-for-you tap (E3 — this step finally builds it), shared prayer added, prayer answered, journal moment added, memory reaction, date suggested/accepted, check-in "your turn", partner finished today's devotional ("waiting on you"), partner linked. Default-OFF (never sent in v1): ratings, boundary edits (too low-signal / too sensitive). M2 — debounce: max one push per category per few hours per recipient *(test: debounce math)*. M3 — **Dates v2 suggest→accept** rides this step (suggested date → partner notification → accept/pass; the flow was parked waiting on push).
**Verify:** two sims — partner action lands as inbox row + (on dev build) push; spamming actions only sends once per window.
**Done when:** green + two-sim verified.
**Flips in PROGRESS:** Phase 6 event-driven + Phase 4B praying-for-you + dates-v2 note.

### Step G3 — Scheduled notifications (pg_cron)
**Depends on:** G1; production schedules land with **I1** (VPS), but jobs are testable on local Supabase.
**Modules:** M1 — hourly sweep pattern (jobs run hourly; each selects couples whose LOCAL time — `couples.timezone` — matches the send window, so "7pm" means the couple's 7pm): daily devotional reminder · **streak-at-risk** (evening, only when a streak ≥ 3 exists and someone hasn't completed — "🔥 Your 5-day streak is on the line") · weekly check-in reminder · **one daily prayer digest** (LOCKED 2026-06-29, never per-prayer pings) · milestone countdowns (3 days out + day of) · "grace covered you yesterday" notice. M2 — schedule the account-deletion processor (B4): `cron.schedule('process-account-deletions', '0 3 * * *', $$ select public.process_due_account_deletions(); $$)`. M3 — every job routes through `send-notification` so prefs/quiet-hours apply uniformly.
**Verify:** local — force a couple's timezone window → job fires once, respects prefs; deletion processor removes a due account.
**Done when:** jobs fire reliably (staging/VPS re-check at I1).
**Flips in PROGRESS:** Phase 6 scheduled items + the B4 cron TODO.

### Step G4 — Notification preferences UI
**Depends on:** G1 (prefs column + enforcement exist from day one; this is the Settings surface).
**Modules:** M1 — Settings section: category toggles (Partner activity / Daily reminders / **Streak alerts** / Milestones / Announcements-later) + quiet hours; per the owner: streak NOTIFICATIONS are mutable, the streak itself is not, and there is no pause/vacation mode *(test: prefs round-trip)*.
**Verify:** toggling a category stops that push/inbox row.
**Done when:** green + prefs respected end-to-end.
**Flips in PROGRESS:** Phase 6 preferences.

---

## STAGE H — Quality & polish (PROGRESS Phase 7 + 8)

### Step H1 — Test backfill
**Depends on:** Stage D.
**Modules:** M1 — API-hook tests with a mocked Supabase client; M2 — component tests for the 4 main forms (sign-up, profile setup, check-in, prayer).
**Done when:** coverage of the critical paths is green.
**Flips in PROGRESS:** Phase 7 hook + component tests.

### Step H2 — Reliability round: offline, uploads on bad networks, crash reporting (expanded 2026-07-18, owner-approved) — ✅ BUILT 2026-07-25
**Status:** all five modules shipped (no migration; gate green 293 tests; boot/journal/cold-restart sim-verified). See PROGRESS Phase 7 for the full ship list + the MMKV-in-Expo-Go gotcha. Airplane-mode cold start + 3G multi-photo memory + a real crash report are re-verified on the J1 dev build (background upload sessions and Sentry are dev-build-only behaviors).
**Modules (in impact order):** M1 — **Image compression before upload** (expo-image-manipulator, resize ~1600px max; the single biggest 3G win — pictures shrink 5–10×; applies to avatars + memory photos). M2 — **Upload outbox**: queued upload jobs persisted in AsyncStorage; one-at-a-time via `expo-file-system` `uploadAsync` with the iOS BACKGROUND session type (continues after the user leaves the app); retry with backoff; resumed on app start + on reconnect (`useNetworkStatus`); pending-state UI on memory cards ("2 of 5 photos uploading — we'll finish in the background") *(test: queue math, retry/backoff)*. M3 — **Query-cache persistence**: `@tanstack/react-query-persist-client` + AsyncStorage persister so last-known-good devotional/prayers/journal/couple/streak/points render instantly offline (cold start on 3G currently = blank app). Privacy call to record in PRIVACY_POLICY: either exclude prayer bodies from the persisted cache or note the device-local cache. M4 — Global offline banner + consistent mutation-error surfacing. M5 — **Sentry** (graceful no-op without a key) — deliberately IN this round, not after: bad-network field failures are undebuggable with zero crash visibility.
**Done when:** airplane-mode cold start shows cached content; a 3G-throttled multi-photo memory finishes in the background; crashes report on a build.
**Flips in PROGRESS:** Phase 7 error/offline/persistence + Sentry.

### Step H3 — UI/UX polish
**Depends on:** core loop verified (Stage D).
**Modules:** loading skeletons · pull-to-refresh · haptics · reanimated animations · accessibility pass · real app icon + splash. **Dark mode is NOT optional and NOT parked here anymore — owner slotted it 2026-07-18 as the dedicated block right after E8** (see the current-position order; implementation spec lives in PROGRESS Phase 8).
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
