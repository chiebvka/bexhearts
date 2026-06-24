import { renderHook, act } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
}));

jest.mock('@/features/auth/socialAuth', () => ({
  getAppleIdentityToken: jest.fn(),
  getGoogleIdToken: jest.fn(),
  isGoogleSignInConfigured: jest.fn(() => true),
}));

jest.mock('@/services/supabase/auth', () => ({
  authService: {
    signInWithApple: jest.fn(),
    signInWithGoogle: jest.fn(),
  },
}));

import { router } from 'expo-router';
import { authService } from '@/services/supabase/auth';
import {
  getAppleIdentityToken,
  getGoogleIdToken,
} from '@/features/auth/socialAuth';
import { useAuth } from '@/features/auth/hooks/useAuth';

type MockFn = ReturnType<typeof jest.fn>;
const mockRouter = router as unknown as { replace: MockFn; push: MockFn };
const mockAuth = authService as unknown as {
  signInWithApple: MockFn;
  signInWithGoogle: MockFn;
};
const mockGetAppleToken = getAppleIdentityToken as unknown as MockFn;
const mockGetGoogleToken = getGoogleIdToken as unknown as MockFn;

describe('useAuth.signInWithApple', () => {
  beforeEach(() => jest.clearAllMocks());

  it('exchanges the Apple identity token and routes into the app', async () => {
    mockGetAppleToken.mockResolvedValue('apple-id-token');
    mockAuth.signInWithApple.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signInWithApple();
    });

    expect(mockAuth.signInWithApple).toHaveBeenCalledWith('apple-id-token');
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
    expect(result.current.error).toBeNull();
  });

  it('does nothing when the user cancels the Apple sheet', async () => {
    mockGetAppleToken.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signInWithApple();
    });

    expect(mockAuth.signInWithApple).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('surfaces an error when the Supabase exchange fails', async () => {
    mockGetAppleToken.mockResolvedValue('apple-id-token');
    mockAuth.signInWithApple.mockResolvedValue({
      error: new Error('Provider not enabled'),
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signInWithApple();
    });

    expect(result.current.error).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});

describe('useAuth.signInWithGoogle', () => {
  beforeEach(() => jest.clearAllMocks());

  it('exchanges the Google ID token and routes into the app', async () => {
    mockGetGoogleToken.mockResolvedValue('google-id-token');
    mockAuth.signInWithGoogle.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockAuth.signInWithGoogle).toHaveBeenCalledWith('google-id-token');
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
    expect(result.current.error).toBeNull();
  });

  it('does nothing when the user cancels the Google sheet', async () => {
    mockGetGoogleToken.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockAuth.signInWithGoogle).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('surfaces an error when Google sign-in throws', async () => {
    mockGetGoogleToken.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.error).toBeTruthy();
    expect(mockAuth.signInWithGoogle).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
