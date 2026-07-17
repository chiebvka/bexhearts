-- ============================================================
-- BOUNDARIES — category + either-partner update (D4)
-- ============================================================
-- Two changes, both on `boundaries`:
--
-- 1. ADD COLUMN `category` (nullable TEXT). Groups a boundary/temptation by
--    theme (purity, digital, friendships, time, finances, family,
--    communication, … for boundaries; lust, emotional-affair, substances,
--    anger, comparison, secrecy, … for temptations). Kept FREEFORM TEXT rather
--    than a CHECK constraint on purpose: the taxonomy will grow when the
--    curated stage-aware template library ships, and we don't want an ALTER on
--    the constraint every time. The app supplies the option set
--    (src/features/boundaries/categories.ts). Nullable so existing rows and
--    quick freeform entries are fine.
--
-- 2. Broaden the UPDATE policy from author-only to any couple member, so EITHER
--    partner can update / deactivate a shared boundary (mirrors 00009 for
--    prayers). DELETE stays author-only; column-level edit rules are
--    app-enforced. WITH CHECK keeps couple-level isolation.
-- ============================================================

ALTER TABLE public.boundaries
  ADD COLUMN category TEXT;

DROP POLICY IF EXISTS "Author can update boundaries" ON public.boundaries;

CREATE POLICY "Couple can update boundaries"
  ON public.boundaries FOR UPDATE
  USING (couple_id = public.get_my_couple_id())
  WITH CHECK (couple_id = public.get_my_couple_id());
