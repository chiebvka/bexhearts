import { supabase } from '@/services/supabase/client';

// App Store Guideline 5.1.1(v) — an app offering Sign in with Apple must
// revoke the user's Apple tokens when they delete their account. The private
// key that signs Apple's client secret can never ship in an app bundle, so all
// of this happens in the `apple-revoke` edge function; these are just the two
// calls the app makes.
//
// BOTH ARE BEST-EFFORT AND NEVER THROW. The rule they follow:
//
//   * A failure at sign-in must not fail the sign-in — the user is already
//     authenticated and this is bookkeeping for a deletion that may never
//     happen.
//   * A failure at deletion must not block the deletion. Apple being
//     unreachable is a far smaller problem than a user who cannot delete their
//     account, and the edge function's sweep retries anyway.

/**
 * Hand Apple's authorization code to the server to be exchanged for a refresh
 * token. Call immediately after a successful Apple sign-in — the code expires
 * in about five minutes, so there is no later.
 */
export async function storeAppleCredential(authorizationCode: string | null): Promise<void> {
  if (!authorizationCode) return;
  try {
    await supabase.functions.invoke('apple-revoke', {
      body: { action: 'store', authorizationCode },
    });
  } catch {
    // Function not deployed yet, or offline. Deliberately silent: the user is
    // signed in, and revocation degrades to "nothing to revoke".
  }
}

/**
 * Revoke the caller's Apple tokens. Call at account-deletion request.
 *
 * Returns whether a revoke actually landed — useful for tests and for a future
 * support view, but the caller must proceed with deletion either way.
 */
export async function revokeAppleCredential(): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('apple-revoke', {
      body: { action: 'revoke' },
    });
    if (error) return false;
    return Boolean((data as { revoked?: boolean } | null)?.revoked);
  } catch {
    return false;
  }
}
