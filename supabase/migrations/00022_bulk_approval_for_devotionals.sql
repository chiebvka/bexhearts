-- 00022 — bulk-approve + promote the reviewed launch devotionals.
-- NOTE: this is a one-off DATA operation, not a schema change. It lives in the
-- migrations folder on purpose (owner, 2026-07-10): the folder doubles as the
-- exact ordered run-list for standing up the production Supabase on the VPS.
-- Run it AFTER 00021 (and after reviewing the drafts in Studio if desired).

-- 1. Approve all pending drafts (owner has reviewed them).
UPDATE public.devotional_drafts SET approved = true;

-- 2. Promote: moves every approved draft out of staging into the live
--    rotation pool. Returns the number moved.
SELECT public.promote_approved_devotionals();
