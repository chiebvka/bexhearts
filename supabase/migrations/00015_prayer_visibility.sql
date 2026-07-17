-- 00015 — personal vs shared prayers (owner ask, 2026-07-04).
-- A prayer can now be PERSONAL (only its author sees and manages it) or
-- SHARED with the couple (default — existing rows stay shared). This is the
-- foundation for the prayer-focus session: personal requests stay private
-- while shared ones appear on both partners' prayer walls.

ALTER TABLE public.prayers ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT false;

-- Partners must not see each other's personal prayers.
DROP POLICY "Couple can read prayers" ON public.prayers;
CREATE POLICY "Couple reads shared, author reads own private"
  ON public.prayers FOR SELECT
  USING (
    couple_id = public.get_my_couple_id()
    AND (NOT is_private OR author_id = auth.uid())
  );

-- Lifecycle (answer/archive) stays couple-wide for shared prayers (00009
-- decision); personal prayers are managed only by their author.
DROP POLICY "Couple can update prayers" ON public.prayers;
CREATE POLICY "Couple updates shared, author updates private"
  ON public.prayers FOR UPDATE
  USING (
    couple_id = public.get_my_couple_id()
    AND (NOT is_private OR author_id = auth.uid())
  )
  WITH CHECK (
    couple_id = public.get_my_couple_id()
    AND (NOT is_private OR author_id = auth.uid())
  );
