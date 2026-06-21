import { supabase } from './client';

export const authService = {
  signInWithEmail(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  signUpWithEmail(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  },

  // Confirm a new signup with the 6-digit code emailed by Supabase
  // (the confirmation template uses {{ .Token }} rather than a link).
  verifySignupOtp(email: string, token: string) {
    return supabase.auth.verifyOtp({ email, token, type: 'signup' });
  },

  // Re-send the signup confirmation email
  resendSignupOtp(email: string) {
    return supabase.auth.resend({ type: 'signup', email });
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

  // Re-verify the current password before a sensitive action (account deletion,
  // password change). Returns an error if the password is wrong. Wired into the
  // re-auth gate; the calling UI lands with account deletion in B4.
  reauthenticate(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
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
