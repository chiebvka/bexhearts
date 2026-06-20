import { renderHook, act } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
}));

jest.mock('@/services/supabase/auth', () => ({
  authService: {
    signUpWithEmail: jest.fn(),
    signInWithEmail: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    verifySignupOtp: jest.fn(),
    resendSignupOtp: jest.fn(),
  },
}));

import { router } from 'expo-router';
import { authService } from '@/services/supabase/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';

type MockFn = ReturnType<typeof jest.fn>;
const mockRouter = router as unknown as { replace: MockFn; push: MockFn };
const mockAuth = authService as unknown as { signUpWithEmail: MockFn };

const validSignup = {
  email: 'a@b.com',
  password: 'Password1',
  confirmPassword: 'Password1',
};

describe('useAuth.signUp confirmation branch', () => {
  beforeEach(() => jest.clearAllMocks());

  it('routes into the app when a session is returned (confirmation off)', async () => {
    mockAuth.signUpWithEmail.mockResolvedValue({
      data: { session: { access_token: 't' } },
      error: null,
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signUp(validSignup);
    });

    expect(mockRouter.replace).toHaveBeenCalledWith('/');
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('routes to verify-email when no session is returned (confirmation on)', async () => {
    mockAuth.signUpWithEmail.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signUp(validSignup);
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/(auth)/verify-email',
      params: { email: 'a@b.com' },
    });
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('surfaces an error and does not navigate on failure', async () => {
    mockAuth.signUpWithEmail.mockResolvedValue({
      data: { session: null },
      error: new Error('Email already registered'),
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signUp(validSignup);
    });

    expect(result.current.error).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
