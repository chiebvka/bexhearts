import { router } from 'expo-router';

// SUPERWALL REMOVED — 2026-07-28. ⚠️ OWNER DECISION POINT, easily reversed.
//
// WHY: `SuperwallKit` does not compile under Xcode 26.6. Its `@objc` and Swift
// overloads of `getPresentationResult(forPlacement:params:)` are ambiguous to
// the current Swift compiler, and the build dies there:
//
//   PublicGetPresentationResult.swift:117:24: error: ambiguous use of
//   'getPresentationResult(forPlacement:params:)'
//
// This was verified across BOTH major versions — the shipped 1.4.8
// (SuperwallKit 3.12.4) and the latest 2.1.7 (SuperwallKit 4.5.0) fail
// identically, so upgrading is not a fix. With Superwall in the Podfile the
// entire iOS dev build fails, which blocks J1, F3 sandbox purchases, and all
// three pieces of deferred H2 verification. Removing it, and changing nothing
// else, made the build succeed.
//
// WHY IT COSTS NOTHING TODAY: the paywall is OURS
// (`src/features/subscription/components/Paywall.tsx`), and the owner decided
// on 2026-07-12 that Superwall ships as "keys only, NO campaigns" at launch.
// So every `triggerPaywall` call was already reaching a no-op: `isConfigured`
// was false in Expo Go, and in a dev build it would have opened a campaign
// that does not exist. Routing to our own paywall is strictly better than
// both.
//
// TO BRING IT BACK (post-launch A/B tests, per the original plan):
//   1. `npx expo install @superwall/react-native-superwall`
//   2. Re-check whether SuperwallKit compiles on the Xcode of the day —
//      this is an upstream bug and will presumably be fixed.
//   3. Restore the real implementations below. The exported signatures were
//      deliberately left unchanged so no call site has to move.

/**
 * Show the paywall. Now our own screen, on the app's own stack.
 * `placement=gate` marks it as an upsell rather than the onboarding price
 * reveal — the same distinction the analytics funnel draws.
 */
export async function triggerPaywall(
  _event: string,
  _params?: Record<string, string>
): Promise<void> {
  router.push('/(onboarding)/paywall?placement=gate');
}

/** No-op: kept so AuthProvider needs no change if Superwall returns. */
export async function initSuperwall(): Promise<void> {}

/** No-op: identity for Superwall's audience rules; nothing consumes it now. */
export async function identifySuperwallUser(_userId: string): Promise<void> {}

/** No-op. PII purge on sign-out is handled by analytics + RevenueCat. */
export async function resetSuperwallUser(): Promise<void> {}
