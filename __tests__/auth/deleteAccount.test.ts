import { renderHook, act } from '@testing-library/react-native';

jest.mock('@/api/appleRevoke', () => ({
  storeAppleCredential: jest.fn(),
  revokeAppleCredential: jest.fn(),
}));
jest.mock('@/services/notifications/client', () => ({
  clearPushToken: jest.fn(),
  registerPushToken: jest.fn(),
  requestNotificationPermission: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
}));

jest.mock('@/features/auth/socialAuth', () => ({
  getAppleIdentityToken: jest.fn(),
  getGoogleIdToken: jest.fn(),
  isGoogleSignInConfigured: jest.fn(() => false),
}));

jest.mock('@/services/supabase/auth', () => ({
  authService: {
    reauthenticate: jest.fn(),
    requestAccountDeletion: jest.fn(),
    signOut: jest.fn(),
  },
}));

import { router } from 'expo-router';
import { authService } from '@/services/supabase/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';

type MockFn = ReturnType<typeof jest.fn>;
const mockRouter = router as unknown as { replace: MockFn };
const mockAuth = authService as unknown as {
  reauthenticate: MockFn;
  requestAccountDeletion: MockFn;
  signOut: MockFn;
};

describe('useAuth.deleteAccount (7-day grace request)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.signOut.mockResolvedValue({ error: null });
  });

  it('re-authenticates an email user, schedules deletion, signs out, and routes to sign-in', async () => {
    mockAuth.reauthenticate.mockResolvedValue({ error: null });
    mockAuth.requestAccountDeletion.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    let ok = false;
    await act(async () => {
      ok = await result.current.deleteAccount({
        email: 'a@b.com',
        password: 'Password1',
      });
    });

    expect(mockAuth.reauthenticate).toHaveBeenCalledWith('a@b.com', 'Password1');
    expect(mockAuth.requestAccountDeletion).toHaveBeenCalled();
    expect(mockAuth.signOut).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/sign-in');
    expect(ok).toBe(true);
  });

  it('deletes a social user without re-auth', async () => {
    mockAuth.requestAccountDeletion.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    let ok = false;
    await act(async () => {
      ok = await result.current.deleteAccount();
    });

    expect(mockAuth.reauthenticate).not.toHaveBeenCalled();
    expect(mockAuth.requestAccountDeletion).toHaveBeenCalled();
    expect(mockAuth.signOut).toHaveBeenCalled();
    expect(ok).toBe(true);
  });

  it('aborts (no delete) when re-auth fails', async () => {
    mockAuth.reauthenticate.mockResolvedValue({
      error: new Error('Invalid login credentials'),
    });

    const { result } = renderHook(() => useAuth());
    let ok = true;
    await act(async () => {
      ok = await result.current.deleteAccount({
        email: 'a@b.com',
        password: 'wrong',
      });
    });

    expect(mockAuth.requestAccountDeletion).not.toHaveBeenCalled();
    expect(mockAuth.signOut).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
    expect(ok).toBe(false);
  });

  it('does not sign out when the delete RPC fails', async () => {
    mockAuth.reauthenticate.mockResolvedValue({ error: null });
    mockAuth.requestAccountDeletion.mockResolvedValue({
      error: new Error('Not authenticated'),
    });

    const { result } = renderHook(() => useAuth());
    let ok = true;
    await act(async () => {
      ok = await result.current.deleteAccount({
        email: 'a@b.com',
        password: 'Password1',
      });
    });

    expect(mockAuth.signOut).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
    expect(ok).toBe(false);
  });
});

// App Store Guideline 5.1.1(v): an app offering Sign in with Apple must revoke
// the user's Apple tokens when they delete their account. Rejection risk, so
// the ordering and the failure behaviour are both pinned here.
describe('useAuth.deleteAccount — Apple token revocation (5.1.1(v))', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { revokeAppleCredential } = require('@/api/appleRevoke') as {
    revokeAppleCredential: MockFn;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.requestAccountDeletion.mockResolvedValue({ error: null });
    mockAuth.signOut.mockResolvedValue({ error: null });
    revokeAppleCredential.mockResolvedValue(true);
  });

  it('revokes the Apple tokens when an account is deleted', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.deleteAccount();
    });

    expect(revokeAppleCredential).toHaveBeenCalledTimes(1);
  });

  it('revokes BEFORE requesting deletion, while the session is still valid', async () => {
    // The edge function identifies the user from their JWT. Revoking after
    // sign-out would be unauthenticated and silently do nothing.
    const order: string[] = [];
    revokeAppleCredential.mockImplementation(async () => {
      order.push('revoke');
      return true;
    });
    mockAuth.requestAccountDeletion.mockImplementation(async () => {
      order.push('request-deletion');
      return { error: null };
    });
    mockAuth.signOut.mockImplementation(async () => {
      order.push('sign-out');
      return { error: null };
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.deleteAccount();
    });

    expect(order).toEqual(['revoke', 'request-deletion', 'sign-out']);
  });

  it('still deletes the account when revocation fails', async () => {
    // Apple being unreachable is a far smaller problem than a user who cannot
    // delete their account. The server sweep retries the revoke.
    revokeAppleCredential.mockResolvedValue(false);

    const { result } = renderHook(() => useAuth());
    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.deleteAccount();
    });

    expect(outcome).toBe(true);
    expect(mockAuth.requestAccountDeletion).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/sign-in');
  });

  it('still deletes the account when revocation throws outright', async () => {
    revokeAppleCredential.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useAuth());
    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.deleteAccount();
    });

    expect(outcome).toBe(true);
    expect(mockAuth.requestAccountDeletion).toHaveBeenCalledTimes(1);
  });
});
