-- ============================================================
-- ACCOUNT DELETION (B4) — App Store requirement
-- ============================================================
-- A signed-in user can permanently delete their own account.
--
-- delete_my_account() deletes the caller's row in auth.users. Everything else
-- cascades from the existing foreign keys defined in 00001_initial_schema.sql:
--
--   auth.users (row deleted)
--     └─ public.profiles.id            ON DELETE CASCADE  → caller's profile removed
--          ├─ public.couples.partner_a_id ON DELETE CASCADE → if the caller CREATED
--          │     the couple, the whole couple row is removed, which in turn cascades
--          │     to every couple-scoped table (prayers, check_ins, boundaries,
--          │     devotional_progress, couple_dates) via their couple_id FKs.
--          ├─ public.couples.partner_b_id ON DELETE SET NULL → if the caller JOINED a
--          │     couple, the couple survives with partner_b detached; the remaining
--          │     partner (partner_a) keeps the couple and can re-invite.
--          └─ public.profiles.couple_id   ON DELETE SET NULL → the surviving partner
--                is detached from a couple that gets removed.
--
-- NOTE (documented asymmetry, acceptable for v1): deletion by the couple's
-- creator (partner_a) dissolves the couple and its shared data; deletion by the
-- joined partner (partner_b) only detaches that partner. This matches the FK
-- design and the "couple is the unit" model. Revisit if product needs symmetric
-- hand-off later.
--
-- SECURITY DEFINER so the function can reach the `auth` schema; it runs with the
-- owner's (postgres) privileges, not the caller's. search_path is pinned to ''
-- (every reference is fully schema-qualified) to prevent search-path hijacking.
-- A call can only ever delete the CALLER, because it targets auth.uid().
-- EXECUTE is granted only to authenticated users (never anon/public).
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_my_account()
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

  -- Cascades through public.profiles and all couple-scoped data (see header).
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
