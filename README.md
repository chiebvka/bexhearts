# Bexhearts

A mobile app for Christian couples — daily devotionals, shared prayer journal, weekly relationship check-ins, boundaries, and date ideas. Built with Expo (React Native) + Supabase.

> **For AI agents and contributors:** before doing ANY work, read [docs/PROGRESS.md](docs/PROGRESS.md). It is the single source of truth for what exists, what is broken, and what comes next. The full doc map (PROGRESS / STEPS / MARKETING) is indexed in [CLAUDE.md](CLAUDE.md).

---

## Stack at a glance

| Layer | Tech |
|---|---|
| App framework | Expo SDK 54, React Native 0.81, TypeScript |
| Navigation | Expo Router 6 (file-based, in `app/`) |
| Backend | Supabase (Postgres + Auth + Realtime). Local via Supabase CLI; production will be self-hosted on a VPS via Coolify |
| Server state | TanStack Query (hooks in `src/api/`) |
| Client state | Zustand (stores in `src/stores/`) |
| Forms | react-hook-form + zod |
| Payments | RevenueCat (purchases) + Superwall (paywalls) — both no-op gracefully when keys are unset |
| Analytics | PostHog — disabled in dev |
| Tests | Jest + jest-expo + React Native Testing Library |

---

## Part 1 — First-time setup (do this once)

### 1. Prerequisites

Install these if you don't have them:

1. **Node.js 20+** — check with `node -v`
2. **Docker Desktop** — Supabase local runs entirely in Docker. Download from docker.com if missing.
3. **Supabase CLI** — check with `supabase --version`. Install/update:
   ```bash
   brew install supabase/tap/supabase
   # or update: brew upgrade supabase
   ```
4. **(iOS testing)** Xcode from the Mac App Store, then open it once to accept the license and let it install the iOS Simulator.
5. **(Android testing)** Android Studio, then create a virtual device (AVD) via Tools → Device Manager.

### 2. Install app dependencies

```bash
cd /Users/Ebuka/Projects/bexhearts
npm install
```

### 3. Create your `.env`

```bash
cp .env.example .env
```

You'll fill in the Supabase values in the next step. RevenueCat / Superwall / PostHog keys can stay as placeholders — the app detects placeholder keys and skips those services entirely, so core functionality works without them.

---

## Part 2 — Starting the backend (every dev session)

### 1. Open Docker Desktop

Launch Docker Desktop and wait until the whale icon in the menu bar stops animating (it must say "Docker Desktop is running"). Nothing below works without this.

### 2. Start local Supabase

```bash
cd /Users/Ebuka/Projects/bexhearts
supabase start
```

The first run downloads Docker images (a few minutes). When it finishes it prints your local credentials.

**Note on migrations:** on a fresh start, the Supabase CLI automatically applies every file in `supabase/migrations/` (in order) plus `supabase/seed.sql`. If you prefer to apply SQL by hand instead (your stated preference, and what you'll do on the VPS), you can open the files and paste them into the Studio SQL Editor — see "Applying migrations manually" below. Either way, **never edit applied migration files**; new schema changes go in NEW numbered migration files.

This project uses **custom ports** (set in `supabase/config.toml`) so it never clashes with the Supabase instance for your desktop app:

| Service | URL |
|---|---|
| API (this goes in `.env`) | `http://127.0.0.1:55321` |
| Database (direct Postgres) | `postgresql://postgres:postgres@127.0.0.1:55322/postgres` |
| **Studio (the dashboard)** | `http://127.0.0.1:55323` |
| Inbucket (catches all auth emails locally — signup confirmations, password resets) | `http://127.0.0.1:55324` |

### 3. Get your keys into `.env`

```bash
supabase status
```

Copy the `anon key` value into `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<the anon key from supabase status>
```

### 4. Verify in Studio

Open `http://127.0.0.1:55323` in your browser. You should see the `bexhearts` project with these tables under **Table Editor → public**: `profiles`, `couples`, `devotionals`, `devotional_progress`, `prayers`, `check_ins`, `boundaries`, `date_ideas`, `couple_dates`. The `devotionals` table should contain 7 seeded rows and `date_ideas` 10 rows. If the tables are missing, the migrations didn't apply — see the next section.

### 5. Stopping (end of session)

```bash
supabase stop          # keeps your data
supabase stop --no-backup   # wipes data (fresh start next time)
```

---

## Applying migrations manually (Studio SQL Editor)

This is the workflow you'll use on the VPS, and locally if you want full control:

1. Open Studio → **SQL Editor** (local: `http://127.0.0.1:55323`, VPS: your Coolify-hosted Studio URL).
2. Open each file in `supabase/migrations/` **in numeric order** and paste + Run:
   1. `00001_initial_schema.sql` — all tables, functions, triggers, RLS policies, realtime config
   2. `00002_restrict_invite_lookup.sql` — drops the public invite-code lookup policy
3. Then paste + Run `supabase/seed.sql` (sample devotionals + date ideas).
4. To make TypeScript types match the real database, regenerate them:
   ```bash
   supabase gen types typescript --local > src/types/database.ts
   ```
   (Current `src/types/database.ts` is hand-written to match the schema; regenerating makes it authoritative.)

**Rule:** schema changes are ALWAYS made by adding a new file `supabase/migrations/0000X_description.sql`, never by editing old ones. That keeps local and VPS databases reproducible from the same files.

---

## Part 3 — Running the app

With Supabase running and `.env` filled:

```bash
npm start          # starts the Expo dev server (Metro)
```

Then press:
- **`i`** — open in the iOS Simulator (needs Xcode)
- **`a`** — open in an Android emulator (needs Android Studio + a running AVD)
- Or scan the QR code with the **Expo Go** app on a physical phone

### What works where

| Feature | Expo Go | Dev build |
|---|---|---|
| Auth, devotionals, prayers, check-ins, boundaries, dates (all core flows) | ✅ | ✅ |
| Push notifications | ❌ (removed from Expo Go since SDK 53) | ✅ |
| RevenueCat purchases / Superwall paywalls | ❌ (native modules; app skips them when keys are placeholders) | ✅ |
| Apple Sign-In | ❌ | ✅ |

For day-to-day functionality work, **Expo Go is enough**. Build a dev build only when you start testing payments/notifications (see Part 6).

### ⚠️ Testing on a physical phone — the #1 gotcha

A real phone cannot reach `127.0.0.1` (that's the phone itself, not your Mac). If sign-in hangs/fails on a physical device:

1. Find your Mac's LAN IP: `ipconfig getifaddr en0` (e.g. `192.168.1.50`)
2. In `.env`, set `EXPO_PUBLIC_SUPABASE_URL=http://192.168.1.50:55321`
3. Restart Metro with cache cleared: `npx expo start -c` (env vars are baked in at bundle time — **always restart with `-c` after editing `.env`**)
4. Phone and Mac must be on the same Wi-Fi network.

Simulators/emulators don't have this problem (the iOS Simulator shares the Mac's network; if you ever hit issues on Android emulator, use `http://10.0.2.2:55321`).

### Manual smoke test (the partner-linking flow needs two users)

1. Sign up as user A (any email — confirmation emails are caught by Inbucket at `http://127.0.0.1:55324`; email confirmation is disabled locally so you're signed in immediately).
2. Complete profile setup → you land on the partner-invite screen → generate an invite code.
3. Sign out (or use a second simulator), sign up as user B.
4. Complete user B's profile → choose "I have a code" → enter A's code.
5. Both users should now land on the dashboard with each other's avatar visible.

---

## Part 4 — Tests, types, lint

```bash
npm test             # run all Jest tests once
npm run test:watch   # re-run on file change
npm run typecheck    # TypeScript check, no build
npm run lint         # ESLint via expo lint
```

### What's inside `__tests__/`

```
__tests__/
├── setup/
│   ├── jest.setup.ts      # Global mocks loaded before every test file.
│   │                      # Mocks every native module (AsyncStorage, MMKV, expo-haptics,
│   │                      # expo-notifications, expo-device, NetInfo, RevenueCat, Superwall,
│   │                      # PostHog) so tests run in plain Node — no simulator, no Docker,
│   │                      # no network. Supabase itself is NOT mocked here; tests that need
│   │                      # it mock it per-file.
│   └── test-utils.tsx     # `renderWithProviders()` — wraps a component in a fresh
│                          # QueryClientProvider and lets you pre-seed the Zustand auth/couple
│                          # stores. Use this instead of RNTL's bare `render` whenever a
│                          # component touches queries or stores.
├── stores/
│   ├── auth.store.test.ts   # Verifies session set/clear → isAuthenticated/isLoading flags
│   └── couple.store.test.ts # Verifies couple context, isLinked derivation, streak, clear
└── utils/
    └── invite-code.test.ts  # generateInviteCode (length, charset, no ambiguous chars O/0/I/1/L),
                             # isValidInviteCode, formatInviteCode (ABC-DEF display format)
```

How it's wired: `jest.config.js` uses the `jest-expo` preset, maps `@/*` → `src/*` (matching `tsconfig.json`), and only picks up files matching `__tests__/**/*.test.ts(x)`. The long `transformIgnorePatterns` list exists because React Native libraries ship untranspiled ES modules that Jest must run through Babel.

Currently only stores and utils are covered. The valuable next layer is component tests (forms via `renderWithProviders`) and API hook tests with a mocked Supabase client — tracked in docs/PROGRESS.md.

---

## Part 5 — Production backend (self-hosted Supabase on VPS via Coolify)

When you're ready to point the app at your VPS:

1. **Deploy Supabase in Coolify** — Coolify has a one-click Supabase service template. Deploy it, set strong values for `POSTGRES_PASSWORD` and `JWT_SECRET`, and note the generated `ANON_KEY` / `SERVICE_ROLE_KEY`.
2. **Put it behind HTTPS** — Coolify handles this with a domain + automatic Let's Encrypt cert (e.g. `https://supabase.yourdomain.com`). **Never ship the app pointing at plain http for production.**
3. **Apply the schema** — open the self-hosted Studio → SQL Editor → paste each `supabase/migrations/` file in order, then `seed.sql` (replace seed content with real devotional content when ready).
4. **Configure auth for production:**
   - Set up SMTP (e.g. Resend, Postmark) in the Supabase auth config so signup/reset emails actually send — locally Inbucket fakes this.
   - Decide on email confirmation: it's disabled locally; if you enable it in production you must implement deep-link handling for the confirmation link (`bexhearts://` scheme is already configured in `app.config.ts`).
   - Set `site_url` and redirect allow-list to your `bexhearts://` scheme.
5. **Point the app at it** — production env values (via EAS environment variables or `eas.json` `env` blocks, not your local `.env`):
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://supabase.yourdomain.com
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<vps anon key>
   ```
6. **Keep schema in sync forever after** — every change = new migration file in the repo, applied to local first, then pasted into the VPS Studio when releasing. The repo's `supabase/migrations/` folder is the source of truth for BOTH environments.

---

## Part 6 — Building & shipping the app (EAS)

Build profiles are already defined in `eas.json` (`development`, `preview`, `production`).

### One-time EAS setup

```bash
npm install -g eas-cli
eas login                # your Expo account
eas init                 # creates the project, gives you a real projectId
```

Then replace the `your-eas-project-id` placeholder in `app.config.ts` (`extra.eas.projectId`) with the real ID.

### Dev builds (for testing native features: push, purchases, Apple Sign-In)

```bash
eas build --profile development --platform ios       # installable on simulator (simulator: true is set)
eas build --profile development --platform android   # installable .apk
```

Install the build on your device/simulator, then `npm start` and connect — it behaves like Expo Go but with all native modules included.

### Preview builds (share with real testers)

```bash
eas build --profile preview --platform all
```

Internal distribution — installable via a link on registered devices, no store review needed.

### Production & store submission

```bash
eas build --profile production --platform all
eas submit --platform ios        # needs the Apple credentials in eas.json filled in
eas submit --platform android    # needs a Google Play service account key
```

Before the first production build:
- iOS: Apple Developer account ($99/yr), create the app in App Store Connect, fill the real `appleId` / `ascAppId` / `appleTeamId` in `eas.json`.
- Android: Google Play Console account ($25 once), create the app, first upload is manual.
- Test purchases end-to-end with **sandbox testers** (App Store Connect) / **license testers** (Play Console) on a preview/production build — never possible in Expo Go.
- iOS beta testing happens through **TestFlight** (upload via `eas submit`, add testers); Android via **Play Console internal testing track**.

---

## Project layout

```
app/                  # Screens (Expo Router). Folder = route. (auth), (onboarding), (tabs), modal/
src/
├── api/              # TanStack Query hooks per domain — the ONLY place that queries Supabase tables
├── components/       # Shared UI primitives (Button, Card, Input…) + layout components
├── constants/        # App constants, analytics event names, entitlement/paywall ids
├── features/         # Feature modules: components + hooks + zod schemas per feature
├── hooks/            # Generic hooks (app state, network status, refetch-on-focus)
├── lib/              # Small pure helpers (dates, haptics, platform, storage)
├── providers/        # AppProviders = GestureHandler > Query > Auth > Notification > BottomSheet
├── services/         # External SDK wrappers: supabase/, revenuecat/, superwall/, analytics/, notifications/
├── stores/           # Zustand: auth, couple, onboarding, ui
├── theme/            # Design tokens (colors, spacing, typography…)
├── types/            # database.ts (Supabase types), api.ts (derived row/insert/update types)
└── utils/            # invite-code, error messages, validation
supabase/
├── config.toml       # Local stack config (custom ports 5532x)
├── migrations/       # Numbered SQL migrations — source of truth for the schema
└── seed.sql          # Sample devotionals + date ideas
__tests__/            # Jest tests (see Part 4)
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `supabase start` hangs or errors | Is Docker Desktop actually running? Then `supabase stop` and retry. |
| App throws "Missing EXPO_PUBLIC_SUPABASE_URL…" on launch | `.env` missing or empty — copy `.env.example`, fill values, restart with `npx expo start -c` |
| Changed `.env` but app doesn't see it | Env vars are baked at bundle time — always `npx expo start -c` after editing |
| Sign-in works on simulator, fails on phone | The `127.0.0.1` gotcha — see Part 3 |
| "Invalid or expired invite code" | Codes expire 48h after generation; generate a fresh one. Also expired the moment a partner links. |
| Auth emails never arrive locally | They're all in Inbucket: `http://127.0.0.1:55324` |
| Port conflict with your other project's Supabase | This project uses 55321–55324; check what the other one uses, adjust in `supabase/config.toml` if needed |
