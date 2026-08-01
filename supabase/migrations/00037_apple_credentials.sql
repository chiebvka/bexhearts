-- ============================================================
-- 00037 — APPLE TOKEN REVOCATION (App Store Guideline 5.1.1(v))
-- ============================================================
-- Apple requires that an app offering Sign in with Apple ALSO revokes the
-- user's Apple tokens when they delete their account. Offering deletion is not
-- enough — the Apple↔app link has to be severed at Apple's end too, or the
-- build is rejected. This has been an open TODO since B4 (June) and is the
-- last hard blocker on submission.
--
-- WHY A TABLE IS NEEDED AT ALL
--
-- Revocation (POST https://appleid.apple.com/auth/revoke) needs a token. The
-- only thing the device gets at sign-in is a short-lived `authorizationCode`
-- that **expires in about five minutes** — long gone by the time someone
-- decides to delete their account months later. So the code must be exchanged
-- for a long-lived REFRESH TOKEN at sign-in, and that refresh token stored
-- until it is needed. That is what this table is for, and it is the only
-- reason it exists.
--
-- SECURITY POSTURE
--
--  * An Apple refresh token is a credential. RLS is enabled with **NO
--    policies at all** (the devotional_drafts / comp_access pattern), so no
--    client can read it — not even its owner. It is touched exclusively by
--    the `apple-revoke` edge function using the service role.
--  * ON DELETE CASCADE from profiles: when the account is finally hard-deleted
--    (00005's `process_due_account_deletions`), the credential goes with it.
--    We never keep a token for an account that no longer exists.
--  * We store the refresh token ONLY. Never the identity token, never the
--    authorization code, never any Apple profile data.
--
-- WHEN REVOCATION HAPPENS
--
-- At deletion REQUEST time, not at the end of the 7-day grace window. Two
-- reasons: an App Review tester taps "Delete account" and expects the Apple
-- connection to be gone right then, and the grace window is our own product
-- decision that Apple knows nothing about. Revoking early is harmless — if the
-- user changes their mind and signs back in during the grace period (which
-- cancels the deletion, per 00005), Apple simply treats it as a fresh
-- authorization and a new refresh token is stored.
--
-- Owner applies in Studio. See the SECRETS block at the bottom — the feature
-- degrades gracefully and deletion still works until those are set.

CREATE TABLE IF NOT EXISTS public.apple_credentials (
  user_id           UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Apple refresh token, exchanged from the sign-in authorization code.
  refresh_token     TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Set once Apple has confirmed the revoke. A row with this set is inert.
  revoked_at        TIMESTAMPTZ,
  -- Best-effort diagnostics for a revoke that didn't land, so the retry sweep
  -- has something to work with and support has something to read.
  revoke_failed_at  TIMESTAMPTZ,
  revoke_error      TEXT
);

COMMENT ON TABLE public.apple_credentials IS
  'Apple refresh tokens, stored solely so account deletion can revoke them '
  '(App Store Guideline 5.1.1(v)). Service-role access only.';

-- Find rows that still owe Apple a revoke: the account is on its way out but
-- the token has not been revoked yet. Drives the retry sweep, so a revoke that
-- failed because Apple was briefly unreachable is not lost.
CREATE INDEX IF NOT EXISTS apple_credentials_pending_revoke_idx
  ON public.apple_credentials (revoked_at)
  WHERE revoked_at IS NULL;

-- ── Locked down: RLS on, deliberately zero policies ───────────────────────
ALTER TABLE public.apple_credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.apple_credentials FROM anon, authenticated;

-- ── Keep updated_at honest ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.apple_credentials_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS apple_credentials_touch_trg ON public.apple_credentials;
CREATE TRIGGER apple_credentials_touch_trg
  BEFORE UPDATE ON public.apple_credentials
  FOR EACH ROW EXECUTE FUNCTION public.apple_credentials_touch();

-- ── The retry sweep's input ───────────────────────────────────────────────
-- Users whose deletion is pending (00005 stamped deletion_scheduled_at) and
-- whose Apple token has not been revoked yet. SECURITY DEFINER because it
-- reads a table nobody can read; execution is granted to NOBODY, so only the
-- service role (which bypasses grants) can call it.
CREATE OR REPLACE FUNCTION public.apple_credentials_pending_revocation()
RETURNS TABLE (user_id UUID, refresh_token TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ac.user_id, ac.refresh_token
  FROM public.apple_credentials ac
  JOIN public.profiles p ON p.id = ac.user_id
  WHERE ac.revoked_at IS NULL
    AND p.deletion_scheduled_at IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.apple_credentials_pending_revocation() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.apple_credentials_pending_revocation() IS
  'Accounts pending deletion whose Apple token still needs revoking. '
  'Service-role only; consumed by the apple-revoke edge function sweep.';

-- ============================================================
-- OWNER: SECRETS (set these on the functions runtime, then restart it)
-- ============================================================
-- Until all four are present the `apple-revoke` function reports
-- "not configured" and does nothing. Account deletion still works — it just
-- doesn't revoke, which is the pre-existing behaviour. Nothing breaks.
--
--   APPLE_TEAM_ID     Apple Developer → Membership → Team ID (10 chars)
--   APPLE_KEY_ID      The Key ID of a "Sign in with Apple" key (10 chars)
--   APPLE_PRIVATE_KEY The FULL contents of the AuthKey_XXXXXXXXXX.p8 file,
--                     including the BEGIN/END lines. Keep the newlines, or
--                     replace them with \n — the function handles both.
--   APPLE_CLIENT_ID   com.bexhearts.app
--                     (For NATIVE Sign in with Apple the client_id is the app's
--                     BUNDLE ID, not a Services ID. Using a Services ID here is
--                     the single most common reason revoke returns
--                     invalid_client.)
--
-- Create the key at: Apple Developer → Certificates, Identifiers & Profiles →
-- Keys → + → tick "Sign in with Apple". The .p8 downloads exactly once.
--
-- Locally:  add them to supabase/functions/.env, then restart
--           `supabase functions serve --env-file supabase/functions/.env`
-- On the VPS: set them on the functions container per docs/EDGE_FUNCTIONS.md.
--
-- ============================================================
-- OWNER (OPTIONAL): the retry sweep
-- ============================================================
-- Request-time revocation is the primary path and covers App Review. This
-- daily sweep only catches revokes that failed because Apple was briefly
-- unreachable. Apply it once the function is deployed and the secrets are set;
-- replace both placeholders exactly as you did for 00029.
--
--   SELECT cron.schedule(
--     'apple-revoke-sweep',
--     '20 3 * * *',
--     $cron$
--     SELECT net.http_post(
--       url     := 'YOUR_SUPABASE_URL/functions/v1/apple-revoke',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
--       ),
--       body    := jsonb_build_object('action', 'sweep')
--     );
--     $cron$
--   );
--
-- Verify with:  SELECT jobname, schedule, active FROM cron.job;
