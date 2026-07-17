/**
 * Regression guard for the sign-in hang (2026-07-04): supabase-js awaits the
 * onAuthStateChange callback while signInWithPassword is still pending, so the
 * callback must stay SYNCHRONOUS — post-sign-in hydration (profile/couple
 * context, paid-SDK identify) has to be deferred out of it, or a single slow
 * or wedged promise keeps the sign-in spinner up forever.
 */
import { render } from '@testing-library/react-native';
import { AuthProvider } from '@/providers/AuthProvider';
import { getProfile } from '@/services/supabase/database';

type AuthCallback = (event: string, session: unknown) => unknown;
let capturedCallback: AuthCallback;

jest.mock('@/services/supabase/auth', () => ({
  authService: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: jest.fn((cb: AuthCallback) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    }),
  },
}));
jest.mock('@/services/supabase/database', () => ({
  getProfile: jest.fn().mockResolvedValue(null),
  getCouple: jest.fn().mockResolvedValue(null),
}));
jest.mock('@/services/revenuecat/client', () => ({
  initRevenueCat: jest.fn().mockResolvedValue(undefined),
  identifyUser: jest.fn().mockResolvedValue(undefined),
  logOutRevenueCat: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/services/superwall/client', () => ({
  identifySuperwallUser: jest.fn(),
  resetSuperwallUser: jest.fn(),
}));
jest.mock('@/services/analytics/events', () => ({
  identify: jest.fn(),
  reset: jest.fn(),
}));
jest.mock('@/api/client', () => ({
  queryClient: { clear: jest.fn() },
}));

const session = { user: { id: 'user-1', email: 'a@b.com' } };

describe('AuthProvider auth-state listener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    render(<AuthProvider>{null}</AuthProvider>);
  });
  afterEach(() => jest.useRealTimers());

  it('keeps the onAuthStateChange callback synchronous (no returned promise)', () => {
    const result = capturedCallback('SIGNED_IN', session);
    // An async callback returns a Promise, which supabase-js awaits while the
    // sign-in call is still pending → endless spinner. It must return nothing.
    expect(result).toBeUndefined();
  });

  it('defers signed-in hydration out of the callback, then runs it', async () => {
    capturedCallback('SIGNED_IN', session);
    // Not hydrated synchronously (that would block sign-in resolution)…
    expect(getProfile).not.toHaveBeenCalled();

    // …but it runs on the next tick.
    jest.advanceTimersByTime(1);
    await Promise.resolve();
    expect(getProfile).toHaveBeenCalledWith('user-1');
  });

  it('does not hydrate on SIGNED_OUT', () => {
    capturedCallback('SIGNED_OUT', null);
    jest.advanceTimersByTime(1);
    expect(getProfile).not.toHaveBeenCalled();
  });
});
