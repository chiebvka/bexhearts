-- 1. Bulk-approve all 60 drafts (you've reviewed them)
UPDATE public.devotional_drafts SET approved = true;


-- 2. Promote: moves every approved draft out of staging into the live
--    rotation pool (it returns the number moved — expect 60)
SELECT public.promote_approved_devotionals();