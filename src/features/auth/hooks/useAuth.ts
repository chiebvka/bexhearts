import { useState } from 'react';
import { router } from 'expo-router';
import { authService } from '@/services/supabase/auth';
import { track, ANALYTICS_EVENTS } from '@/services/analytics/events';
import { getErrorMessage } from '@/utils/error';
import { setLastUsedMethod } from '../lastUsedMethod';
import type { SignInFormData, SignUpFormData } from '../schemas';

// Supabase returns this when a user signs in before confirming their email.
function isEmailNotConfirmed(error: unknown): boolean {
  const e = error as { code?: string; message?: string };
  return e?.code === 'email_not_confirmed' || /not confirmed/i.test(e?.message ?? '');
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await authService.signInWithEmail(
        data.email,
        data.password
      );
      if (authError) {
        if (isEmailNotConfirmed(authError)) {
          // Account exists but was never confirmed → send a fresh code and
          // route them to enter it, rather than a dead-end error.
          await authService.resendSignupOtp(data.email).catch(() => undefined);
          router.push({
            pathname: '/(auth)/verify-email',
            params: { email: data.email },
          });
          return;
        }
        throw authError;
      }
      track(ANALYTICS_EVENTS.SIGN_IN, { method: 'email' });
      void setLastUsedMethod('email');
      router.replace('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: result, error: authError } =
        await authService.signUpWithEmail(data.email, data.password);
      if (authError) throw authError;
      track(ANALYTICS_EVENTS.SIGN_UP, { method: 'email' });

      if (result.session) {
        // Email confirmation disabled (e.g. local dev) → signed in immediately.
        void setLastUsedMethod('email');
        router.replace('/');
      } else {
        // Confirmation required → verify the emailed 6-digit code next.
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email: data.email },
        });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailOtp = async (email: string, token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await authService.verifySignupOtp(
        email,
        token
      );
      if (verifyError) throw verifyError;
      void setLastUsedMethod('email');
      // Session is now set; the AuthProvider listener routes us into the app.
      router.replace('/');
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmailOtp = async (email: string) => {
    setError(null);
    try {
      const { error: resendError } = await authService.resendSignupOtp(email);
      if (resendError) throw resendError;
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  const signOut = async () => {
    await authService.signOut();
    track(ANALYTICS_EVENTS.SIGN_OUT);
    router.replace('/(auth)/sign-in');
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } = await authService.resetPassword(email);
      if (resetError) throw resetError;
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    verifyEmailOtp,
    resendEmailOtp,
    signOut,
    resetPassword,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
