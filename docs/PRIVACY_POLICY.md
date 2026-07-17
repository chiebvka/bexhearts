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

### Activity, points & leaderboard
- We record daily activity events (e.g. "completed a devotional", "prayer session", "check-in", "journal entry", "completed a date") to power streaks, the progress heatmap, and the points ledger.
- We also keep a couple-private **event history** (e.g. a grace day covering a missed streak day, a streak reset, a boundary retired, a plan resolved) so we can show you a transparent points/streak breakdown and, in the future, occasional recap cards (year-end and anniversaries — never weekly digests). This history is visible only to your couple and is deleted with the account.
- **Global leaderboard:** your couple appears pseudonymously by default — masked names (e.g. "t\*\*y & b\*\*\*\*i"), a couple number, and a country flag. Showing your real first names is **opt-in** and either partner can turn it off.
- Country is approximated from your device's region setting.

### Date-idea ratings
- When you rate a date idea, your star rating contributes to a **global, anonymous aggregate** other couples can see ("4.6 · 212 couples") — computed at the couple level with no names attached. Any written review stays visible **only to your couple**.

### Purchases
- Subscriptions are processed by Apple/Google and managed via **RevenueCat**. We receive subscription status and pseudonymous transaction identifiers — never your card number. Billing is per couple.

### Analytics & diagnostics
- We use **PostHog** for product analytics and **Superwall** for paywall display (both disabled/no-op unless configured). Analytics identify you by user ID and email [MINIMIZE AT LAUNCH: review whether email is necessary]. We purge identity from these SDKs when you sign out or delete your account.
- Device data: push token (when notifications ship), device timezone, app version.

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
- **Processors:** Supabase (database/auth/storage backend), Cloudflare (R2 photo storage), Anthropic (AI prayer composition, consent-gated), RevenueCat (subscriptions), Superwall (paywalls), PostHog (analytics), Apple/Google (sign-in, payments, push). Each receives only what its function requires.
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
- 2026-07-05 (b): Date-idea ratings added — anonymous couple-level aggregates are shown globally; review text stays couple-private.
- 2026-07-10: Check-in note sharing model documented (gratitude revealed after both submit; growth/prayer private w/ per-field share toggles). AI-prayer disclosure updated — in-app pre-compose sheet removed (owner decision); compose tap = recorded consent; policy is the disclosure surface (attorney/store-review note added). Couple-private event history (grace/reset/boundary events) added under activity data; recap cards limited to year-end + anniversaries (no weekly digests).
- 2026-07-05: Initial draft. Covers: email/Apple/Google auth; couple data; personal vs shared prayers (RLS); photos on R2; AI prayers via Anthropic (consent + crisis guard + no-training statement); activity log, points ledger, opt-in leaderboard w/ masked names + couple number + device-region flag; RevenueCat/Superwall/PostHog; 7-day deletion grace + partner hand-off; notifications section written ahead of the G1 build.
