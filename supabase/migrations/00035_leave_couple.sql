-- ============================================================
-- 00035 — E14: LEAVING A COUPLE (breakup / divorce / unlink)
-- ============================================================
-- Until now the ONLY way out of a couple was deleting your account, which is
-- a terrible thing to force on someone whose relationship ended.
--
-- The F2 per-couple entitlement made this urgent rather than nice-to-have:
-- the subscription is attached to `couple_<id>`, so after a breakup BOTH
-- people sit on an entitlement neither wants and the person actually paying
-- cannot take their own subscription with them.
--
-- OWNER-APPROVED DESIGN (2026-07-26), and why each rule exists:
--
--  1. UNILATERAL AND IMMEDIATE. Never mutual consent, never a waiting period,
--     never a notification to the other partner. Someone leaving an abusive
--     relationship must be able to leave at once, without negotiating with
--     the person they are leaving, and without that person being alerted.
--
--  2. NON-DESTRUCTIVE. The leaver detaches; the remaining partner keeps the
--     couple space and everything in it. Leaving must never be usable as a
--     weapon to delete someone else's memories. (Same contract as the B4
--     account-deletion hand-off in 00005.)
--
--  3. THE INVITE CODE ROTATES, so an ex cannot rejoin using a code they still
--     have on their phone.
--
--  4. NO STREAK OR POINTS TRANSFER. They were earned together. The leaver
--     starts a new relationship with a clean slate; this is also what stops
--     "streak laundering" by re-linking.
--
--  5. AUDITED. A `partner_left` event is written to couple_events so the
--     remaining partner's history is honest about what happened.
--
-- KNOWN LIMITATION (documented, scheduled post-launch): once detached, the
-- leaver can no longer read the shared journal — RLS keys off couple_id. The
-- 30-day archive + export for the leaver is a follow-up; this migration
-- deliberately does the safe, simple thing first rather than reworking RLS
-- across every couple-scoped table.
--
-- Owner applies in Studio.

-- 1) When the couple was dissolved, and by whom (audit + future archive).
ALTER TABLE public.couples
  ADD COLUMN unlinked_at TIMESTAMPTZ,
  ADD COLUMN unlinked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2) leave_couple() — SECURITY DEFINER because it has to touch the couple row
-- and the leaver's profile atomically, and rotate a code the caller must not
-- be able to set themselves.
CREATE OR REPLACE FUNCTION public.leave_couple()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   UUID := auth.uid();
  v_couple    public.couples%ROWTYPE;
  v_new_code  TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT c.* INTO v_couple
  FROM public.couples c
  JOIN public.profiles p ON p.couple_id = c.id
  WHERE p.id = v_user_id;

  IF NOT FOUND THEN
    RETURN; -- already solo; leaving is a no-op rather than an error
  END IF;

  -- Audit BEFORE detaching, while the couple still exists (rule 5). The
  -- remaining partner can see that their partner left and when.
  INSERT INTO public.couple_events (couple_id, user_id, event_type, metadata)
  VALUES (
    v_couple.id,
    v_user_id,
    'partner_left',
    jsonb_build_object('left_at', now())
  );

  -- Rotate the invite code so an old code can't be reused to rejoin (rule 3).
  v_new_code := upper(substring(replace(gen_random_uuid()::text, '-', '') for 6));

  IF v_couple.partner_a_id = v_user_id THEN
    -- The creator is leaving: promote partner B so the remaining partner
    -- keeps the couple space intact (rule 2). If there is no partner B the
    -- couple is empty and is simply marked dissolved.
    UPDATE public.couples
       SET partner_a_id = COALESCE(v_couple.partner_b_id, v_couple.partner_a_id),
           partner_b_id = NULL,
           linked_at = NULL,
           invite_code = v_new_code,
           invite_code_expires_at = now() + interval '7 days',
           unlinked_at = now(),
           unlinked_by = v_user_id,
           updated_at = now()
     WHERE id = v_couple.id;
  ELSE
    UPDATE public.couples
       SET partner_b_id = NULL,
           linked_at = NULL,
           invite_code = v_new_code,
           invite_code_expires_at = now() + interval '7 days',
           unlinked_at = now(),
           unlinked_by = v_user_id,
           updated_at = now()
     WHERE id = v_couple.id;
  END IF;

  -- Detach the leaver. RLS keys off profiles.couple_id, so from this moment
  -- they can no longer read or write ANY of the couple's data — including
  -- their ex's. They keep their own account, and can create or join a new
  -- couple with a clean streak (rule 4).
  UPDATE public.profiles
     SET couple_id = NULL,
         updated_at = now()
   WHERE id = v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.leave_couple() TO authenticated;
