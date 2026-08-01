// Where a cold start lands: sign-in → onboarding → partner-invite → tabs.
//
// Pure so the ordering is testable. The subtle rule (regression 2026-07-25):
// while signed in, NEVER decide the route from an ABSENT profile. TanStack
// reports `isLoading: false` with `data: undefined` both while the persisted
// cache is restoring (H2·M3) and while the query is still disabled waiting on
// auth hydration — and treating that as "not onboarded" dumped fully
// onboarded couples back into onboarding on every cold start.

export type LandingRoute = 'loading' | 'sign-in' | 'onboarding' | 'partner-invite' | 'tabs';

export interface GateState {
  authLoading: boolean;
  isAuthenticated: boolean;
  /** The persisted query cache is still being read off disk. */
  isRestoring: boolean;
  profileLoading: boolean;
  /** The profile fetch failed — we can't wait forever, so fall through. */
  profileError: boolean;
  profile: { onboarding_completed?: boolean | null; couple_id?: string | null } | undefined;
  /** Couple context hydrated into the store (may beat the profile query). */
  coupleId: string | null;
}

export function resolveLandingRoute(state: GateState): LandingRoute {
  if (state.authLoading) return 'loading';
  if (!state.isAuthenticated) return 'sign-in';

  // Signed in: hold the loading screen until the profile actually resolves
  // (or errors), rather than routing off a missing one.
  if (state.isRestoring || state.profileLoading) return 'loading';
  if (!state.profile && !state.profileError) return 'loading';

  if (!state.profile?.onboarding_completed) return 'onboarding';

  // The profile row is the source of truth for couple membership — the store
  // hydrates asynchronously, and trusting it alone re-routed already-linked
  // users to partner-invite on cold start (bug 2026-07-04).
  if (!state.profile?.couple_id && !state.coupleId) return 'partner-invite';

  return 'tabs';
}
