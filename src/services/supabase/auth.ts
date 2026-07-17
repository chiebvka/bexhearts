import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
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

  signInWithGoogle(idToken: string) {
    return supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
  },

  signOut() {
    return supabase.auth.signOut();
  },

  // Re-verify the current password before a sensitive action (account deletion,
  // password change). Returns an error if the password is wrong. Used by the
  // account-deletion re-auth gate (B4) for email/password users.
  reauthenticate(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  // Schedule account deletion with a 7-day grace period (00005). Returns the
  // deadline. The caller signs out afterward; signing back in before the
  // deadline cancels it (see cancelAccountDeletion / AuthProvider reactivation).
  requestAccountDeletion() {
    return supabase.rpc('request_account_deletion');
  },

  // Cancel a pending account deletion (reactivation).
  cancelAccountDeletion() {
    return supabase.rpc('cancel_account_deletion');
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

  // Deliberately typed to take a SYNCHRONOUS callback: supabase-js awaits the
  // callback's return value while the auth call that fired it (e.g.
  // signInWithPassword) is still pending, so an async callback would hold the
  // sign-in spinner hostage to hydration work (see AuthProvider).
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(
      callback as Parameters<typeof supabase.auth.onAuthStateChange>[0]
    );
  },
};
