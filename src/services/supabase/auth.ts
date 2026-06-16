import { supabase } from './client';

export const authService = {
  signInWithEmail(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  signUpWithEmail(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  },

  signInWithApple(identityToken: string) {
    return supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: identityToken,
    });
  },

  signOut() {
    return supabase.auth.signOut();
  },

  getSession() {
    return supabase.auth.getSession();
  },

  resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'bexhearts://reset-password',
    });
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
