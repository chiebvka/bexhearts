-- ============================================================
-- 00036 — COMP / FREE-ACCESS ALLOWLIST
-- ============================================================
-- F2 locked everything behind the paywall. That is right for strangers and
-- wrong for the handful of people who must have access without paying:
-- friends and family who tested the app, pastors and small-group leaders who
-- will recommend it, and — most importantly — the App Review demo account,
-- without which a fully-paywalled app is rejected outright.
--
-- ⚠️ THIS MIGRATION SHIPS THE TABLE. IT DOES NOT SHIP THE ROWS.
-- The addresses are real people's personal data and this repo is version
-- controlled and will outlive the grants. The owner inserts rows by hand in
-- Studio (INSERT examples at the bottom of this file). An agent must never
-- add a row here.
--
-- DESIGN NOTES
--
--  1. KEYED BY LOWERCASED EMAIL. Email is what the owner actually has. It is
--     normalized by trigger rather than by asking whoever pastes the rows to
--     remember — "Pastor.Dan@Gmail.com" and "pastor.dan@gmail.com" are one
--     person, and a comp that silently doesn't apply is worse than none.
--
--  2. GRANT-BY-COUPLE-ID FALLBACK, for Apple "Hide My Email". Sign in with
--     Apple can hand us a `…@privaterelay.appleid.com` relay address that the
--     owner cannot know in advance and would never recognise in a list. Those
--     people are granted by their couple id instead: find the couple in
--     Studio, insert a row with couple_id. The couple grant is also the right
--     shape conceptually — billing is per couple, so comp should be too.
--
--  3. ORed WITH REVENUECAT, never replacing it. `has_comp_access()` answers
--     one narrow question; the client ORs it with the store entitlement. A
--     comped person who later subscribes is simply entitled twice.
--
--  4. REVOCABLE AND EXPIRABLE without deleting the row, so the history of who
--     was comped and why survives (revoked_at / expires_at).
--
--  5. INVISIBLE TO THE APP. RLS is enabled with NO policies at all — exactly
--     the pattern devotional_drafts uses. No client can read the list, so a
--     comped user's email can never leak to another user through the API.
--     Reads happen only inside the SECURITY DEFINER function below.
--
-- Owner applies in Studio.

-- ── The allowlist ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comp_access (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT,
  couple_id   UUID REFERENCES public.couples(id) ON DELETE CASCADE,
  -- Why this grant exists: 'app_review_demo', 'beta_tester', 'pastor',
  -- 'family'. Internal only; never shown in the app.
  label       TEXT,
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- NULL = never expires. Set it for time-boxed comps (a launch cohort).
  expires_at  TIMESTAMPTZ,
  -- Set instead of deleting, so the record of the grant survives.
  revoked_at  TIMESTAMPTZ,
  notes       TEXT,

  CONSTRAINT comp_access_target_present
    CHECK (email IS NOT NULL OR couple_id IS NOT NULL)
);

-- One live row per target. Partial so revoked rows don't block a re-grant.
CREATE UNIQUE INDEX IF NOT EXISTS comp_access_email_active_idx
  ON public.comp_access (email)
  WHERE email IS NOT NULL AND revoked_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS comp_access_couple_active_idx
  ON public.comp_access (couple_id)
  WHERE couple_id IS NOT NULL AND revoked_at IS NULL;

COMMENT ON TABLE public.comp_access IS
  'Free-access allowlist ORed with the RevenueCat entitlement. Rows are '
  'inserted by the owner only — never committed to the repo.';

-- ── Normalize email on the way in ─────────────────────────────────────────
-- The owner will paste addresses from a phone, an email client, a note. Any
-- of those can carry stray whitespace or capitals; none of that should decide
-- whether someone gets in.
CREATE OR REPLACE FUNCTION public.comp_access_normalize()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email := lower(btrim(NEW.email));
    IF NEW.email = '' THEN
      NEW.email := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS comp_access_normalize_trg ON public.comp_access;
CREATE TRIGGER comp_access_normalize_trg
  BEFORE INSERT OR UPDATE ON public.comp_access
  FOR EACH ROW EXECUTE FUNCTION public.comp_access_normalize();

-- ── Locked down: no policies, so no client can read it ────────────────────
ALTER TABLE public.comp_access ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.comp_access FROM anon, authenticated;

-- ── The only way in: does the CALLER have comp access? ────────────────────
-- SECURITY DEFINER so it can read a table the caller cannot. It takes no
-- arguments and answers only about the caller — there is deliberately no way
-- to ask "is someone else comped?", which would turn this into an email
-- oracle.
CREATE OR REPLACE FUNCTION public.has_comp_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_email TEXT;
  caller_couple UUID;
  granted BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- auth.users is the source of truth: the JWT's email claim can be stale
  -- after an address change, and for Apple relay sign-ins it is the relay
  -- address (which is exactly why the couple_id fallback below exists).
  SELECT lower(btrim(u.email)) INTO caller_email
  FROM auth.users u
  WHERE u.id = auth.uid();

  caller_couple := public.get_my_couple_id();

  SELECT EXISTS (
    SELECT 1
    FROM public.comp_access c
    WHERE c.revoked_at IS NULL
      AND (c.expires_at IS NULL OR c.expires_at > now())
      AND (
        (c.email IS NOT NULL AND caller_email IS NOT NULL AND c.email = caller_email)
        OR
        (c.couple_id IS NOT NULL AND caller_couple IS NOT NULL AND c.couple_id = caller_couple)
      )
  ) INTO granted;

  RETURN COALESCE(granted, FALSE);
END;
$$;

REVOKE ALL ON FUNCTION public.has_comp_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_comp_access() TO authenticated;

COMMENT ON FUNCTION public.has_comp_access() IS
  'True when the CALLER is on the comp allowlist (by email, or by couple id '
  'for Apple Hide-My-Email relay users). Answers only about the caller.';

-- ============================================================
-- OWNER: HOW TO GRANT (run these in Studio, never in this file)
-- ============================================================
--
-- By email (the normal case — capitals and spaces are fine, the trigger
-- normalizes them):
--
--   INSERT INTO public.comp_access (email, label, notes)
--   VALUES ('Friend@Example.com', 'beta_tester', 'tested the invite flow');
--
-- The App Review demo account — grant this one BEFORE submitting, or Apple
-- hits the paywall and rejects the build:
--
--   INSERT INTO public.comp_access (email, label, notes)
--   VALUES ('demo@bexhearts.com', 'app_review_demo', 'Apple/Google review');
--
-- Apple "Hide My Email" (you can't know their relay address): find them, then
-- grant the whole couple.
--
--   SELECT p.id, p.email, p.couple_id, p.full_name
--   FROM public.profiles p
--   WHERE p.full_name ILIKE '%their name%';
--
--   INSERT INTO public.comp_access (couple_id, label, notes)
--   VALUES ('<couple-uuid>', 'family', 'signed in with Apple relay');
--
-- Check who currently has access:
--
--   SELECT email, couple_id, label, granted_at, expires_at
--   FROM public.comp_access
--   WHERE revoked_at IS NULL
--     AND (expires_at IS NULL OR expires_at > now());
--
-- Revoke (keeps the record of the grant):
--
--   UPDATE public.comp_access SET revoked_at = now()
--   WHERE email = 'friend@example.com';
