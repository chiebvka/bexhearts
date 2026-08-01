/* eslint-disable import/no-unresolved */
// Edge Function: apple-revoke (2026-07-30)
//
// App Store Guideline 5.1.1(v): an app that offers Sign in with Apple must
// revoke the user's Apple tokens when they delete their account. This is the
// server side of that — the private key can never go near a phone.
//
// THREE ACTIONS
//
//   { action: 'store', authorizationCode }   ← user JWT, at Apple sign-in
//       Exchanges the code for a refresh token and saves it. MUST happen at
//       sign-in: the authorization code expires in ~5 minutes, so there is no
//       "get it later" option.
//
//   { action: 'revoke' }                     ← user JWT, at deletion request
//       Revokes the caller's own stored token with Apple.
//
//   { action: 'sweep' }                      ← SERVICE ROLE only, cron
//       Retries revocations that previously failed (Apple unreachable, etc.)
//       for accounts already pending deletion.
//
// A user JWT can only ever act on ITSELF — the user id comes from the verified
// token, never from the request body. There is deliberately no way to ask this
// function to revoke somebody else.
//
// GRACEFUL DEGRADATION (CLAUDE.md rule): with the Apple secrets unset this
// returns { configured: false } and a 200. Account deletion must never fail
// because revocation is not configured yet.
//
// Secrets: APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY, APPLE_CLIENT_ID.
// See the footer of supabase/migrations/00037_apple_credentials.sql.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';
const APPLE_REVOKE_URL = 'https://appleid.apple.com/auth/revoke';

const TEAM_ID = Deno.env.get('APPLE_TEAM_ID');
const KEY_ID = Deno.env.get('APPLE_KEY_ID');
const PRIVATE_KEY = Deno.env.get('APPLE_PRIVATE_KEY');
// Native Sign in with Apple authorizes against the BUNDLE ID.
const CLIENT_ID = Deno.env.get('APPLE_CLIENT_ID') ?? 'com.bexhearts.app';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const appleConfigured = Boolean(TEAM_ID && KEY_ID && PRIVATE_KEY && CLIENT_ID);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// ——— Apple client secret ———————————————————————————————————————————————
// Apple doesn't take a static secret: every call needs a short-lived ES256 JWT
// signed with the .p8 key. Built by hand with Web Crypto so this function
// pulls in no JWT dependency.

function base64UrlEncode(input: Uint8Array | string): string {
  const bytes =
    typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Import the .p8 private key.
 *
 * Accepts the file verbatim (BEGIN/END lines and real newlines) or with the
 * newlines escaped as \n, because a key pasted into an env var arrives either
 * way and getting this wrong is an opaque failure.
 */
async function importApplePrivateKey(pem: string): Promise<CryptoKey> {
  const normalized = pem.replace(/\\n/g, '\n');
  const body = normalized
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

async function buildClientSecret(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const payload = {
    iss: TEAM_ID,
    iat: now,
    // Apple allows up to 6 months; minutes is all we need and limits the blast
    // radius if a signed secret ever leaked out of a log.
    exp: now + 300,
    aud: 'https://appleid.apple.com',
    sub: CLIENT_ID,
  };

  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(payload)
  )}`;

  const key = await importApplePrivateKey(PRIVATE_KEY!);
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

// ——— Apple calls ————————————————————————————————————————————————————————

async function exchangeCodeForRefreshToken(code: string): Promise<string> {
  const clientSecret = await buildClientSecret();
  const res = await fetch(APPLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    refresh_token?: string;
    error?: string;
  };
  if (!res.ok || !data.refresh_token) {
    throw new Error(`apple_token_exchange_failed: ${data.error ?? res.status}`);
  }
  return data.refresh_token;
}

async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const clientSecret = await buildClientSecret();
  const res = await fetch(APPLE_REVOKE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: clientSecret,
      token: refreshToken,
      token_type_hint: 'refresh_token',
    }),
  });

  // Apple returns 200 with an empty body on success. A token that was already
  // revoked (or expired) comes back as invalid_token — that is the desired end
  // state, so treat it as success rather than retrying it forever.
  if (res.ok) return;
  const text = await res.text().catch(() => '');
  if (text.includes('invalid_token')) return;
  throw new Error(`apple_revoke_failed: ${res.status} ${text}`.trim());
}

// ——— Handler ————————————————————————————————————————————————————————————

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  const bearer = authHeader.replace(/^Bearer\s+/i, '');
  if (!bearer) return json({ error: 'unauthorized' }, 401);

  let body: { action?: string; authorizationCode?: string } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const action = body.action ?? 'revoke';

  // Not configured yet: say so plainly and succeed. Deletion must not be
  // blocked on a secret the owner hasn't set.
  if (!appleConfigured) {
    return json({ ok: true, configured: false, action });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // ── Service-role sweep ──────────────────────────────────────────────────
  if (action === 'sweep') {
    if (bearer !== SERVICE_ROLE_KEY) return json({ error: 'forbidden' }, 403);

    const { data: pending, error } = await admin.rpc(
      'apple_credentials_pending_revocation'
    );
    if (error) return json({ error: error.message }, 500);

    let revoked = 0;
    let failed = 0;
    for (const row of (pending ?? []) as { user_id: string; refresh_token: string }[]) {
      try {
        await revokeRefreshToken(row.refresh_token);
        await admin
          .from('apple_credentials')
          .update({ revoked_at: new Date().toISOString(), revoke_error: null })
          .eq('user_id', row.user_id);
        revoked += 1;
      } catch (err) {
        failed += 1;
        await admin
          .from('apple_credentials')
          .update({
            revoke_failed_at: new Date().toISOString(),
            revoke_error: String((err as Error).message).slice(0, 300),
          })
          .eq('user_id', row.user_id);
      }
    }
    return json({ ok: true, configured: true, planned: (pending ?? []).length, revoked, failed });
  }

  // ── User-scoped actions ─────────────────────────────────────────────────
  // The user id comes from the VERIFIED token. Never from the body.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: 'unauthorized' }, 401);

  if (action === 'store') {
    const code = body.authorizationCode;
    if (!code) return json({ error: 'missing_authorization_code' }, 400);
    try {
      const refreshToken = await exchangeCodeForRefreshToken(code);
      const { error } = await admin.from('apple_credentials').upsert(
        {
          user_id: user.id,
          refresh_token: refreshToken,
          // A fresh authorization supersedes any earlier revocation — this is
          // exactly what happens when someone cancels a pending deletion by
          // signing back in during the grace window.
          revoked_at: null,
          revoke_failed_at: null,
          revoke_error: null,
        },
        { onConflict: 'user_id' }
      );
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, configured: true, stored: true });
    } catch (err) {
      // Never surface this to the user — sign-in already succeeded and this is
      // housekeeping for a deletion that may never happen.
      return json({ ok: false, configured: true, error: String((err as Error).message) }, 200);
    }
  }

  if (action === 'revoke') {
    const { data: row } = await admin
      .from('apple_credentials')
      .select('refresh_token, revoked_at')
      .eq('user_id', user.id)
      .maybeSingle();

    // No stored credential = this account never used Sign in with Apple.
    // Nothing to revoke, and that is a success, not an error.
    if (!row) return json({ ok: true, configured: true, revoked: false, reason: 'no_credential' });
    if (row.revoked_at) return json({ ok: true, configured: true, revoked: true, reason: 'already_revoked' });

    try {
      await revokeRefreshToken(row.refresh_token);
      await admin
        .from('apple_credentials')
        .update({ revoked_at: new Date().toISOString(), revoke_error: null })
        .eq('user_id', user.id);
      return json({ ok: true, configured: true, revoked: true });
    } catch (err) {
      await admin
        .from('apple_credentials')
        .update({
          revoke_failed_at: new Date().toISOString(),
          revoke_error: String((err as Error).message).slice(0, 300),
        })
        .eq('user_id', user.id);
      // 200 on purpose: the caller proceeds with deletion regardless, and the
      // sweep retries. Blocking a deletion on Apple being unreachable would be
      // a worse failure than a delayed revoke.
      return json({ ok: false, configured: true, revoked: false, error: 'revoke_failed' }, 200);
    }
  }

  return json({ error: 'unknown_action' }, 400);
});
