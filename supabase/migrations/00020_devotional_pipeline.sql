-- 00020 — devotional content pipeline (owner approved 2026-07-05).
-- Calendar-communal serving from an evergreen pool:
--   • pool rows have `sequence` set and publish_date NULL — rotation serves
--     them by (days since epoch) mod pool size, so no date is ever empty;
--   • rows WITH publish_date act as seasonal OVERRIDES (Advent, Lent…) and
--     win over rotation on their day — existing rows keep working;
--   • drafts land in devotional_drafts (invisible to the app), the owner
--     reviews/edits in Studio, flips approved, then runs
--     SELECT public.promote_approved_devotionals();

-- 1) Pool + personalization tags on devotionals.
ALTER TABLE public.devotionals ALTER COLUMN publish_date DROP NOT NULL;
ALTER TABLE public.devotionals ADD COLUMN sequence INTEGER UNIQUE;
ALTER TABLE public.devotionals ADD COLUMN stage_tags TEXT[] NOT NULL DEFAULT '{dating,engaged,married}';
ALTER TABLE public.devotionals ADD COLUMN focus_tags TEXT[] NOT NULL DEFAULT '{}';

-- 2) Today's devotional: date override first, else rotate the pool.
-- Epoch is fixed so the rotation is deterministic for everyone.
CREATE OR REPLACE FUNCTION public.get_today_devotional()
RETURNS SETOF public.devotionals
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.devotionals WHERE publish_date = CURRENT_DATE
  UNION ALL
  SELECT d.* FROM public.devotionals d
  WHERE d.sequence IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.devotionals o WHERE o.publish_date = CURRENT_DATE
    )
  ORDER BY sequence
  OFFSET COALESCE(
    (CURRENT_DATE - DATE '2026-01-01') % NULLIF(
      (SELECT count(*) FROM public.devotionals WHERE sequence IS NOT NULL), 0
    ),
    0
  )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_today_devotional() TO authenticated;

-- 3) Staging area for AI drafts. RLS is ON with NO policies: the app can
-- never read drafts; the owner works on them in Studio (service role).
CREATE TABLE public.devotional_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  scripture_reference TEXT NOT NULL,
  scripture_text TEXT NOT NULL,
  reflection TEXT NOT NULL,
  couple_action TEXT NOT NULL,
  category TEXT,
  stage_tags TEXT[] NOT NULL DEFAULT '{dating,engaged,married}',
  focus_tags TEXT[] NOT NULL DEFAULT '{}',
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.devotional_drafts ENABLE ROW LEVEL SECURITY;

-- 4) Promotion: approved drafts move into the pool with the next sequence
-- numbers, then leave staging. Owner runs this in Studio after reviewing:
--   SELECT public.promote_approved_devotionals();
CREATE OR REPLACE FUNCTION public.promote_approved_devotionals()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  promoted INTEGER;
BEGIN
  WITH next_seq AS (
    SELECT COALESCE(MAX(sequence), 0) AS max_seq FROM public.devotionals
  ),
  moved AS (
    INSERT INTO public.devotionals
      (title, scripture_reference, scripture_text, reflection, couple_action,
       category, stage_tags, focus_tags, sequence, publish_date)
    SELECT
      d.title, d.scripture_reference, d.scripture_text, d.reflection,
      d.couple_action, d.category, d.stage_tags, d.focus_tags,
      next_seq.max_seq + ROW_NUMBER() OVER (ORDER BY d.created_at, d.id),
      NULL
    FROM public.devotional_drafts d, next_seq
    WHERE d.approved = true
    RETURNING 1
  )
  SELECT count(*) INTO promoted FROM moved;

  DELETE FROM public.devotional_drafts WHERE approved = true;
  RETURN promoted;
END;
$$;
