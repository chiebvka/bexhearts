-- ============================================================
-- CHECK-INS UPDATE POLICY (D3 · fixes Bug #1)
-- ============================================================
-- `check_ins` shipped with SELECT + INSERT RLS policies but NO UPDATE policy
-- (00001). Resubmitting a weekly check-in is an upsert that resolves to an
-- UPDATE on the existing UNIQUE(couple_id, user_id, week_of) row — with no
-- UPDATE policy every resubmit was denied by RLS. This adds the missing policy.
--
-- A user may update only their OWN check-in within their OWN couple. The
-- WITH CHECK mirrors the USING clause so a row can't be moved to another couple
-- or reassigned to another user. Pairs with the code fix in
-- src/api/check-ins.ts (upsert onConflict: 'couple_id,user_id,week_of').
-- ============================================================

CREATE POLICY "Users can update own check-ins"
  ON public.check_ins FOR UPDATE
  USING (user_id = auth.uid() AND couple_id = public.get_my_couple_id())
  WITH CHECK (user_id = auth.uid() AND couple_id = public.get_my_couple_id());
