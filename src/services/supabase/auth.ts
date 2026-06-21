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

  // Sends a password-recovery email. With the recovery template using
  // {{ .Token }} this delivers a 6-digit code (no deep link). Returns success
  // regardless of whether the account exists (enumeration-safe).
  resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email);
  },

  // Verify the recovery code → establishes a short-lived recovery session.
  verifyRecoveryOtp(email: string, token: string) {
    return supabase.auth.verifyOtp({ email, token, type: 'recovery' });
  },

  // Set the new password (called while the recovery session is active).
  updatePassword(password: string) {
    return supabase.auth.updateUser({ password });
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
