# B3 SETUP — Dev Build + Social Sign-In (Apple + Google)

> **For the owner to action.** B3 needs a **development build** (Expo Go can't run native auth/MMKV/RevenueCat/Superwall) plus credentials from Apple & Google. Work through Parts 1–3, fill the **Bring-back checklist** (Part 4), then start a fresh chat, paste `docs/HANDOFF.md`, say *"I have the B3 credentials"*, and the agent wires + tests it.
>
> Bundle ID (both platforms): **`com.bexhearts.app`**. You self-host Supabase on the VPS, so provider config goes in your **GoTrue env / Supabase Studio Auth settings**, not a hosted dashboard.

---

## Part 1 — Development Build (do this first; no external accounts needed)
Gets a dev client running on the iOS simulator. Prereqs: Xcode 26.5 ✓ already installed.

1. **Install CocoaPods:** `brew install cocoapods`
2. **Dedupe RevenueCat** (Superwall bundles its own `react-native-purchases@7.x` vs our `8.x` — `expo-doctor` flagged it). The agent will add a `package.json` `overrides` to force one version **and verify Superwall's purchase controller still works** — flag for the new chat, don't hand-edit.
3. **Prebuild:** `npx expo prebuild --clean` (generates `ios/` + `android/` — both are gitignored).
4. **Build & run:** `npx expo run:ios` (first build ~10 min; installs the dev client on the simulator). After that, `npm start` connects to it like Expo Go but with all native modules.
5. **Android dev build (optional now):** `npx expo run:android` (needs Android Studio + an AVD).

✅ **Once the dev build launches and reaches sign-in, the worklets/Expo-Go workarounds no longer constrain us** (the build compiles our exact native versions).

---

## Part 2 — Apple Sign In
We use the **native** flow (`expo-apple-authentication` → `signInWithIdToken`), which keeps the credential setup minimal.

1. **Enroll in the Apple Developer Program** ($99/yr) — https://developer.apple.com/programs/ — *(enrollment can take a while; start it early).* Note your **Team ID**.
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

## Notes for the wiring agent (new chat)
- B3 modules (STEPS.md): M1 Apple button → `authService.signInWithApple`; M2 Google (`@react-native-google-signin` + provider config + handler); M3 always show Apple when Google is shown (App Store rule); record `setLastUsedMethod('apple'|'google')` on success (B1·M5 infra is ready); the SignInForm "last used" hint becomes per-method.
- After B3: **B4 (account deletion)** — needs `delete_my_account()` migration + Settings UI (re-auth via `authService.reauthenticate`, already stubbed). Then **Stage C** (onboarding/partner-linking).
