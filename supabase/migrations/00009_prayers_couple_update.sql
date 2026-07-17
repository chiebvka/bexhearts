-- ============================================================
-- PRAYERS — either partner can update lifecycle (D2)
-- ============================================================
-- A shared prayer belongs to the couple, not just its author. The original
-- policy (00001) let ONLY the author UPDATE, so a partner couldn't mark a
-- prayer answered or archive it — breaking the "we pray through this together"
-- promise. This broadens UPDATE to any member of the couple.
--
-- Decision (owner, 2026-06-29): either partner may mark answered / archive;
-- editing the prayer's text and hard-DELETE stay with the author. DELETE is
-- already author-only (unchanged here). Restricting *which columns* a non-author
-- may change (text vs. status) is enforced in the app layer (the edit affordance
-- is shown only to the author), consistent with the rest of the codebase —
-- RLS's job here is couple-level isolation, which WITH CHECK preserves.
-- ============================================================

DROP POLICY IF EXISTS "Author can update prayers" ON public.prayers;

CREATE POLICY "Couple can update prayers"
  ON public.prayers FOR UPDATE
  USING (couple_id = public.get_my_couple_id())
  WITH CHECK (couple_id = public.get_my_couple_id());
