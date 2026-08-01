# J1 / F3 / H2 runbook — the dev build, sandbox purchases, and the deferred verification

> **Why this file exists:** three separate pieces of work all block on the same
> thing — a **development build on a device or simulator**. Expo Go can't run
> RevenueCat, can't receive a push, can't show the real icon or splash, and
> can't report a crash to Sentry. Everything below has been deferred to "the
> dev-build pass" across several sessions. This is that pass, in order, with
> the exact commands and the exact things to look for.
>
> Prepared 2026-07-27. **Every step here needs the owner's machine** (Xcode,
> a sandbox Apple ID, a Sentry account).

---

## J1 — build and run the dev build

> **STATUS 2026-07-28: the hard part is DONE.** The build was blocked and now
> compiles, installs and launches on the simulator. Three real blockers were
> found and cleared — read them before you touch anything, because two of them
> will bite again:
>
> 1. **CocoaPods dies on this Mac without a UTF-8 locale.** `pod install` fails
>    with `Unicode Normalization not appropriate for ASCII-8BIT`. Prefix every
>    pod command with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`, or add
>    `export LANG=en_US.UTF-8` to your `~/.zshrc` once and forget about it.
> 2. **SUPERWALL BLOCKED THE ENTIRE BUILD — it has been removed.** See the
>    section at the end of J1; this is the one decision of mine you should
>    consciously confirm or reverse.
> 3. **`pod install` alone does NOT refresh the app icon or splash.** `ios/` was
>    generated on **June 28**; the real logo landed **July 25**. The first
>    successful build therefore shipped the grey placeholder icon and a cream
>    splash instead of the purple one — verified on the simulator home screen.
>    Only `npx expo prebuild` regenerates `ios/Bexhearts/Images.xcassets`.
>    **Already run**, so the assets are correct now — but any future icon or
>    splash change needs a prebuild, not just a pod install.

### ⚠️ First: the native project is STALE

Verified 2026-07-27: `ios/Podfile.lock` was last written **2026-06-29**. Native
dependencies added since then are **not** in the build:

- `@react-native-picker/picker` (calendar month/year wheels)
- `@sentry/react-native` (H2·M5 crash reporting)
- `expo-image-manipulator` (H2·M1 image compression)
- `expo-localization` (leaderboard country flag)
- `expo-print` (the journal PDF export, added today)
- `expo-build-properties`, `expo-status-bar`, `react-native-toast-message`

A build without a `pod install` will fail to link, or worse, run and crash the
first time one of those is touched.

**The command that actually works on this machine** (both already run on
2026-07-28 — this is for next time):

```bash
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo prebuild -p ios --clean
```

That regenerates `ios/` from `app.config.ts` — native settings, **and the asset
catalog**, which is what fixes the icon and splash — and runs `pod install` for
you. `--clean` deletes and regenerates `ios/`, which is safe here: nothing in
`ios/` is hand-edited, every native setting lives in `app.config.ts`.

If you only changed JS, you don't need any of this. If you added a native
dependency and nothing else, `LANG=en_US.UTF-8 npx pod-install` is enough.

### Build it — the exact command that worked

```bash
LANG=en_US.UTF-8 xcodebuild \
  -workspace ios/Bexhearts.xcworkspace \
  -scheme Bexhearts -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -derivedDataPath ios/build build
```

Then install and launch it:

```bash
xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/Bexhearts.app
xcrun simctl launch booted com.bexhearts.app
npx expo start --dev-client
```

> ⚠️ **Drop `-quiet` if a build fails.** With `-quiet`, `xcodebuild` prints no
> "BUILD SUCCEEDED"/"BUILD FAILED" line, and a **stale `.app` from a previous
> run stays on disk** — so it looks like the build worked when it didn't. Check
> the binary's timestamp, not the directory's.

### Or build from Xcode

**Do not use `expo run:ios`.** The B3 history is unambiguous about why: it keeps
targeting the physical iPhone that's plugged in (Xcode 26's `devicectl` JSON is
newer than this Expo CLI parses), and a physical build needs a signing
certificate. **Never pass `--device <udid>` for a simulator — that flag forces a
physical-device build.**

1. Open the Simulator app first.
2. `open ios/Bexhearts.xcworkspace` — the **workspace**, never the `.xcodeproj`.
3. Scheme **Bexhearts**, destination **any iPhone Simulator** (simulators need
   no signing at all).
4. **⌘R**.
5. In another terminal: `npx expo start --dev-client`.

For a physical device: Signing & Capabilities → Automatically manage signing →
select your Team. Also register the App ID `com.bexhearts.app` with the **Sign
In with Apple** capability if it isn't already.

### B3 — social sign-in, verified as far as it can be without credentials

Both buttons were tapped on the dev build on 2026-07-30 and **both reached
iOS's own system UI**, which is the meaningful proof: entitlements present,
native modules linked, client IDs and URL scheme resolving.

| Provider | What appeared | Reading |
|---|---|---|
| **Apple** | *"Sign in to your Apple Account — You need to sign in to your Apple Account in Settings."* | The Sign in with Apple entitlement and `AppleAuthentication.signInAsync()` both work. This simulator simply has no Apple ID. |
| **Google** | *"Bexhearts" Wants to Use "accounts.google.com" to Sign In* | The Google SDK loaded (no TurboModule crash), the client IDs resolved, and the iOS URL scheme is registered. |

**⚠️ What is left, and only you can do it** — both remaining steps require
entering real account credentials, which I won't do:

1. **Apple:** sign the simulator into an Apple ID
   (**Settings → Sign in to your iPhone**), or use a physical device, then tap
   *Continue with Apple*. You should land in onboarding as a new user.
2. **Google:** tap *Continue with Google* → **Continue** → pick a Google
   account. Same expected landing.
3. After the Apple one, **immediately verify revocation is capturing tokens**:
   `SELECT user_id, created_at FROM apple_credentials;` should have a row. If
   it's empty, the four Apple secrets aren't set — see `docs/APP_STORE.md` §6b.

Known caveat carried over from B3: production **Android** needs a second Google
OAuth client carrying the Play App-Signing SHA-1. Not needed for the iOS launch.

### ⚠️ Superwall was removed to make this build — confirm or reverse

`SuperwallKit` does not compile under Xcode 26.6:

```
PublicGetPresentationResult.swift:117:24: error: ambiguous use of
'getPresentationResult(forPlacement:params:)'
```

Its `@objc` and Swift overloads are ambiguous to the current compiler. **Tested
across both majors** — the shipped `1.4.8` (SuperwallKit 3.12.4) and the latest
`2.1.7` (SuperwallKit 4.5.0) fail identically, so upgrading is not a fix. With
Superwall in the Podfile the whole iOS build dies, which blocks J1, F3 and every
H2 item below. Removing it and changing nothing else made the build succeed.

**It costs nothing today:** the paywall is ours, and the 2026-07-12 decision was
"Superwall = keys only, NO campaigns at launch". Every `triggerPaywall` call was
already reaching a no-op. `src/services/superwall/client.ts` keeps its exported
signatures unchanged and now routes to our own paywall with `placement=gate` —
strictly better than the no-op it replaced. Restore instructions are in that
file's header.

**Your alternatives if you'd rather keep it:** wait for an upstream SuperwallKit
fix, or pin an older Xcode. Nothing ships until then, so removal is the
recommendation.

### What to check the moment it launches

These only exist on a dev build. The first two are now **done**; the rest still
need you, because they need a real device interaction or a real account.

- [x] **App icon** — ✅ **VERIFIED 2026-07-28.** Cream heart-and-road mark on
      brand purple `#9747FF`, full-bleed, OS squircle applied. This is the
      first time the icon has ever rendered on a device, and it only worked
      after `expo prebuild` regenerated the asset catalog (see the note at the
      top — `pod install` alone left the June placeholder in place).
- [x] **Splash** — ✅ **VERIFIED 2026-07-30**, edge-to-edge purple with the
      cream mark centred. **A real bug was found and fixed here:**
      `assets/splash-icon.png` had an **opaque white background**, and with
      `resizeMode: 'contain'` that painted a white band across the middle of
      the purple screen. The asset is now rendered on a full-bleed `#9747FF`
      field (`assets/logo-source/splash.svg` carries the rect, so a re-render
      can't regress it).
- [x] **Dev launcher** — ✅ `expo-dev-client` installed; the build now shows the
      "Development Servers" screen and connects to Metro instead of the red
      `No script URL provided` box.
- [x] **Social sign-in buttons** — ✅ **VERIFIED 2026-07-30 on the dev build**,
      the first time since B3 was wired in June. See the section below.
- [ ] **Push permission prompt** appears, and a token is written to
      `profiles.push_token` (check in Studio)
- [ ] **Social sign-in buttons appear** — they are deliberately hidden in Expo
      Go (`SocialAuthButtons` checks `executionEnvironment === StoreClient`).
      Tap-test Apple and Google; this has never been verified on-device.
- [ ] Calendar month/year **wheels** spin (the `picker` pod)
- [ ] The **journal PDF export** still works (`expo-print` pod) — verified
      working in Expo Go on 2026-07-27, but it's a new pod

---

## F3 — sandbox purchase and restore

**Prerequisites (⚠️ owner):**
- All three products out of "Missing Metadata" in App Store Connect:
  localization, price, **3-day free-trial introductory offer**, and a review
  screenshot (already generated at
  `~/Downloads/bexhearts-subscription-review-screenshot.png`).
- A **Sandbox Apple ID** (ASC → Users and Access → Sandbox → Test Accounts).
  Sign into it on the device at **Settings → Developer → Sandbox Apple Account**
  — *not* in the main iCloud account.
- Real RevenueCat keys in `.env` ✅ (already there).

> Sandbox subscription periods are heavily accelerated: a 3-day trial expires in
> minutes, and a year renews in about an hour. That's a feature — it's the only
> practical way to test what happens when a trial ends.

### F3·A — the purchase

1. Fresh account → onboarding → paywall.
2. Pick **Annual**, tap **Start my free trial**.
3. The native store sheet appears and says **"Free Trial"** with the price after.
   **If it doesn't say free trial, stop** — the introductory offer isn't
   configured on the product, and shipping that means charging people
   immediately when they were promised three free days.
4. Confirm. The app should route to partner-invite.
5. RevenueCat dashboard → Customers: a customer with app user id
   **`couple_<uuid>`**, entitlement `premium` **active**, and the transaction
   marked as a trial.

### F3·B — ⚠️ per-couple entitlement — THE critical test

This is the whole F2 bet: one subscription, two people. It has never been proven
against a real store transaction.

1. **Device A** (partner A): buy as above. Confirm full access.
2. **Device B** (partner B): a brand-new account, **signed into a *different*
   sandbox Apple ID** — this matters, because if B is on the same Apple ID the
   test proves nothing.
3. On device B, go through onboarding and **enter A's invite code**.
4. ✅ **PASS:** B lands in the app with full access and **never sees a paywall**.
   `usePartnerLink` re-identifies RevenueCat to `couple_<id>` on link, so B
   resolves to the same RevenueCat customer A paid as.
5. ❌ **FAIL:** B hits the paywall. Then the alias isn't taking effect — check
   `revenueCatAppUserId()` in `src/services/revenuecat/client.ts` and confirm
   `identifyUser(userId, coupleId)` actually ran after linking.

> If this fails, **do not ship**. Every invited partner would be asked to pay a
> second time, which breaks both the product promise and the invite loop.

### F3·C — the hard gate, with the carve-out intact

1. Let the sandbox trial **expire** (minutes) without converting, or revoke the
   purchase in ASC sandbox.
2. Reopen the app. Expected: redirected to the paywall with
   `?placement=gate` — no back button, only **Sign out**.
3. ✅ **Profile must still be reachable** (Restore Purchases + Delete account —
   Apple requires deletion to stay reachable).
4. ✅ **A brand-new account must still be able to onboard and link a partner**
   while non-entitled. This carve-out is what keeps the invite loop alive; if it
   regressed, an invited partner can never join.
5. Analytics: a `paywall_shown` with `placement: 'gate'` should appear in
   PostHog — that's how a lapse is told apart from a first look at the price.

### F3·D — Restore Purchases

1. Delete and reinstall the app; sign in as partner A.
2. **Profile → Subscription → Restore Purchases.**
3. Entitlement returns; `restore_purchases` fires with `result: 'success'`.
4. Also try it on an account with nothing to restore → the toast should say
   "Nothing to restore on this account.", and the event should carry
   `result: 'nothing_to_restore'`.

### F3·E — comp access alongside a real key

Once RevenueCat is live, the gate is real, so this is the first chance to prove
the comp list actually works end-to-end (00036):

1. Grant a test address in Studio (see `docs/APP_STORE.md` §1).
2. Sign in as it on the dev build with **no** subscription.
3. ✅ Full access, and Profile → Subscription shows **"Complimentary"** with the
   "nothing to pay and nothing to manage" copy — not "Premium".

---

## H2 — the deferred reliability verification

Three things from the 2026-07-25 reliability round were built but could never be
confirmed in Expo Go. All three need this build.

### H2·V1 — airplane-mode cold start

1. Use the app online so the query cache populates (Home, devotional, prayers,
   journal).
2. Fully **terminate** the app (swipe away — not backgrounded).
3. Turn on **Airplane Mode**.
4. Relaunch.
5. ✅ **Expected:** the offline banner appears above the navigator, and Home,
   Grow, Connect and Journal still render **last-known-good content** from the
   persisted cache.
6. ✅ **Expected:** you are **not** thrown into onboarding. That was the
   2026-07-26 cold-start mis-route (`routeGate.ts` now waits on
   `useIsRestoring()`), and offline cold start is exactly its trigger condition.
7. ✅ **Expected:** entitlement is **not** restored from disk — `entitlement`
   and `offerings` are on `NON_PERSISTED_KEY_ROOTS` on purpose.

### H2·V2 — 3G-throttled multi-photo memory

1. **Settings → Developer → Network Link Conditioner → 3G** (or "Very Bad
   Network" for the harsher case).
2. Create a Journal moment with **4–5 photos** and save.
3. ✅ Save returns **immediately** — the outbox is asynchronous.
4. ✅ The memory card shows "**N of M photos still uploading**".
5. **Background the app** and wait. The iOS *background* upload session should
   keep going.
6. Reopen: photos have landed and the pending label is gone.
7. Harder case worth doing once: kill the app mid-upload, relaunch, and confirm
   the outbox revives the queue (backoff 0s → 30s → 2m → 10m → 30m, parked after
   5 attempts).

### H2·V3 — a real Sentry crash

1. ⚠️ Create the Sentry project → copy the DSN → `EXPO_PUBLIC_SENTRY_DSN` in
   `.env`. **Sentry stays a complete no-op until a real `https` DSN is present
   AND the app is not Expo Go** (`sentryEnabled` in `src/services/sentry.ts`).
2. Rebuild (an env change at the native layer needs a rebuild).
3. Trigger a crash — the simplest honest way is a temporary
   `throw new Error('sentry smoke test')` in a screen's render, which the root
   `ErrorBoundary` catches and reports. Remove it afterwards.
4. ✅ The event appears in Sentry within a minute.
5. ✅ **Check what's in it:** `sendDefaultPii: false`, so there must be **no**
   email, no prayer text, no journal content on the event. If any appears, stop
   and fix before launch — this app handles religious-belief data.
6. Also at this pass: add the `@sentry/react-native/expo` config plugin for
   source-map upload, so production stack traces aren't minified noise.

---

## Order

1. `npx pod-install` → Xcode → Simulator → ⌘R (J1)
2. Icon / splash / push token / social buttons (J1 checklist)
3. Sentry DSN + rebuild → H2·V3
4. H2·V1 airplane mode, H2·V2 throttled upload
5. Sandbox Apple ID → F3·A purchase
6. **F3·B per-couple entitlement — the one that decides whether F2 shipped**
7. F3·C hard gate + carve-out, F3·D restore, F3·E comp
8. Then `docs/APP_STORE.md`
