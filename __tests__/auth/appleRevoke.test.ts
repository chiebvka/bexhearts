const mockInvoke = jest.fn();
jest.mock('@/services/supabase/client', () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => mockInvoke(...args) } },
}));

import { storeAppleCredential, revokeAppleCredential } from '@/api/appleRevoke';

// App Store Guideline 5.1.1(v). The contract these tests protect: revocation is
// attempted, and it can NEVER take down sign-in or account deletion with it.
beforeEach(() => {
  jest.clearAllMocks();
  mockInvoke.mockResolvedValue({ data: { ok: true, revoked: true }, error: null });
});

describe('storeAppleCredential — at sign-in', () => {
  it('sends the authorization code to be exchanged server-side', async () => {
    await storeAppleCredential('apple-auth-code');

    expect(mockInvoke).toHaveBeenCalledWith('apple-revoke', {
      body: { action: 'store', authorizationCode: 'apple-auth-code' },
    });
  });

  it('does nothing when Apple returned no code', async () => {
    await storeAppleCredential(null);
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('never throws when the function is unreachable', async () => {
    // The user is already signed in at this point. A failure here must not
    // surface as a sign-in error.
    mockInvoke.mockRejectedValue(new Error('Function not found'));
    await expect(storeAppleCredential('code')).resolves.toBeUndefined();
  });
});

describe('revokeAppleCredential — at account deletion', () => {
  it('asks the edge function to revoke, with no user id in the body', async () => {
    // The user is identified from the verified JWT server-side. Passing an id
    // would make this function able to revoke somebody else's tokens.
    await revokeAppleCredential();

    expect(mockInvoke).toHaveBeenCalledWith('apple-revoke', {
      body: { action: 'revoke' },
    });
  });

  it('reports true when Apple confirmed the revoke', async () => {
    await expect(revokeAppleCredential()).resolves.toBe(true);
  });

  it('reports false for an account that never used Sign in with Apple', async () => {
    mockInvoke.mockResolvedValue({
      data: { ok: true, revoked: false, reason: 'no_credential' },
      error: null,
    });
    await expect(revokeAppleCredential()).resolves.toBe(false);
  });

  it('reports false rather than throwing when the function errors', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(revokeAppleCredential()).resolves.toBe(false);
  });

  it('reports false rather than throwing when offline', async () => {
    mockInvoke.mockRejectedValue(new Error('Network request failed'));
    await expect(revokeAppleCredential()).resolves.toBe(false);
  });

  it('treats a missing revoked flag as not revoked', async () => {
    // Degrades safely when the function isn't configured yet — it returns
    // { ok: true, configured: false } with no `revoked` key.
    mockInvoke.mockResolvedValue({ data: { ok: true, configured: false }, error: null });
    await expect(revokeAppleCredential()).resolves.toBe(false);
  });
});
