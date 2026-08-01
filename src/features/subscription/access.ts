// F2 — app-wide access gate (owner decision 2026-07-26: "lock everything
// behind the paywall — everyone gets a 3-day free trial regardless").
//
// The gate is deliberately NOT total. Four things must stay reachable without
// an entitlement, and each for a concrete reason:
//
//   auth        — you cannot subscribe before you can sign in.
//   onboarding  — including PARTNER LINKING. Without this carve-out an
//                 invited partner downloads the app, hits the paywall, and can
//                 never join, which breaks the invite loop AND the per-couple
//                 billing model (one subscription covers both, but only once
//                 they're linked).
//   profile     — Restore Purchases and account deletion. Apple requires
//                 account deletion to be reachable in-app; a lapsed subscriber
//                 must also be able to restore or leave.
//   paywall     — obviously.
//
// Everything else (Home, Grow, Connect, Journal, Dates) requires the
// entitlement, which in practice means the trial.

export type AccessDecision = 'loading' | 'allow' | 'paywall';

/** Route groups that never require an entitlement. */
export const OPEN_SEGMENTS = ['(auth)', '(onboarding)', 'paywall', 'profile'] as const;

export function isOpenRoute(segments: string[] | undefined): boolean {
  if (!segments || segments.length === 0) return false;
  return segments.some((segment) =>
    OPEN_SEGMENTS.includes(segment as (typeof OPEN_SEGMENTS)[number])
  );
}

export function resolveAccess(params: {
  entitlementLoading: boolean;
  isEntitled: boolean;
  /** RevenueCat has no real key (local dev / Expo Go) — never gate. */
  monetizationConfigured: boolean;
  segments?: string[];
}): AccessDecision {
  const { entitlementLoading, isEntitled, monetizationConfigured, segments } = params;

  // Without a real RevenueCat key there is no way to buy anything, so gating
  // would lock the app permanently in dev and on any misconfigured build.
  if (!monetizationConfigured) return 'allow';
  if (isOpenRoute(segments)) return 'allow';
  // Never flash the paywall at a paying subscriber while the check resolves.
  if (entitlementLoading) return 'loading';
  return isEntitled ? 'allow' : 'paywall';
}
