import { useState } from 'react';
import { router } from 'expo-router';
import { authService } from '@/services/supabase/auth';
import { track, ANALYTICS_EVENTS } from '@/services/analytics/events';
import { getErrorMessage } from '@/utils/error';
import type { SignInFormData, SignUpFormData } from '../schemas';

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
      if (authError) throw authError;
      track(ANALYTICS_EVENTS.SIGN_IN, { method: 'email' });
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
      const { error: authError } = await authService.signUpWithEmail(
        data.email,
        data.password
      );
      if (authError) throw authError;
      track(ANALYTICS_EVENTS.SIGN_UP, { method: 'email' });
      router.replace('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
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

  return { signIn, signUp, signOut, resetPassword, isLoading, error, clearError: () => setError(null) };
}
