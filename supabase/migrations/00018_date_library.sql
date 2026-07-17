-- 00018 — date library v2: idea metadata + global couple-level ratings
-- (owner approved schema 2026-07-05). Owner runs this in Studio.

-- 1) Idea metadata for filtering and fit (location, accessibility, season,
-- relationship stage). Existing rows get sensible defaults.
ALTER TABLE public.date_ideas ADD COLUMN location_type TEXT NOT NULL DEFAULT 'in_town'
  CHECK (location_type IN ('home', 'outdoor', 'in_town', 'travel'));
ALTER TABLE public.date_ideas ADD COLUMN accessibility_tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.date_ideas ADD COLUMN season TEXT NOT NULL DEFAULT 'any'
  CHECK (season IN ('any', 'spring', 'summer', 'fall', 'winter'));
ALTER TABLE public.date_ideas ADD COLUMN stage_fit TEXT[] NOT NULL DEFAULT '{dating,engaged,married}';

-- 2) Ratings: one row per USER per idea; aggregated at the COUPLE level
-- (locked decision 2026-07-05: a couple contributes ONE rating — the average
-- of whichever partners rated — so two-rater couples aren't double-weighted).
CREATE TABLE public.date_idea_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_idea_id UUID NOT NULL REFERENCES public.date_ideas(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (date_idea_id, user_id)
);

CREATE INDEX idx_date_idea_ratings_idea ON public.date_idea_ratings (date_idea_id);

ALTER TABLE public.date_idea_ratings ENABLE ROW LEVEL SECURITY;

-- Review text stays private to the couple; only the aggregate function below
-- exposes cross-couple numbers.
CREATE POLICY "Couple reads own ratings"
  ON public.date_idea_ratings FOR SELECT
  USING (couple_id = public.get_my_couple_id());

CREATE POLICY "Users write own ratings"
  ON public.date_idea_ratings FOR INSERT
  WITH CHECK (user_id = auth.uid() AND couple_id = public.get_my_couple_id());

CREATE POLICY "Users update own ratings"
  ON public.date_idea_ratings FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND couple_id = public.get_my_couple_id());

-- 3) Global aggregates ("4.6 · 212 couples"), couple-level weighting.
CREATE OR REPLACE FUNCTION public.get_date_idea_aggregates()
RETURNS TABLE (date_idea_id UUID, avg_rating NUMERIC, couples_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    date_idea_id,
    round(avg(couple_avg), 1) AS avg_rating,
    count(*)::BIGINT AS couples_count
  FROM (
    SELECT date_idea_id, couple_id, avg(rating) AS couple_avg
    FROM public.date_idea_ratings
    GROUP BY date_idea_id, couple_id
  ) per_couple
  GROUP BY date_idea_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_date_idea_aggregates() TO authenticated;
