# Bexhearts Product and Brand Context

## 1. Executive summary

Bexhearts is a pre-launch Expo/React Native mobile app for Christian couples. The verified implementation supports account creation/sign-in, OTP email confirmation and password reset, persistent Supabase sessions, onboarding, relationship-stage capture, personalization, partner invite codes, a home dashboard, daily devotionals, shared prayers, weekly check-in ratings, boundaries/temptation plans, date-idea browsing/saving, subscription status, restore purchases, push-token registration, and account deletion scheduling.

The repository also contains a larger v1.0 roadmap: daily questions with reveal, daily mood share, "praying for you" push, couple challenges, milestones, memories, a home-screen widget, per-couple billing, production backend, real content packs, and release assets. Those are plans unless explicitly called out below as implemented.

The product positioning is faith-forward and couple-centered. It is not framed as a generic couples app with Christian flavoring. The beachhead audience is Christian couples in the dating, engaged, and newlywed journey.

Assessment source of truth: repository contents on `authflow`, cross-checked between docs and code.

## 2. Product purpose

Bexhearts helps Christian couples build a shared daily and weekly rhythm around faith, prayer, reflection, communication, accountability, and intentional dates.

Verified purpose signals:

- README describes a mobile app for Christian couples with daily devotionals, shared prayer journal, weekly relationship check-ins, boundaries, and date ideas.
- `docs/PROGRESS.md` describes the core loop as "do something together daily/weekly, keep the streak alive."
- In-app onboarding copy says: "Grow closer to God and each other. Build your relationship on a foundation of faith, love, and intentional connection."
- Home and feature screens are built around couple activity, not solo spirituality.

Relevant paths: `README.md`, `docs/PROGRESS.md`, `app/(onboarding)/welcome.tsx`, `app/(tabs)/index.tsx`.

## 3. Intended users

Primary users:

- Christian couples.
- Dating couples, engaged couples, and newlyweds are the documented beachhead.
- Married couples are supported by the relationship-stage schema and UI.

Secondary state, not a target segment:

- A solo signed-in user can use some features while waiting for a partner, but docs explicitly say solo is a state, not a segment.
- The product nudges solo users toward inviting a partner instead of celebrating a solo path.

Not positioned for:

- Generic secular couples.
- Singles looking for solo faith-growth content.
- Long-distance tracking, chat, games, pet/economy loops, or virtual home mechanics.

Relevant paths: `docs/PROGRESS.md`, `docs/MARKETING.md`, `src/features/onboarding/components/RelationshipStageForm.tsx`, `src/features/dashboard/components/WaitingForPartnerCard.tsx`.

## 4. Current verified and implemented features

Implementation verified in code:

- Expo SDK 54 React Native app with Expo Router, TypeScript, TanStack Query, Zustand, Supabase, Jest, RevenueCat, Superwall, PostHog wrapper, and notifications packages. Paths: `package.json`, `app.config.ts`.
- Auth routes for sign-in, sign-up, email verification, forgot password, and reset password. Paths: `app/(auth)/*`, `src/features/auth/hooks/useAuth.ts`, `src/services/supabase/auth.ts`.
- Email/password auth with 6-digit OTP signup confirmation and 6-digit OTP password reset. Paths: `src/features/auth/components/VerifyEmailForm.tsx`, `src/features/auth/components/ResetPasswordForm.tsx`, `supabase/templates/confirm-signup.html`, `supabase/templates/reset-password.html`.
- Apple and Google sign-in plumbing via native ID tokens. Google button hides when public client IDs are placeholders. Real device/provider success still depends on native build and provider configuration. Paths: `src/features/auth/socialAuth.ts`, `src/features/auth/components/SocialAuthButtons.tsx`, `app.config.ts`, `supabase/config.toml`.
- Persistent encrypted Supabase session storage using AES key in SecureStore and ciphertext in AsyncStorage. Paths: `src/services/supabase/client.ts`, `src/services/supabase/secureStorage.ts`.
- Route gating from unauthenticated to auth, incomplete profile to onboarding, no couple to partner invite, otherwise tabs. Path: `app/index.tsx`.
- Onboarding screens for welcome, profile setup, relationship stage, personalization, plan summary, partner invite, and partner-code link. Paths: `app/(onboarding)/*`, `src/features/onboarding/*`.
- Relationship stage capture for `dating`, `engaged`, and `married`; persisted when a couple is created. Paths: `src/features/onboarding/components/RelationshipStageForm.tsx`, `src/features/onboarding/hooks/useInviteCode.ts`, `supabase/migrations/00004_relationship_stage.sql`.
- Personalization growth focus capture: prayer life, communication, intimacy and connection, spiritual growth, handling conflict, quality time. Paths: `src/features/onboarding/components/PersonalizationForm.tsx`, `src/features/onboarding/schemas.ts`, `supabase/migrations/00006_personalization.sql`.
- Plan summary with Superwall paywall event `onboarding_paywall`; Superwall no-ops when unconfigured. Paths: `src/features/onboarding/components/PlanSummary.tsx`, `src/services/superwall/client.ts`.
- Partner invite codes with generation, collision retry, 48-hour expiry in schema, copy/share UI, regenerate code, and RPC-based linking. Paths: `src/features/onboarding/hooks/useInviteCode.ts`, `src/features/onboarding/hooks/usePartnerLink.ts`, `src/features/onboarding/components/InviteCodeCard.tsx`, `src/utils/invite-code.ts`, `supabase/migrations/00001_initial_schema.sql`, `supabase/migrations/00002_restrict_invite_lookup.sql`.
- Home dashboard with greeting, profile/partner avatars when present, waiting-for-partner card, streak display, quick actions, and today's devotional card. Paths: `app/(tabs)/index.tsx`, `src/features/dashboard/*`.
- Daily devotional screen with scripture, reflection, personal reflection input, and couple action toggle. Paths: `app/(tabs)/devotional/index.tsx`, `src/api/devotionals.ts`, `src/features/devotional/*`.
- Devotional history query and detail route are present. Paths: `src/api/devotionals.ts`, `app/(tabs)/devotional/[id].tsx`.
- Shared prayer list, create prayer, mark answered, update/delete hooks, archive flag in API/query layer. Paths: `app/(tabs)/connect/prayers.tsx`, `app/modal/prayer-form.tsx`, `src/api/prayers.ts`, `src/features/prayer/*`.
- Weekly check-in screen and modal with three 1-5 ratings: emotional connection, spiritual connection, communication quality. Paths: `app/(tabs)/connect/check-in.tsx`, `app/modal/check-in-form.tsx`, `src/features/check-in/components/CheckInForm.tsx`, `src/api/check-ins.ts`.
- Boundaries and temptation plans with list/create/update API; creation modal is premium-gated. Paths: `app/(tabs)/connect/boundaries.tsx`, `app/modal/boundary-form.tsx`, `src/api/boundaries.ts`, `src/features/boundaries/components/BoundaryForm.tsx`.
- Date ideas browsing by category, detail screen, scripture tie display, challenge badge, and save-to-couple action. Paths: `app/(tabs)/dates/index.tsx`, `app/(tabs)/dates/[id].tsx`, `src/api/dates.ts`, `src/features/dates/components/DateIdeaCard.tsx`.
- Subscription card, premium/free badge, upgrade trigger, and restore purchases button. Paths: `src/features/subscription/components/SubscriptionStatus.tsx`, `src/features/subscription/hooks/useOfferings.ts`, `src/services/revenuecat/client.ts`.
- PremiumGate component used for check-in routes and boundary creation modal. Paths: `src/components/ui/PremiumGate.tsx`, `app/(tabs)/connect/check-in.tsx`, `app/modal/check-in-form.tsx`, `app/modal/boundary-form.tsx`.
- Account deletion request flow with password re-auth for email users, social-user skip, store subscription warning, sign-out, and 7-day grace RPC. Paths: `app/(tabs)/profile/delete-account.tsx`, `src/features/auth/hooks/useAuth.ts`, `supabase/migrations/00005_account_deletion_grace.sql`.
- Push-token registration and notification response routing. No push sending. Paths: `src/providers/NotificationProvider.tsx`, `src/services/notifications/client.ts`, `src/services/notifications/handlers.ts`.
- PostHog wrapper no-ops in dev/unconfigured to avoid SDK 54 incompatibility. Paths: `src/services/analytics/client.ts`, `src/services/analytics/events.ts`.
- Supabase schema for profiles, couples, devotionals, devotional progress, prayers, check-ins, boundaries, date ideas, and couple dates with RLS. Paths: `supabase/migrations/00001_initial_schema.sql`, `src/types/database.ts`.
- Seed content: 7 sample devotionals and 10 sample date ideas. Path: `supabase/seed.sql`.
- Tests for auth, social auth plumbing, account deletion hook behavior, secure session storage, stores, invite-code utilities, onboarding schemas/store, and greeting. Paths: `__tests__/`.

## 5. Planned, incomplete or placeholder features

Do not treat these as shipped:

- Daily question with private answers and reveal. No tables, API hook, or UI found.
- Daily mood share. No table, API hook, or UI found.
- "Praying for you" tap and partner push. Push token registration exists, but no sending side exists.
- Couple challenges as a full product feature. `date_ideas.is_challenge` exists and seeded ideas can show a "Challenge" badge, but there is no dedicated challenge progress system.
- Milestones/countdowns. No schema, API, or UI found.
- Memories timeline. No schema/API/UI found.
- Home-screen widget. No native widget implementation found.
- Realtime partner updates. Helpers exist but are not used by screens.
- Streak engine. `couples.streak_count` displays, but no code or trigger updates it.
- Avatar upload. `avatar_url` exists, and app config includes camera/photo usage copy, but there is no storage bucket migration, image-picker dependency, or upload UI.
- Dark mode. Theme is light-only and `app.config.ts` forces `userInterfaceStyle: 'light'`.
- Per-couple billing. Docs define it, but `AuthProvider` identifies RevenueCat by individual `user.id`; no couple-level alias flow is implemented.
- Production purchase setup. RevenueCat/Superwall wrappers exist, but real products, real keys, and sandbox purchase verification are not in the repo.
- Server-side premium enforcement. `is_premium` flags exist on content tables but are readable by authenticated users and not enforced by API hooks.
- Content-volume gating constants exist but are unused: `MAX_FREE_PRAYERS`, `MAX_FREE_BOUNDARIES`, `FREE_DEVOTIONAL_ARCHIVE_DAYS`, `FREE_DATE_IDEAS`.
- Notification preferences. No settings UI or persistence found.
- Scheduled notifications. No worker/edge function/cron implementation found.
- Production backend, backups, legal pages, store assets, and real app icon/splash are still roadmap/release work.
- API-hook tests and component tests for the main feature forms are still gaps.

Relevant paths: `docs/PROGRESS.md`, `docs/STEPS.md`, `src/constants/app.ts`, `src/services/supabase/realtime.ts`, `src/services/notifications/client.ts`, `src/services/revenuecat/client.ts`, `src/theme/colors.ts`, `app.config.ts`.

## 6. Navigation and information architecture

Top-level routing:

- `/` route gate: unauthenticated -> sign-in; onboarding incomplete -> welcome; no couple -> partner invite; otherwise -> tabs.
- Auth stack: sign-in, sign-up, verify-email, forgot-password, reset-password.
- Onboarding stack: welcome, profile setup, relationship stage, personalize, plan summary, partner invite, partner link.
- Main tabs: Home, Devotional, Connect, Dates, Profile.
- Modal stack: prayer form, check-in form, boundary form.

Main tabs:

- Home: greeting, avatars, partner invite nudge if solo, streak, quick actions, today's devotional.
- Devotional: today's devotional and detail/history routes.
- Connect: shared prayers, weekly check-in, boundaries and plans.
- Dates: date idea library and date idea detail.
- Profile: profile identity, subscription status, settings, sign out.

Relevant paths: `app/index.tsx`, `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(auth)/*`, `app/(onboarding)/*`, `app/modal/*`.

## 7. Main user journeys

Verified journeys in code:

- Sign up with email -> verify 6-digit email code -> route into onboarding.
- Sign in with email -> if email is unconfirmed, resend code and route to verify-email.
- Request password reset -> enter emailed 6-digit code and new password -> update password.
- Onboarding: welcome -> profile setup -> relationship stage -> personalization -> plan summary/paywall event -> partner invite/link.
- Invite partner: generate code -> copy/share code -> regenerate code if needed.
- Join partner: enter code -> `link_partner` RPC -> update couple context -> tabs.
- Solo dashboard: if user has an unlinked couple and invite code, show waiting-for-partner card with copy/share/regenerate.
- Daily devotional: read scripture/reflection -> save personal reflection -> mark couple action done.
- Prayer: create prayer -> list active prayers -> mark answered.
- Check-in: submit three weekly ratings.
- Boundary/temptation plan: open premium-gated modal -> create boundary or temptation plan if entitled.
- Date idea: browse/filter -> open detail -> save date idea to couple.
- Profile/settings: view profile/subscription -> restore purchases -> open privacy/terms/support links -> request account deletion.

Journeys partially present or fragile:

- Skipping partner invite can route into tabs during the current session, but a fresh visit to `/` redirects users with no `coupleId` back to partner invite.
- Partner A may need app restart/refetch to see Partner B because couple realtime is not wired.
- Devotional re-completion and check-in resubmission have known upsert bugs.

Relevant paths: `src/features/auth/hooks/useAuth.ts`, `src/features/onboarding/hooks/*`, `src/api/*`, `app/(tabs)/*`, `docs/PROGRESS.md`.

## 8. Brand personality

The brand personality should be:

- Faith-forward.
- Warm and intentional.
- Couple-centered.
- Practical and habit-oriented.
- Emotionally safe, not shaming.
- Calm, modern, and sincere.
- Denomination-neutral.
- More "daily rhythm together" than "relationship hack."

Avoid:

- Salesy urgency.
- Fear-based relationship claims.
- Doctrinal fights.
- Fake testimonials.
- Overpromising that an app will fix or save a relationship.

Relevant paths: `docs/PROGRESS.md`, `docs/MARKETING.md`, `app/(onboarding)/welcome.tsx`, `supabase/templates/*.html`.

## 9. Writing voice and tone

Use:

- Warm, direct language.
- Couple-to-couple framing.
- Concrete shared practices: pray together, read together, check in, set boundaries, plan dates.
- Faith language that is explicit but encouraging.
- Gentle nudges toward partner linking.
- Plain words over church jargon.

Existing copy examples:

- "Grow closer to God and each other."
- "Start your journey of intentional love."
- "Bexhearts works best when both of you are here."
- "Start with a 7-day free trial."
- "Upgrade to Premium to unlock all features and deepen your relationship."

Avoid:

- "This will save your relationship."
- "Every Christian couple must..."
- "If he does not do this, leave."
- Shame-heavy purity messaging.
- Claims of pastoral, therapeutic, or clinical authority.

Relevant paths: `docs/MARKETING.md`, `app/(auth)/sign-up.tsx`, `app/(onboarding)/welcome.tsx`, `src/features/dashboard/components/WaitingForPartnerCard.tsx`, `src/components/ui/PremiumGate.tsx`.

## 10. Visual design language

Verified visual system:

- Light-only app.
- Cream background with cream/white cards.
- Purple primary actions and highlights.
- Warm secondary gold for premium/secondary emphasis.
- Muted green accent for answered prayer/action language.
- Square buttons and text inputs by owner convention.
- Rounded cards, badges, avatars, chips, and rating dots.
- Emoji tab/quick-action icons in current implementation.
- Serif display/scripture typography paired with sans body text.
- Minimal, quiet UI with cards for repeated feature surfaces.

Relevant paths: `src/theme/colors.ts`, `src/theme/typography.ts`, `src/theme/borderRadius.ts`, `src/components/ui/*`, `app/(tabs)/_layout.tsx`.

## 11. Color system

Implemented light palette:

- Primary purple: `#9849FA`.
- Background cream: `#F8F4EC`.
- Surface: `#FEFCF7`.
- Elevated surface: `#FFFFFF`.
- Text primary: `#1A1A17`.
- Text secondary: `#5C5C54`.
- Text tertiary: `#A8A89E`.
- Secondary warm gold scale anchored at `#D4963A`.
- Accent muted green scale anchored at `#5A8A6A`.
- Success: `#4A8A5A`.
- Warning: `#D49A3A`.
- Error: `#C05252`.

Dark-mode palette is documented in `docs/PROGRESS.md` but not implemented.

Relevant paths: `src/theme/colors.ts`, `app.config.ts`, `docs/PROGRESS.md`.

## 12. Typography

Implemented typography:

- iOS sans family: Avenir Next.
- Android sans family: system sans-serif.
- Serif/display family: Georgia on iOS, serif on Android.
- Display variants use serif bold.
- Scripture variant uses serif italic at 18/28.
- Body variants use sans regular.
- Labels and buttons use sans medium/semi-bold.

Relevant paths: `src/theme/typography.ts`, `src/components/ui/Text.tsx`.

## 13. Common UI patterns

Current app patterns:

- Expo Router stacks and tabs.
- `ScreenContainer` for standard screens.
- `KeyboardAvoid` for auth/onboarding/form screens.
- `Button` variants: primary, secondary, outline, ghost, danger.
- `Input` with labels, error text, and password eye toggle.
- `Card` variants: elevated, outlined, filled.
- `Badge` variants: default, success, warning, premium.
- `EmptyState` for empty feature lists.
- `PremiumGate` locked state with premium badge and unlock button.
- Pressable cards for navigation.
- Horizontal category chips for date filters.
- 1-5 circular rating controls for check-ins.
- Toast store exists, and some copy/share flows call `showToast`.

Relevant paths: `src/components/ui/*`, `src/components/layout/*`, `src/features/check-in/components/CheckInForm.tsx`, `app/(tabs)/dates/index.tsx`.

## 14. Relationship positioning

The relationship model is "one couple = two linked users."

Product truths:

- The couple row stores `partner_a_id`, optional `partner_b_id`, invite code, linked timestamp, streak fields, subscription tier, and relationship stage.
- The app is designed for shared activity, but solo waiting state is supported.
- Partner invite is the main activation mechanism.
- Relationship stage is captured as dating, engaged, or married.
- Documentation centers the beachhead on dating -> engaged -> newlywed.

Messaging implications:

- Lead with shared rhythms, not individual self-improvement.
- Use stage-specific examples, especially dating boundaries, premarital questions, and newlywed rhythms.
- Do not position "solo mode" as a product category.

Relevant paths: `supabase/migrations/00001_initial_schema.sql`, `supabase/migrations/00004_relationship_stage.sql`, `src/stores/couple.store.ts`, `docs/PROGRESS.md`, `docs/MARKETING.md`.

## 15. Faith positioning and its intended level of prominence

Faith is intended to be prominent, not subtle.

Verified signals:

- Docs lock positioning as "faith-forward, unapologetically."
- Devotionals are centered on scripture, reflection, and a couple action.
- Prayers are a first-class Connect feature and home quick action.
- Onboarding asks denomination optionally.
- Date ideas can include scripture ties.
- Marketing docs explicitly say Bexhearts is not a secular couples app with a Christian skin.

Tone constraints:

- Stay Christian and scripture-led.
- Stay denomination-neutral.
- Avoid doctrinal controversy.
- Avoid using scripture as a weapon in relationship advice.
- Present practices and prompts, not guaranteed outcomes.

Relevant paths: `docs/PROGRESS.md`, `docs/MARKETING.md`, `src/features/devotional/*`, `src/features/prayer/*`, `src/features/onboarding/components/ProfileSetupForm.tsx`, `supabase/seed.sql`.

## 16. Existing marketing direction

The marketing docs recommend:

- Organic-first growth because paid religious targeting is constrained.
- Pre-launch foundation first: handles, waitlist, hook bank, positioning.
- Slideshows as the first content format.
- Build-in-public on founder X.
- Warm-up content before launch.
- Real app assets/screens and authentic couple/faith framing.
- Fixed slideshow structure: hook, story/context/proof, CTA.
- Cross-posting to TikTok, Instagram Reels, YouTube Shorts, and X.
- Stage-themed accounts later for dating, engaged, and newlywed niches.
- North-star metric: weekly-active linked couples.

Pre-launch status from docs: `docs/MARKETING.md` says M0 is not started.

Relevant paths: `docs/MARKETING.md`, `docs/PROGRESS.md`.

## 17. Content pillars suitable for TikTok slideshows

Use these pillars for the research/adaptation system:

- Daily faith rhythm for couples.
- Scripture-led devotional habits.
- Prayer together and answered prayer journaling.
- Christian dating boundaries and temptation plans.
- Premarital questions and engaged-season preparation.
- Newlywed rhythms and weekly check-ins.
- Intentional date ideas with faith ties.
- Partner invite and "doing this together" activation.
- Building Bexhearts in public as a Christian couples app.
- Gentle accountability and communication.
- Stage-specific faith prompts: dating, engaged, married/newlywed.

Future-only pillars until implemented:

- Daily question reveal.
- Daily mood share.
- "Praying for you" tap.
- Challenges.
- Milestones/countdowns.
- Memories timeline.
- Widget.

Relevant paths: `docs/MARKETING.md`, `docs/PROGRESS.md`, `app/(tabs)/*`, `src/features/*`.

## 18. Implemented features that can safely be promoted now

For pre-launch/build-in-public or demo-style content, these claims are supported by code:

- "Bexhearts is being built as a Christian couples app."
- "The app includes a daily devotional screen with scripture, reflection, personal response, and a couple action."
- "Couples can create shared prayer requests and mark prayers answered."
- "Onboarding captures relationship stage: dating, engaged, or married."
- "Onboarding asks what you want to grow in, such as prayer, communication, spiritual growth, conflict, intimacy, and quality time."
- "Users can invite a partner with a code."
- "The home screen nudges solo users to invite their partner."
- "The app includes a date ideas library with categories and scripture ties."
- "There is a weekly check-in rating flow."
- "There are boundaries and temptation-plan screens."
- "Email confirmation and password reset use in-app 6-digit codes."

Use careful qualifiers:

- Say "being built" or "in development" until a public build exists.
- Say "wired in code" for social auth, purchases, and push unless verified on devices with production/staging services.
- Say "sample content" for devotionals/date ideas until real launch content packs are created.

Relevant paths: `app/(tabs)/*`, `app/(onboarding)/*`, `src/api/*`, `supabase/seed.sql`.

## 19. Features and claims that must not yet be advertised

Do not advertise these as live or working:

- Daily question reveal.
- Daily mood share.
- "Praying for you" tap.
- Partner push notifications.
- Couple challenges with progress.
- Milestones or countdowns.
- Memories timeline.
- Home-screen widget.
- Dark mode.
- Avatar upload.
- Real-time cross-device sync.
- Working streak growth.
- Full date completion with rating/notes in UI.
- Check-in gratitude/growth/prayer text notes in UI.
- Partner reflection reveal after both complete a devotional.
- Check-in comparison after both submit.
- Server-side premium enforcement.
- Per-couple billing inheritance.
- Production RevenueCat/Superwall purchase flow.
- Real launch content packs.
- Public availability in app stores.
- Claims that the app fixes, saves, heals, or guarantees relationship outcomes.

Relevant paths: `docs/PROGRESS.md`, `docs/STEPS.md`, `src/services/supabase/realtime.ts`, `src/api/devotionals.ts`, `src/api/check-ins.ts`, `src/api/dates.ts`.

## 20. Suggested TikTok slideshow concepts

Safe now for pre-launch/demo:

- "A Christian couples app I wish existed before we had to build habits from scratch."
- "What our nightly devotional flow looks like in Bexhearts."
- "A dating couple, an engaged couple, and newlyweds should not all get the same faith prompts."
- "We are building partner invite codes because this app is for two."
- "A shared prayer list feels different when both people can add to it."
- "Christian date ideas that are not just dinner and a movie."
- "The 3 numbers we want couples to check in on every week."
- "Why we ask relationship stage before showing the dashboard."
- "A tiny app detail: password reset uses a code, not a broken mobile link."
- "The difference between solo mode and a solo app."

Use only as future/research concepts until built:

- "Answer privately, reveal together."
- "A one-tap 'praying for you' button."
- "A couple memory timeline made from answered prayers."
- "A home-screen widget for verse, streak, and partner prayer."
- "7-day prayer challenge for couples."

## 21. Suggested hooks and calls to action

Hooks for safe content:

- "Christian couples do not need another chat app. They need a rhythm."
- "What if your relationship check-in started with faith, not a fight?"
- "We are building the app I wanted for Christian couples."
- "This is for the couple trying to pray together but never finding a rhythm."
- "Dating, engaged, and newlywed couples need different prompts."
- "Your partner should not need a second subscription to join you."
- "A shared prayer list should feel simple, not performative."
- "The app starts with one question: where are you in your journey?"

Calls to action for pre-launch:

- "Join the waitlist."
- "Follow the build."
- "Send this to your partner."
- "Comment 'dating', 'engaged', or 'newlywed' and we will share the prompt style."
- "Save this for your next relationship check-in."
- "Share this with a Christian couple who is trying to build better rhythms."

Avoid download CTAs until store availability is real.

## 22. Sensitive topics and messaging risks

Handle carefully:

- Religious belief is sensitive data in app-store privacy contexts.
- Denomination should remain optional and non-divisive.
- Boundaries, temptation, purity, intimacy, and conflict can trigger shame if framed poorly.
- Do not imply abuse survivors should fix unsafe relationships through prayer/check-ins.
- Do not offer therapy, counseling, legal, or pastoral authority claims.
- Do not present fake couple testimonials.
- Do not promise outcomes such as "save your marriage" or "guarantee purity."
- Do not shame couples who struggle to pray together.
- Do not advertise unbuilt features as live.
- Do not imply partner surveillance or control.

Recommended framing:

- "A rhythm to help you start the conversation."
- "A gentle prompt for prayer and reflection."
- "Built for couples who want faith at the center."
- "Talk to trusted pastoral or professional support for serious issues."

Relevant paths: `docs/MARKETING.md`, `docs/PROGRESS.md`, `docs/PROGRESS.md` release data-collection inventory.

## 23. Important application terminology

Use these terms consistently:

- Bexhearts.
- Partner.
- Couple.
- Relationship stage.
- Dating.
- Engaged.
- Married.
- Devotional.
- Scripture.
- Reflection.
- Couple action.
- Shared prayers.
- Answered prayer.
- Weekly check-in.
- Boundaries.
- Temptation plan.
- Date ideas.
- Invite code.
- Partner linking.
- Streak.
- Premium.
- 7-day free trial.
- Onboarding paywall.
- Growth focus.
- Solo mode or waiting for partner, but not "solo segment."

Avoid introducing new product names for unbuilt features unless the repo names them.

## 24. Relevant repository paths supporting major conclusions

Documentation:

- `README.md` - stack, local setup, app purpose, smoke-test instructions.
- `AGENTS.md` and `CLAUDE.md` - agent protocol and doc sync rules.
- `docs/PROGRESS.md` - source of truth for product state, phases, decisions, known bugs.
- `docs/STEPS.md` - build order and current implementation sequence.
- `docs/MARKETING.md` - go-to-market, slideshow workflow, hooks, guardrails.
- `docs/HANDOFF.md` - resume state and environment notes.
- `docs/B3-SETUP.md` - dev build and social sign-in setup notes.

Configuration:

- `package.json` - Expo/React Native dependencies and scripts.
- `app.config.ts` - app name, bundle/package ID, light mode, scheme, native plugins.
- `eas.json` - EAS build profiles with placeholders.
- `.env.example` - required public env names and placeholder behavior.
- `supabase/config.toml` - local Supabase ports, OTP auth config, external auth provider config. Do not expose provider IDs/secrets in marketing output.

Routes and screens:

- `app/index.tsx` - route gate.
- `app/(auth)/*` - auth screens.
- `app/(onboarding)/*` - onboarding and partner invite/link.
- `app/(tabs)/index.tsx` - dashboard.
- `app/(tabs)/devotional/*` - devotional routes.
- `app/(tabs)/connect/*` - prayers/check-ins/boundaries.
- `app/(tabs)/dates/*` - date ideas.
- `app/(tabs)/profile/*` - profile/settings/delete account.
- `app/modal/*` - prayer/check-in/boundary forms.

Feature and API layers:

- `src/api/*` - table access hooks.
- `src/services/supabase/*` - auth, client, database helpers, realtime helpers, secure storage.
- `src/features/auth/*` - auth forms/hooks/social auth.
- `src/features/onboarding/*` - profile, relationship stage, personalization, plan summary, invite/link.
- `src/features/dashboard/*` - quick actions, streak, waiting-for-partner.
- `src/features/devotional/*` - devotional UI.
- `src/features/prayer/*` - prayer UI.
- `src/features/check-in/*` - weekly check-in form/schema.
- `src/features/boundaries/*` - boundary form.
- `src/features/dates/*` - date idea cards.
- `src/features/subscription/*` - entitlement/offering hooks and subscription status.

Theme and components:

- `src/theme/colors.ts`, `src/theme/typography.ts`, `src/theme/borderRadius.ts`, `src/theme/spacing.ts`.
- `src/components/ui/*`, `src/components/layout/*`.

Backend:

- `supabase/migrations/00001_initial_schema.sql`.
- `supabase/migrations/00002_restrict_invite_lookup.sql`.
- `supabase/migrations/00003_delete_my_account.sql`.
- `supabase/migrations/00004_relationship_stage.sql`.
- `supabase/migrations/00005_account_deletion_grace.sql`.
- `supabase/migrations/00006_personalization.sql`.
- `supabase/seed.sql`.
- `src/types/database.ts`.

Tests:

- `__tests__/auth/*`.
- `__tests__/onboarding/relationshipStage.test.ts`.
- `__tests__/services/largeSecureStore.test.ts`.
- `__tests__/stores/*`.
- `__tests__/utils/*`.

## 25. Conflicts between documentation and implementation

Confirmed conflicts or stale docs:

- `docs/PROGRESS.md` says check-ins include three ratings plus gratitude/growth/prayer notes. The schema has those note fields, but `src/features/check-in/components/CheckInForm.tsx` only renders the three ratings.
- `docs/PROGRESS.md` marks Dates as browse, save, complete with rating/notes. `src/api/dates.ts` has `useCompleteDate`, and schema has `rating`/`notes`, but no UI was found for saved date list or completing a date with rating/notes.
- `docs/PROGRESS.md` still has an older line saying welcome -> profile setup sets `onboarding_completed`. Code sets `onboarding_completed` in `RelationshipStageForm`.
- `RelationshipStageForm` code comment says relationship stage is the last onboarding step, but the actual route continues to personalization and plan summary.
- Because `onboarding_completed` is set at relationship stage, restarting after that step can bypass personalization and plan-summary and route to partner invite.
- `docs/PROGRESS.md` says restore purchases is not surfaced in Profile/Settings UI, but `SubscriptionStatus` includes a "Restore Purchases" button on the Profile tab.
- Docs consistently describe per-couple billing as the intended model, but code still identifies RevenueCat by individual `user.id`.
- Docs describe social sign-in as pending owner verification. Code and local config show provider plumbing and provider config present, but actual on-device success cannot be verified from static repository inspection.
- Docs say core feature CRUD is wired but not smoke-tested against local Supabase; no local DB test evidence was found in code.

Known bugs still verified in implementation:

- `useCompleteDevotional` uses `.upsert()` without `onConflict: 'devotional_id,user_id'`.
- `useSubmitCheckIn` uses `.upsert()` without `onConflict: 'couple_id,user_id,week_of'`.
- `check_ins` has no UPDATE RLS policy in the initial migration.
- Streak display reads `couples.streak_count`, but no implementation updates it.
- Realtime helpers exist but are not called.

Relevant paths: `docs/PROGRESS.md`, `src/features/check-in/components/CheckInForm.tsx`, `src/api/dates.ts`, `src/features/onboarding/components/RelationshipStageForm.tsx`, `src/features/subscription/components/SubscriptionStatus.tsx`, `src/providers/AuthProvider.tsx`, `src/api/devotionals.ts`, `src/api/check-ins.ts`, `supabase/migrations/00001_initial_schema.sql`.

## 26. Open questions and uncertain findings

- Has the owner applied migrations `00004`, `00005`, and `00006` to the actual local/VPS database? The repo contains them and types include their columns, but this inspection did not connect to a database.
- Has the two-user partner-linking smoke test been run successfully since the latest code changes? Docs say owner still needs to run it.
- Are Apple and Google sign-in verified on an actual development build? Static code and config are present, but runtime provider verification is external.
- Are privacy policy and terms URLs live? The app points to `https://bexhearts.app/privacy` and `/terms`, but no network request was made.
- Is `bexhearts.app` the intended production domain even though docs also mention `bexhearts.com` for suggested legal URLs? The constants use `.app`; docs mention `.com` as suggested.
- Should `onboarding_completed` move later so personalization and plan summary cannot be skipped on restart?
- Should boundaries list access also be gated, or only boundary creation?
- Should saved dates and completed-date history become a first-class UI before marketing date completion?
- Should the check-in text-note fields be added to UI or removed from marketing claims?
- Should the subscription tier column be removed, synced from RevenueCat, or replaced by couple-level RevenueCat identity?
- Should the docs be updated to reflect that restore purchases is already visible on Profile?
- Should `APP_DOMAIN`, support email, privacy, and terms constants be treated as final or placeholders for release?

## 27. Date and Git branch used for this assessment

- Assessment date: 2026-06-27.
- Git branch: `authflow`.
- Git commit inspected: `0782279`.
- Working tree before edit: clean.
- Existing `docs/bexhearts-product-context.md`: not present before this assessment.
