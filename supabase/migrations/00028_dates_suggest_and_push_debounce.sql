-- 00028 — Dates v2 suggest→accept + push debounce (G2, 2026-07-19)
--
-- PART 1: Dates v2 (owner-queued since 2026-07-05, unblocked by G1 push):
-- a partner can SUGGEST a library/custom date idea to the other; it lands in
-- Our Dates as "Suggested" with Accept / Pass on the receiving partner's side.
-- Status stays DERIVED (dateHelpers): suggested_by set + no accepted_at + not
-- completed → 'suggested'; accepting stamps accepted_at (→ saved/planned);
-- passing simply removes the row. Legacy rows (suggested_by NULL) behave
-- exactly as before.
ALTER TABLE public.couple_dates
  ADD COLUMN suggested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN accepted_at TIMESTAMPTZ;

-- PART 2: push debounce (G2·M2, owner-approved: max one PUSH per category
-- per window; the inbox row is ALWAYS written). send-notification stamps
-- pushed_at only when an OS push was actually dispatched, and skips the push
-- when the latest pushed_at for (recipient, category) is inside the window
-- (currently 2h for partner_activity — see the function + prefs.ts mirror).
ALTER TABLE public.notifications
  ADD COLUMN pushed_at TIMESTAMPTZ;

CREATE INDEX idx_notifications_push_debounce
  ON public.notifications (recipient_id, category, pushed_at DESC)
  WHERE pushed_at IS NOT NULL;
