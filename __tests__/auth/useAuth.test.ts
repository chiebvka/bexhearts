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

jest.mock('@/services/supabase/auth', () => ({
  authService: {
    signUpWithEmail: jest.fn(),
    signInWithEmail: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    verifySignupOtp: jest.fn(),
    resendSignupOtp: jest.fn(),
    verifyRecoveryOtp: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

import { router } from 'expo-router';
import { authService } from '@/services/supabase/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';

type MockFn = ReturnType<typeof jest.fn>;
const mockRouter = router as unknown as { replace: MockFn; push: MockFn };
const mockAuth = authService as unknown as {
  signUpWithEmail: MockFn;
  signInWithEmail: MockFn;
  resendSignupOtp: MockFn;
  signOut: MockFn;
  resetPassword: MockFn;
  verifyRecoveryOtp: MockFn;
  updatePassword: MockFn;
};

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

describe('useAuth.signIn', () => {
  beforeEach(() => jest.clearAllMocks());

  it('routes into the app on success', async () => {
    mockAuth.signInWithEmail.mockResolvedValue({
      data: { session: {} },
      error: null,
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn({ email: 'a@b.com', password: 'Password1' });
    });

    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  it('resends a code and routes to verify-email when the email is unconfirmed', async () => {
    mockAuth.signInWithEmail.mockResolvedValue({
      data: { session: null },
      error: { code: 'email_not_confirmed', message: 'Email not confirmed' },
    });
    mockAuth.resendSignupOtp.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn({ email: 'a@b.com', password: 'Password1' });
    });

    expect(mockAuth.resendSignupOtp).toHaveBeenCalledWith('a@b.com');
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/(auth)/verify-email',
      params: { email: 'a@b.com' },
    });
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('surfaces an error on invalid credentials', async () => {
    mockAuth.signInWithEmail.mockResolvedValue({
      data: { session: null },
      error: new Error('Invalid login credentials'),
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn({ email: 'a@b.com', password: 'wrong' });
    });

    expect(result.current.error).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

describe('useAuth.signOut', () => {
  beforeEach(() => jest.clearAllMocks());

  it('signs out and returns to the sign-in screen', async () => {
    mockAuth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signOut();
    });

    expect(mockAuth.signOut).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/sign-in');
  });
});

describe('useAuth password reset', () => {
  beforeEach(() => jest.clearAllMocks());

  it('navigates to reset-password regardless of whether the account exists (enumeration-safe)', async () => {
    mockAuth.resetPassword.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.requestPasswordReset('a@b.com');
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/(auth)/reset-password',
      params: { email: 'a@b.com' },
    });
  });

  it('completePasswordReset verifies the code, sets the password, and routes in', async () => {
    mockAuth.verifyRecoveryOtp.mockResolvedValue({ error: null });
    mockAuth.updatePassword.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    let ok = false;
    await act(async () => {
      ok = await result.current.completePasswordReset(
        'a@b.com',
        '123456',
        'NewPass1'
      );
    });

    expect(mockAuth.verifyRecoveryOtp).toHaveBeenCalledWith('a@b.com', '123456');
    expect(mockAuth.updatePassword).toHaveBeenCalledWith('NewPass1');
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
    expect(ok).toBe(true);
  });

  it('does not update the password when the code is wrong/expired', async () => {
    mockAuth.verifyRecoveryOtp.mockResolvedValue({
      error: new Error('Token has expired or is invalid'),
    });

    const { result } = renderHook(() => useAuth());
    let ok = true;
    await act(async () => {
      ok = await result.current.completePasswordReset(
        'a@b.com',
        '000000',
        'NewPass1'
      );
    });

    expect(mockAuth.updatePassword).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
    expect(ok).toBe(false);
  });
});
