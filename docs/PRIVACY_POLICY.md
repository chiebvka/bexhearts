# Bexhearts Privacy Policy

> **⚠️ DRAFT — for attorney review before publication. Not legal advice.**
> Living document: whenever a feature changes what data we collect, process, share, or retain, update the matching section IN THE SAME PASS (rule in `CLAUDE.md`/`AGENTS.md`). Last updated: **2026-07-05**.

_Effective date: TBD (launch). Contact: support@bexhearts.app. Data controller: [LEGAL ENTITY TBD]._

## 1. What Bexhearts is

Bexhearts is a mobile app for Christian couples: shared devotionals, prayers, check-ins, boundaries, dates, a couple journal, and progress features. Because of the app's nature, some of what you share is **religious in nature — sensitive personal data** in many jurisdictions (e.g. GDPR Art. 9). We treat everything in this policy with that in mind.

## 2. Data we collect

### Account & profile
- Email address, full name, hashed authentication credentials.
- Optional: avatar (an illustrated preset or a photo you upload), denomination, relationship stage, growth-focus selections, timezone.
- **Sign in with Apple:** we receive your name and email (or Apple's private relay email) and a token proving your identity. We never receive your Apple password. [TODO at B3 verify: token revocation on account deletion.]
- **Sign in with Google:** we receive your name, email, and profile picture reference via Google's ID token. We never receive your Google password.

### Couple data (shared between you and your partner)
- Your couple link, relationship stage, streaks, grace days, invite codes.
- Shared prayers, weekly check-ins, boundaries and temptation plans, saved/planned/completed dates (with ratings and notes), journal moments and milestones, reactions and notes on them.
- **Weekly check-in notes:** your ratings and your "something you appreciated" note are revealed to your partner **only after you have both checked in that week**. Your "area to grow" note and prayer request stay private to you unless you turn on that field's **share with partner** toggle. (Sharing is enforced in the app's display logic; both partners' entries live in the couple's shared database space.)
- **Personal prayers are visible only to you** — your partner cannot access them (enforced at the database level).

### Photos
- Photos you attach to moments or your avatar are uploaded to our storage provider (Cloudflare R2). Image URLs are unguessable but technically public links; do not upload photos you wouldn't want accessible by link. [Roadmap: signed, expiring links.]

### AI-composed prayers (optional)
- Tapping **"Compose a prayer"** sends the text of that prayer request (title + details) to **Anthropic** (Claude) to compose a prayer and select a Bible verse — the tap is your consent, recorded the first time you use it. The composed result is stored with the prayer. We do not send your name, email, or other profile data with the request. Requests flagged as crisis content are never sent. The feature is entirely optional; the app works fully without it. [ATTORNEY/STORE-REVIEW NOTE 2026-07-10: the in-app pre-compose disclosure sheet was removed at the owner's direction; this policy is now the primary disclosure. Revisit whether an in-app notice is required for GDPR Art. 9 explicit-consent standards and App Store review before launch.]

### On-device cache & crash reporting
- To keep the app usable on poor connections, your last-synced content (including devotionals, prayers, journal entries, and streak data) is cached **locally on your own device**. This cache never leaves your phone, expires within a day, and is removed when you delete the app. Photos you add while offline are queued on-device and upload automatically when a connection returns.
- **Crash reporting (Sentry):** on production builds we may collect crash and error reports (device model, OS version, app version, and the technical error) to fix bugs. Crash reports are configured to exclude personal identifiers and never include prayer, journal, or check-in content. Crash reporting is off entirely in development builds without a reporting key.

### Activity, points & leaderboard
- We record daily activity events (e.g. "completed a devotional", "prayer session", "check-in", "journal entry", "completed a date") to power streaks, the progress heatmap, and the points ledger. Derived streak statistics (your current streak, your longest-ever streak and its dates, and per-activity bests) are computed from this data and stored with your couple record — they contain no content, are visible only to your couple, and are deleted with the account.
- We also keep minimal **usage counters** (a per-couple count of AI prayer compositions and photo uploads per day) purely to enforce fair-use limits. Counters contain no content — just a number per day — and are deleted with the couple.
- We also keep a couple-private **event history** (e.g. a grace day covering a missed streak day, a streak reset, a boundary retired, a plan resolved) so we can show you a transparent points/streak breakdown and, in the future, occasional recap cards (year-end and anniversaries — never weekly digests). This history is visible only to your couple and is deleted with the account.
- **Global leaderboard:** your couple appears pseudonymously by default — masked names (e.g. "t\*\*y & b\*\*\*\*i"), a couple number, and a country flag. Showing your real first names is **opt-in** and either partner can turn it off.
- Country is approximated from your device's region setting. We also store your device's timezone (e.g. "America/Toronto") to compute streak day boundaries and, for long-distance couples, to show each partner the other's local time.

### Notifications
- The app keeps an in-app **notification inbox** (title, short generic message, when it happened, whether you've read it). **Notification content never includes your prayer, journal, or check-in text** — it says things like "A new shared prayer was added"; the content itself stays in the app behind the tap.
- **Push notifications** are optional (you grant or deny the OS permission) and controllable per category in Settings; account/security notices are always delivered in-app. Your device push token is stored on your profile, removed when you sign out or delete your account, and pushes are delivered via Expo's push service (Apple/Google infrastructure carries them to your device).
- Each partner controls their **own** notification preferences and quiet hours; one partner's settings never change the other's.

### Date-idea ratings
- When you rate a date idea, your star rating contributes to a **global, anonymous aggregate** other couples can see ("4.6 · 212 couples") — computed at the couple level with no names attached. Any written review stays visible **only to your couple**.

### Purchases
- Subscriptions are processed by Apple/Google and managed via **RevenueCat**. We receive subscription status and pseudonymous transaction identifiers — never your card number. Billing is per couple.

### Analytics & diagnostics
- We use **PostHog** for product analytics. Analytics identify you by your **user ID only — we do not send your email address or your name to our analytics provider.**
- **We send structural events only.** Analytics records *that* something happened and where — an app open, an onboarding step finished, the paywall shown, a subscription started, a devotional completed — never *what you wrote*. **Your prayers, journal entries, check-in notes, boundaries, temptation plans and photos are never sent to our analytics provider.** This is enforced in code: every event property is checked against a fixed list of allowed, non-content fields, and anything else is discarded before it leaves your device.
- Session replay (screen recording) is **permanently disabled**.
- Device data: push token, device timezone, app version.
- **Superwall was removed from the app in July 2026** and no longer receives any data.

## 3. How we use data
- Provide the product (sync between partners, streaks, journal, prayers).
- Compose AI prayers (only with consent, as above).
- Process subscriptions and restore purchases.
- Compute points and (pseudonymous by default) leaderboard standings; run any future rewards program per its own terms.
- Send notifications you've enabled (when the notification system ships): partner activity (e.g. "praying for you", date suggestions), reminders/digests, and account/security messages. Categories will be individually controllable.
- Improve the app via aggregate analytics.
- We do **not** sell personal data, and we do **not** use prayer or journal content for advertising or model training.

## 4. Sharing
- **Your partner:** shared spaces are shared — see §2. Unlinking/deletion effects in §6.
- **Processors:** Supabase (database/auth/storage backend), Cloudflare (R2 photo storage), Anthropic (AI prayer composition, consent-gated), RevenueCat (subscriptions), PostHog (analytics), Sentry (crash reports), Apple/Google (sign-in, payments, push). Each receives only what its function requires. *(Superwall was removed in July 2026 and is no longer a processor.)*
- **Legal:** if required by law, or to protect users from imminent harm.
- No third-party advertising SDKs.

## 5. Retention
- Account data: for the life of the account.
- Deletion: requesting account deletion starts a **7-day grace period** (sign back in to cancel). After it lapses, your profile and authored content are permanently deleted. Content your partner co-owns (the couple record, their own entries) survives with them — see §6.
- AI prayer cache: deleted with the prayer/account.
- Points/activity: deleted with the account; anonymized aggregates may be retained.
- Backups purge on their rotation schedule [DEFINE: e.g. 30 days].

## 6. Your partner and your data
- Unlinking or deleting your account is **non-destructive to your partner**: they keep the couple space and their own content; your authored rows are removed with you.
- A banned or deleted partner does not delete *your* content.

## 7. Your rights
Access, correction, export, deletion, consent withdrawal (AI prayers can be disabled any time; withdrawal stops future processing). EU/UK: GDPR rights incl. complaint to a supervisory authority; explicit consent is our basis for processing religious content you choose to enter. California: CCPA rights; we do not sell personal information. Contact support@bexhearts.app.

## 8. Children
Bexhearts is for adults (17+). We do not knowingly collect data from children.

## 9. Security
Encrypted in transit (TLS) and at rest; session tokens stored encrypted on device; row-level security separates couples; AI/storage keys live server-side only. No system is perfectly secure; we'll notify you of breaches as required by law.

## 10. Changes
We'll post changes here and, for material changes, notify you in-app before they take effect.

---
### Change log (internal — keep updated, newest first)
- 2026-07-28: **Analytics section rewritten, and it is now a data-MINIMISATION change, not an expansion.** (1) The "[MINIMIZE AT LAUNCH: review whether email is necessary]" flag is **resolved — email removed.** `identify()` now sends the Supabase user UUID and nothing else, so our analytics provider no longer holds an address alongside religious-practice behaviour. (2) Analytics went from a stub to live, so the policy now states plainly what is sent: **structural events only** (app opens, onboarding steps, paywall shown, subscription started, devotional completed, D1/D7 return), never prayer, journal, check-in, boundary or photo content — enforced in code by a fixed allowlist of non-content property keys that discards anything else before it leaves the device. (3) **Session replay permanently disabled** (screen recording of a prayer journal is not acceptable). (4) **Superwall removed** as an SDK and as a processor (it no longer compiles and was never used — the paywall is our own); Sentry added to the processor list to match the H2 disclosure already in §"On-device cache & crash reporting". **⚠️ Attorney/store note:** the nutrition-label answers derived from this are written up in `docs/APP_STORE.md` §5 and declare **Sensitive Info → religious beliefs** deliberately. Sync the site's /privacy page copy when next deployed.
- 2026-07-27: **Data export added (journal → PDF).** Users can generate a PDF of their own journal (moments + photos, milestones, completed dates, answered prayers) on-device and share it via the OS share sheet; **nothing is uploaded to produce it**. Active prayers are opt-in; **boundaries and temptation plans are excluded by default** and only ever include entries the exporting user authored — never their partner's. This is the export path the Terms flag as potentially legally required, and it partially answers the E14 concern that a person leaving a couple loses access to shared memories. **⚠️ Attorney note:** the 30-day post-breakup archive is still NOT built; export must be used *before* leaving. Sync the site's /privacy page copy when next deployed.
- 2026-07-27 (b): **Comp / free-access list added (migration 00036).** A server-side allowlist of email addresses (and, for Apple "Hide My Email" relay users, couple IDs) granted free access. Stored: the address or couple id, an internal label, and grant/expiry/revocation timestamps — no other personal data. **Not readable by any client** (row-level security with no policies); only a server function can consult it, and only about the requesting user. Retained until revoked so the record of the grant survives. Sync the site's /privacy page copy when next deployed.
- 2026-07-26: E12 — the couple's streak/day-boundary timezone is now derived from the partners' device timezones (westernmost wins) rather than the couple creator's; the partner's local time and an "asleep" indicator are shown to the other partner, derived from the timezone + quiet-hours setting already disclosed above. No new categories of data. Sync the site's /privacy page copy when next deployed.
- 2026-07-25 (c): E11 long-distance mode — timezone storage clarified (streak day boundary + partner's local-time display; the profiles column existed since launch schema, the app now writes real device values). `couples.is_long_distance` is couple-shared relationship data, already covered under couple data. Sync the site's /privacy page copy when next deployed.
- 2026-07-25 (b): H2 reliability round — "On-device cache & crash reporting" section added: device-local query cache (incl. prayer bodies — owner call: cache everything locally, disclose here, it never leaves the device), offline photo upload queue, Sentry crash reporting (no PII, no religious content, off without a DSN). Sync the site's /privacy page copy when next deployed.
- 2026-07-25: Derived streak statistics clarified under activity data (E10: longest-streak record + dates on the couple record, per-activity all-time bests computed server-side). No new collection — processing of already-disclosed activity events. Sync the site's /privacy page copy when next deployed.
- 2026-07-18 (b): Notifications section added (G1): in-app inbox + per-user prefs + quiet hours; generic payloads only — no prayer/journal/check-in content in notifications; push token stored on profile, cleared on sign-out/deletion; Expo push transport disclosed. Sync the site's /privacy page copy when next deployed.
- 2026-07-18: Fair-use usage counters documented (per-couple daily counts of AI compositions + upload presigns, no content, deleted with the couple; migration 00026). Sync the site's /privacy page copy when next deployed.
- 2026-07-05 (b): Date-idea ratings added — anonymous couple-level aggregates are shown globally; review text stays couple-private.
- 2026-07-10: Check-in note sharing model documented (gratitude revealed after both submit; growth/prayer private w/ per-field share toggles). AI-prayer disclosure updated — in-app pre-compose sheet removed (owner decision); compose tap = recorded consent; policy is the disclosure surface (attorney/store-review note added). Couple-private event history (grace/reset/boundary events) added under activity data; recap cards limited to year-end + anniversaries (no weekly digests).
- 2026-07-05: Initial draft. Covers: email/Apple/Google auth; couple data; personal vs shared prayers (RLS); photos on R2; AI prayers via Anthropic (consent + crisis guard + no-training statement); activity log, points ledger, opt-in leaderboard w/ masked names + couple number + device-region flag; RevenueCat/Superwall/PostHog; 7-day deletion grace + partner hand-off; notifications section written ahead of the G1 build.
