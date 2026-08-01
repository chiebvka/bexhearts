import { resolveLandingRoute, type GateState } from '@/features/auth/routeGate';

const onboarded = { onboarding_completed: true, couple_id: 'couple-1' };

const state = (overrides: Partial<GateState> = {}): GateState => ({
  authLoading: false,
  isAuthenticated: true,
  isRestoring: false,
  profileLoading: false,
  profileError: false,
  profile: onboarded,
  coupleId: 'couple-1',
  ...overrides,
});

describe('resolveLandingRoute', () => {
  it('routes a signed-out user to sign-in, and waits while auth boots', () => {
    expect(resolveLandingRoute(state({ isAuthenticated: false }))).toBe('sign-in');
    expect(resolveLandingRoute(state({ authLoading: true, isAuthenticated: false }))).toBe(
      'loading'
    );
  });

  it('lands an onboarded, linked couple on the tabs', () => {
    expect(resolveLandingRoute(state())).toBe('tabs');
  });

  // The 2026-07-25 regression: persisting the query cache added a restore
  // window where TanStack reports isLoading:false with data undefined.
  it('WAITS during the persisted-cache restore instead of assuming onboarding', () => {
    expect(
      resolveLandingRoute(state({ isRestoring: true, profile: undefined }))
    ).toBe('loading');
  });

  it('WAITS when the profile is simply absent (query still disabled)', () => {
    expect(resolveLandingRoute(state({ profile: undefined }))).toBe('loading');
    expect(resolveLandingRoute(state({ profileLoading: true, profile: undefined }))).toBe(
      'loading'
    );
  });

  it('falls through rather than spinning forever when the profile errors', () => {
    expect(
      resolveLandingRoute(state({ profile: undefined, profileError: true }))
    ).toBe('onboarding');
  });

  it('sends genuinely un-onboarded users to onboarding', () => {
    expect(
      resolveLandingRoute(state({ profile: { onboarding_completed: false } }))
    ).toBe('onboarding');
  });

  it('sends a solo onboarded user to partner-invite, trusting the profile row', () => {
    expect(
      resolveLandingRoute(
        state({ profile: { onboarding_completed: true, couple_id: null }, coupleId: null })
      )
    ).toBe('partner-invite');
    // Store hydrated before the profile row caught up — still tabs (2026-07-04 bug).
    expect(
      resolveLandingRoute(
        state({
          profile: { onboarding_completed: true, couple_id: null },
          coupleId: 'couple-1',
        })
      )
    ).toBe('tabs');
  });
});
