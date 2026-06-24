-- ============================================================
-- ACCOUNT DELETION v2 (B4 hardening) — 7-day grace + non-destructive to partner
-- ============================================================
-- Supersedes the immediate hard-delete from 00003. Deletion is now a lifecycle:
--   1) request_account_deletion()      → stamps the caller's profile with a
--      7-day grace deadline; the app signs them out. Reversible.
--   2) cancel_account_deletion()       → clears the deadline ("reactivation");
--      the app calls this automatically if they sign back in within the window.
--   3) process_due_account_deletions() → backend/cron job (pg_cron, wired in
--      Stage I / Step G2) that hard-deletes accounts past their deadline,
--      handing the couple off to the REMAINING partner first (no silent data
--      loss). Runnable manually in Studio for local testing.
--
-- Non-destructive hand-off (vs 00003's blanket cascade): if the leaver is the
-- couple creator (partner_a) and a partner_b exists, partner_b is promoted to
-- partner_a so the couple + its shared data survive for them. The couple is only
-- removed when its LAST member leaves. The leaver's own authored rows still
-- cascade away (their personal data — GDPR-aligned).
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN deletion_scheduled_at TIMESTAMPTZ;

-- 00003's immediate hard-delete is destructive to the partner; remove it so the
-- only deletion path is the graceful, non-destructive one below.
DROP FUNCTION IF EXISTS public.delete_my_account();

-- Schedule deletion for the caller (7-day grace). Returns the deadline.
CREATE OR REPLACE FUNCTION public.request_account_deletion()
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_deadline TIMESTAMPTZ := now() + interval '7 days';
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.profiles
    SET deletion_scheduled_at = v_deadline
    WHERE id = v_user_id;

  RETURN v_deadline;
END;
$$;

-- Cancel a pending deletion for the caller (reactivation).
CREATE OR REPLACE FUNCTION public.cancel_account_deletion()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.profiles
    SET deletion_scheduled_at = NULL
    WHERE id = v_user_id;
END;
$$;

-- Internal: hard-delete one account with non-destructive partner hand-off.
CREATE OR REPLACE FUNCTION public._hard_delete_account(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Leaver is partner_a and a partner_b exists → promote partner_b to partner_a
  -- BEFORE the delete, so the partner_a_id CASCADE does not remove the couple.
  UPDATE public.couples
    SET partner_a_id = partner_b_id,
        partner_b_id = NULL,
        linked_at = NULL
    WHERE partner_a_id = p_user_id AND partner_b_id IS NOT NULL;

  -- Leaver is partner_b → couple stays with partner_a; mark it unlinked
  -- (partner_b_id itself is SET NULL by the FK on the delete below).
  UPDATE public.couples
    SET linked_at = NULL
    WHERE partner_b_id = p_user_id;

  -- Cascades remove the leaver's profile + their own authored rows. A couple
  -- where they were the SOLE member (partner_a, no partner_b) cascade-deletes.
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- Backend/cron entry point: hard-delete everyone past their grace deadline.
-- Returns the number of accounts processed.
CREATE OR REPLACE FUNCTION public.process_due_account_deletions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer := 0;
  v_id UUID;
BEGIN
  FOR v_id IN
    SELECT id FROM public.profiles
    WHERE deletion_scheduled_at IS NOT NULL
      AND deletion_scheduled_at <= now()
  LOOP
    PERFORM public._hard_delete_account(v_id);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Users may request/cancel their OWN deletion; the processor + internal helper
-- are backend-only (called by the scheduled job / service role, never the app).
REVOKE ALL ON FUNCTION public.request_account_deletion() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_account_deletion() FROM PUBLIC;
REVOKE ALL ON FUNCTION public._hard_delete_account(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_due_account_deletions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_account_deletion() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_account_deletion() TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_due_account_deletions() TO service_role;

-- TODO (Stage I / Step G2): schedule the processor, e.g. daily via pg_cron:
--   select cron.schedule('process-account-deletions', '0 3 * * *',
--                        $$ select public.process_due_account_deletions(); $$);
