import { resolveAccess, isOpenRoute, OPEN_SEGMENTS } from '@/features/subscription/access';

// F2 — owner decision 2026-07-26: lock everything behind the paywall, since
// every couple gets a 3-day free trial. These tests pin the carve-outs that
// make that decision survivable.

const base = {
  entitlementLoading: false,
  isEntitled: false,
  monetizationConfigured: true,
  segments: ['(tabs)', 'index'],
};

describe('resolveAccess', () => {
  it('gates the app for a couple with no entitlement', () => {
    expect(resolveAccess(base)).toBe('paywall');
  });

  it('lets an entitled couple straight through', () => {
    expect(resolveAccess({ ...base, isEntitled: true })).toBe('allow');
  });

  it('never flashes the paywall at a subscriber while the check resolves', () => {
    expect(resolveAccess({ ...base, entitlementLoading: true })).toBe('loading');
  });

  it('does NOT gate when RevenueCat has no real key', () => {
    // Local dev / Expo Go / a misconfigured build — gating here would lock the
    // app permanently with no way to buy anything.
    expect(
      resolveAccess({ ...base, monetizationConfigured: false, entitlementLoading: true })
    ).toBe('allow');
  });
});

describe('open routes (the carve-outs)', () => {
  it('keeps ONBOARDING open — otherwise an invited partner can never link', () => {
    expect(
      resolveAccess({ ...base, segments: ['(onboarding)', 'partner-link'] })
    ).toBe('allow');
  });

  it('keeps PROFILE open — Restore Purchases + account deletion must be reachable', () => {
    expect(resolveAccess({ ...base, segments: ['(tabs)', 'profile', 'index'] })).toBe(
      'allow'
    );
    expect(
      resolveAccess({ ...base, segments: ['(tabs)', 'profile', 'delete-account'] })
    ).toBe('allow');
  });

  it('keeps auth and the paywall itself open', () => {
    expect(resolveAccess({ ...base, segments: ['(auth)', 'sign-in'] })).toBe('allow');
    expect(resolveAccess({ ...base, segments: ['(onboarding)', 'paywall'] })).toBe('allow');
  });

  it('still gates the core tabs', () => {
    for (const route of [
      ['(tabs)', 'index'],
      ['(tabs)', 'devotional', 'index'],
      ['(tabs)', 'connect', 'prayers'],
      ['(tabs)', 'journal', 'index'],
    ]) {
      expect(resolveAccess({ ...base, segments: route })).toBe('paywall');
    }
  });

  it('isOpenRoute handles missing/empty segments safely', () => {
    expect(isOpenRoute(undefined)).toBe(false);
    expect(isOpenRoute([])).toBe(false);
    expect(OPEN_SEGMENTS).toContain('profile');
  });
});
