# B3 SETUP — Dev Build + Social Sign-In (Apple + Google)

> **✅ STATUS (2026-06-21): dev build built + app-side wiring COMPLETE + gate green.** What's left is **owner credentials + flipping two config switches + an on-device verify** — no more code. Jump to **Part 4** for the exact checklist. Parts 1–3 below are kept for reference / context.
>
> **For the owner to action.** B3 needs a **development build** (Expo Go can't run native auth/MMKV/RevenueCat/Superwall) plus credentials from Apple & Google. The dev build is done and the code is wired; you now (a) finish creating the Apple/Google credentials, (b) flip `enabled = true` for each provider in `supabase/config.toml` + set env, (c) rebuild & verify on the simulator/device.
>
> Bundle ID (both platforms): **`com.bexhearts.app`**. You self-host Supabase on the VPS, so provider config goes in your **GoTrue env / Supabase Studio Auth settings**, not a hosted dashboard.

---

## Part 1 — Development Build (do this first; no external accounts needed)
Gets a dev client running on the iOS simulator. Prereqs: Xcode 26.5 ✓ already installed.

1. **Install CocoaPods:** `brew install cocoapods`
2. **Dedupe RevenueCat** (Superwall bundles its own `react-native-purchases@7.x` vs our `8.x` — `expo-doctor` flagged it). The agent will add a `package.json` `overrides` to force one version **and verify Superwall's purchase controller still works** — flag for the new chat, don't hand-edit.
3. **Prebuild:** `npx expo prebuild --clean` (generates `ios/` + `android/` — both are gitignored).
4. **Build & run:** `npx expo run:ios` (or `npm run ios`) — first build ~10–20 min; installs + launches the dev build on the simulator and starts Metro.
5. **Android dev build (optional now):** `npx expo run:android` (or `npm run android`) — same `bexhearts/` folder, but start an Android Studio emulator (AVD) first. iOS-first is fine; defer Android.

✅ **Once the dev build launches and reaches sign-in, the worklets/Expo-Go workarounds no longer constrain us** (the build compiles our exact native versions).

---

## Part 2 — Apple Sign In
We use the **native** flow (`expo-apple-authentication` → `signInWithIdToken`), which keeps the credential setup minimal.

1. **Enroll in the Apple Developer Program** ($99/yr) — https://developer.apple.com/programs/ — *(start early).* **Use a NEW, dedicated business Apple ID created with a `bexoni.com` email — NOT your personal Apple ID** (it becomes the permanent Account Holder). Entity type: **Organization (Bexoni)** if it's a registered business (needs a free **D-U-N-S number**, ~few days) — preferred for the agency; otherwise **Individual** now and transfer the app to a Bexoni org account later. Note your **Team ID**. *(Local dev build + simulator testing need no paid account — start building regardless.)* Same dedicated-business-account principle applies to Google (Play Console + Cloud).
2. **Identifiers → App IDs:** create/select App ID **`com.bexhearts.app`**, enable the **"Sign In with Apple"** capability.
3. **Supabase config:** in your VPS Supabase, enable the **Apple** auth provider and set the **allowed client IDs** to include **`com.bexhearts.app`** (the native bundle ID = the token audience). For the *native id-token* flow this is sufficient — you do **not** need a Services ID or `.p8` key (those are only for the web redirect flow we're not using).
4. App side is mostly ready: `expo-apple-authentication` plugin + bundle ID are already in `app.config.ts`; `authService.signInWithApple` exists. The agent adds the button + wiring.
5. **Testing:** sign in with the Apple ID in the simulator's Settings, or use a real device. Apple sign-in only renders on iOS.

---

## Part 3 — Google Sign In
Native flow via `@react-native-google-signin/google-signin` → `signInWithIdToken`.

1. **Google Cloud Console** (https://console.cloud.google.com) → create a project (e.g. "Bexhearts").
2. **APIs & Services → OAuth consent screen:** configure (External, app name, support email, scopes: email + profile).
3. **Credentials → Create OAuth client ID** — create **three**:
   - **Web** client ID (+ secret) — Supabase uses this; it's also the `webClientId` for google-signin.
   - **iOS** client ID — bundle ID `com.bexhearts.app`. Note its **reversed client ID** (URL scheme).
   - **Android** client ID — package `com.bexhearts.app` + the keystore **SHA-1** (get it after the Android dev build / from EAS credentials; can defer if iOS-first).
4. **Supabase config:** enable the **Google** provider; set the **Web client ID + secret**; add the **iOS** (and Android) client IDs to the allowed/authorized client IDs.
5. App side (agent does this): add `@react-native-google-signin/google-signin` + its config plugin (with the iOS reversed client ID), wire the button to `signInWithIdToken({ provider: 'google', token })`.

---

## Part 4 — Bring-back checklist (paste these into the new chat)
- [ ] Dev build runs on the iOS simulator (`expo run:ios` succeeded)? y/n
- [ ] **Apple:** Team ID = `____`; App ID `com.bexhearts.app` has "Sign In with Apple" enabled; Apple provider enabled in Supabase with allowed client ID `com.bexhearts.app`.
- [ ] **Google Web** client ID = `____` (+ secret stored in Supabase, not the repo)
- [ ] **Google iOS** client ID = `____`; reversed client ID (URL scheme) = `____`
- [ ] **Google Android** client ID = `____` (or "deferring Android")
- [ ] Google provider enabled in Supabase with the Web client ID + secret + the iOS/Android client IDs allowed.

> 🔒 Never paste the Google client **secret** or any key into the repo/chat as committed code — it lives in your Supabase/GoTrue config only. The client **IDs** are fine to share.

---

## FAQ / clarifications
- **`com.bexhearts.app` is a bundle ID, NOT a domain** — don't buy anything; it's just a unique reverse-DNS-style name (you already own bexhearts.com).
- **RevenueCat & Superwall accounts are NOT needed for the dev build or B3** — both SDKs no-op gracefully without keys. Create them (free tiers) in **Stage F (monetization)**.
- **Codemagic / EAS not needed now** — `npx expo run:ios` builds **locally** on the Mac (Xcode) to the simulator. Pick a cloud builder (default **EAS**) only at release (Stage J).
- **Apple $99/yr** has no individual/student discount (waivers only for nonprofit/edu/gov). The **15%** rate = App Store **Small Business Program** (<$1M/yr), enrolled later. **Google Play** = one-time **$25**, 15% on first $1M.
- You can build/run on the **simulator with a free Apple ID**; the paid program is needed to enable "Sign in with Apple" for submission + TestFlight/ship.

## ✅ What the wiring agent already did (2026-06-21) — DONE, don't redo
- **Dev build**: confirmed built (CocoaPods, `ios/` prebuilt, `Podfile.lock`, scripts → `expo run:`). RC dedupe **deferred to Stage F** (not a blocker — autolinking uses top-level RC 8.x; forcing Superwall onto 8.x needs runtime verification only possible once Superwall/RevenueCat have keys).
- **Code (B3·M1–M3)**: `@react-native-google-signin/google-signin` v16 installed; conditional config plugin in `app.config.ts` (adds the iOS URL scheme only when `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` is set). `authService.signInWithGoogle/signInWithApple` → `signInWithIdToken`. `src/features/auth/socialAuth.ts` = native token-getters (`getAppleIdentityToken`, `getGoogleIdToken`, both null-on-cancel) + `isGoogleSignInConfigured()` graceful gate. `SocialAuthButtons` on **sign-in + sign-up** (native Apple button iOS-only, Google when configured → Apple-always-with-Google satisfies the App Store rule, per-method "last used" tag). `useAuth.signInWithApple/signInWithGoogle` orchestrate + `setLastUsedMethod('apple'|'google')`. Tests: `__tests__/auth/socialSignIn.test.ts` + `socialAuth.test.ts`. `supabase/config.toml` providers pre-wired (`enabled = false`).

## What's left (owner) — then it verifies itself on the dev build
1. **Apple** (acct under review ~2 business days): once approved + App ID `com.bexhearts.app` has "Sign In with Apple" → set `[auth.external.apple] enabled = true` in `supabase/config.toml` → `supabase stop && supabase start`. No secret needed (native flow). Tap "Continue with Apple" in the dev build.
2. **Google**: finish the **iOS OAuth client** (bundle ID `com.bexhearts.app`; App Store ID OPTIONAL). Then: in `.env` set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` (reversed iOS client ID); export `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` (=Web id) + `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` (=Web secret); set `[auth.external.google] enabled = true`; `supabase stop && supabase start`; **rebuild** `npx expo run:ios` (the URL scheme is a native change). The Google button appears automatically once the Web client ID env is real. Also create **OAuth consent screen test users** (Audience) while in Testing, and keep scopes to **email + profile + openid** (non-sensitive → no Google verification).
   - **Android client (no code/env change — matched by package + SHA-1):** create an **Android** OAuth client, package `com.bexhearts.app`. SHA-1 for local-debug testing = the Mac's `~/.android/debug.keystore` (`keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`). **At launch add a 2nd Android client** with the **Google Play App Signing** SHA-1 (Play Console → Setup → App signing) and/or the EAS upload-key SHA-1. The Android client ID is not used in app code/Supabase — the token audience is the **Web** client ID on Android too.
- After B3: **B4 (account deletion)** — needs `delete_my_account()` migration + Settings UI (re-auth via `authService.reauthenticate`, already stubbed). Then **Stage C** (onboarding/partner-linking). **B4 needs no credentials — can be built in parallel while Apple is under review.**

---

## Part 5 — Dev build mental model (this changes your daily workflow)

Think of the app as **two layers**:
1. **Native shell = the "dev build"** — the compiled app containing all native code (MMKV, RevenueCat, Superwall, Apple/Google auth, reanimated…). Produced by `expo run:ios` / `run:android`. It's a custom version of "Expo Go" built *just for Bexhearts*, installed on the simulator.
2. **Your JavaScript** (screens, hooks, logic, styles) — served live by **Metro** (`expo start`). The shell loads your JS from Metro with instant hot-reload.

**The commands, and how they change:**
- `npx expo run:ios` = build the native shell + install it + launch it + start Metro. **First build ~10–20 min**; later native rebuilds ~1–5 min.
- `npx expo run:android` = same, for Android (start an emulator first). Same folder. iOS-first is fine.
- **Day-to-day after the first build:** just run **`npx expo start`** and press **`i`** — but now `i` opens your **dev build**, not Expo Go. `-c` (clear cache) is still occasionally useful after config/babel changes. **So `expo start -c` + `i` are NOT redundant — they just target the dev build now.**

**When do you re-run a build?** ONLY when the **native layer** changes:
- add/remove/update a **native dependency** (e.g. adding Google sign-in in B3),
- change **`app.config.ts`** native config (plugins, permissions, icon/splash),
- edit anything in `ios/` or `android/`.

**You do NOT rebuild for JS/TS changes** (screens, hooks, logic, styles) — those hot-reload instantly via Metro. **~95% of feature work needs no rebuild.**

**What you preview in:** the dev build **replaces Expo Go** as your preview app. Everything we've built so far runs in it — now *with* the native modules Expo Go couldn't run.

**TL;DR daily loop:** `npx expo start` → press `i` → edit JS → see it instantly. Re-run `run:ios`/`run:android` only when you touch native deps/config.
