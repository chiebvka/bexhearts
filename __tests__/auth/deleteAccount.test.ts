import { renderHook, act } from '@testing-library/react-native';

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
