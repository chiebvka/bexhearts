-- ============================================================
-- 00034 — E13: DATE IDEAS BY COUNTRY (owner ask 2026-07-26)
-- ============================================================
-- Owner: tag ideas with the places they come from, let couples elsewhere try
-- and rank them, and show a short explainer when the idea needs local context
-- (what a *danfo* is to a reader in Ottawa).
--
-- Design notes:
--   * `country_tags` is an ARRAY of ISO 3166-1 alpha-2 codes. An EMPTY array
--     means "global" — that's the default, so the 362 pre-existing ideas need
--     no backfill and read as universal, which they are.
--   * `context_note` is the sheet copy. Only set where an idea genuinely needs
--     explaining; most don't.
--   * Rankings need NO new rating infrastructure: `couples.country_code`
--     (leaderboard flag, 00017) + `date_idea_ratings` (00018) already exist,
--     so per-country stats are just a country-aware aggregate below.
--
-- Owner applies in Studio. Depends on 00033.

-- 1) Columns ---------------------------------------------------------------
ALTER TABLE public.date_ideas
  ADD COLUMN country_tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN context_note TEXT;

-- Lets "ideas from Nigeria" filter without a full scan as the library grows.
CREATE INDEX idx_date_ideas_country_tags ON public.date_ideas USING GIN (country_tags);

-- 2) Tag the 00033 ideas with where they come from -------------------------
-- Multiple codes where the idea belongs to a whole region, not one country.

-- West Africa
UPDATE public.date_ideas SET country_tags = '{NG,GH}' WHERE title IN (
  'Market Run, One Dish', 'Street-Food Stand Crawl', 'Sunday Best Photo Walk',
  'Carry Someone''s Load', 'Choir Practice Together', 'Sweep a Neighbour''s Compound'
);
UPDATE public.date_ideas
   SET country_tags = '{NG,GH}',
       context_note = 'A danfo (Nigeria) or trotro (Ghana) is a shared minibus that runs a fixed route for a few coins. Riding one to the end of the line is a cheap adventure anywhere shared transport exists — matatu in Kenya, jeepney in the Philippines, colectivo in Latin America.'
 WHERE title = 'Last Stop and Back';
UPDATE public.date_ideas
   SET country_tags = '{NG,GH}',
       context_note = 'Scheduled power cuts are a normal part of the evening across much of West Africa. Rather than wait it out, couples make it the date — candles, no screens, and two voices.'
 WHERE title = 'Light-Out Worship';
UPDATE public.date_ideas
   SET country_tags = '{NG}',
       context_note = 'Harmattan is the dry, dusty, unusually cool season that blows down off the Sahara between roughly December and February — the only time of year a walk feels crisp.'
 WHERE title = 'Harmattan Morning Walk';
UPDATE public.date_ideas
   SET country_tags = '{NG,GH,SN}',
       context_note = 'Which country makes the best jollof rice is West Africa''s most cheerful ongoing argument. Cooking rival versions is a real and very funny date.'
 WHERE title = 'Jollof Debate Cook-Off';

-- East Africa
UPDATE public.date_ideas SET country_tags = '{KE,UG,TZ}' WHERE title IN (
  'Ride to the Edge of Town', 'Sunrise on the Hill', 'Church Garden Workday'
);
UPDATE public.date_ideas
   SET country_tags = '{KE,UG,TZ}',
       context_note = 'Chai here means spiced tea brewed with milk, served at small roadside kiosks alongside chapati flatbread — the cheapest breakfast for two you will find.'
 WHERE title = 'Chai and Chapati Morning';

-- Latin America
UPDATE public.date_ideas SET country_tags = '{MX,CO,BR,AR}' WHERE title IN (
  'Plaza at Dusk', 'One Flower from the Market', 'Rooftop Guitar Worship', 'Walk the Waterfront'
);
UPDATE public.date_ideas
   SET country_tags = '{MX,CO,BR,AR}',
       context_note = 'Sobremesa is the Spanish word for the hour you stay at the table after the meal is finished, talking. It is not dessert and it is not clearing up — it is the point of eating together.'
 WHERE title = 'Sobremesa';
UPDATE public.date_ideas SET country_tags = '{MX,CO,BR}' WHERE title = 'Hymn Exchange';

-- South Asia
UPDATE public.date_ideas SET country_tags = '{IN,PK,BD,LK}' WHERE title IN (
  'Rooftop Sunset Psalm', 'Old Market Wander', 'Kite Flying Afternoon'
);
UPDATE public.date_ideas
   SET country_tags = '{IN,PK,BD,LK}',
       context_note = 'Chai stalls are tiny street tea shops on nearly every corner of South Asia. Two glasses cost almost nothing and nobody will rush you — which makes them the region''s natural place for a long, honest conversation.'
 WHERE title = 'Chai Stall Theology';
UPDATE public.date_ideas
   SET country_tags = '{IN,BD,LK}',
       context_note = 'The monsoon is the months-long rainy season across South Asia. Watching it come down from a doorway with hot tea is one of the most ordinary and most loved pleasures there is.'
 WHERE title = 'Monsoon Doorway Tea';

-- Southeast Asia
UPDATE public.date_ideas SET country_tags = '{PH,ID,VN,TH}' WHERE title IN (
  'Night Market Shared Plate', 'Beach or Riverbank Clean-Up'
);
UPDATE public.date_ideas
   SET country_tags = '{PH}',
       context_note = 'Simbang Gabi is the Filipino tradition of nine early-dawn Masses before Christmas, traditionally followed by breakfast from the stalls outside the church.'
 WHERE title = 'Early Mass, Then Breakfast';
UPDATE public.date_ideas
   SET country_tags = '{PH}',
       context_note = 'A sari-sari store is the small neighbourhood shop found on almost every Filipino street, selling everything in single portions. The late walk there for one shared snack is the tradition.'
 WHERE title = 'Sari-Sari Store Run';

-- Middle East & North Africa
UPDATE public.date_ideas SET country_tags = '{MA,EG,JO}' WHERE title IN (
  'Rooftop Star Psalm', 'Bread from the Corner Bakery'
);
UPDATE public.date_ideas
   SET country_tags = '{MA,EG,JO}',
       context_note = 'Sweet mint tea is poured long and slow across North Africa and the Levant, and refusing a second glass is nearly rude. The pot sets the pace of the conversation.'
 WHERE title = 'Mint Tea and a Long Talk';

-- Colder climates
UPDATE public.date_ideas SET country_tags = '{CA,PL,UA,SE}' WHERE title = 'Winter Walk, Warm Hands';

-- Everything else in 00033 stays '{}' = global, which is accurate: a prayer
-- walk around the block works identically everywhere.

-- 3) Per-country ratings for one idea --------------------------------------
-- SECURITY DEFINER so it can read across couples, but it only ever returns
-- AGGREGATES (never review text or who rated) — same contract as
-- get_date_idea_aggregates() in 00018. Couple-level weighting, so a
-- two-rater couple isn't counted twice.
CREATE OR REPLACE FUNCTION public.get_date_idea_country_stats(p_date_idea_id UUID)
RETURNS TABLE (country_code TEXT, avg_rating NUMERIC, couples_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.country_code,
    round(avg(couple_avg), 1) AS avg_rating,
    count(*)::BIGINT AS couples_count
  FROM (
    SELECT r.couple_id, avg(r.rating) AS couple_avg
    FROM public.date_idea_ratings r
    WHERE r.date_idea_id = p_date_idea_id
    GROUP BY r.couple_id
  ) per_couple
  JOIN public.couples c ON c.id = per_couple.couple_id
  WHERE c.country_code IS NOT NULL
  GROUP BY c.country_code
  ORDER BY couples_count DESC, c.country_code;
$$;

GRANT EXECUTE ON FUNCTION public.get_date_idea_country_stats(UUID) TO authenticated;
