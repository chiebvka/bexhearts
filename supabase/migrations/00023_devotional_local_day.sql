-- 00023 — devotional day boundary follows the couple's timezone
-- (owner approved 2026-07-10).
--
-- Why: 00020's get_today_devotional() used the server's UTC CURRENT_DATE, so
-- the devotional flipped at UTC midnight (~4–5pm on the US west coast) while
-- the streak engine (00012) counts "today" in the couple's timezone. An
-- evening-devotional couple could complete what the streak called "today" but
-- the rotation called "tomorrow's" content. Now both use the couple's local
-- date. Still calendar-communal: every couple in the same timezone shares the
-- same devotional, and dated rows still override the rotation on their day.
--
-- Also fixes a latent 00020 bug: the rotation OFFSET applied to the UNION as a
-- whole, so on any day with a publish_date override AND a nonzero rotation
-- offset the override row itself was skipped and the function returned no
-- rows. The branches are now separated.

CREATE OR REPLACE FUNCTION public.get_today_devotional()
RETURNS SETOF public.devotionals
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tz TEXT;
  local_date DATE;
BEGIN
  SELECT c.timezone INTO tz
  FROM public.couples c
  WHERE c.id = public.get_my_couple_id();

  BEGIN
    local_date := (now() AT TIME ZONE COALESCE(tz, 'UTC'))::date;
  EXCEPTION WHEN OTHERS THEN
    -- Unknown/invalid timezone string on the couple → fall back to UTC day.
    local_date := CURRENT_DATE;
  END;

  -- 1) A dated row is a seasonal override (Advent, Lent…) and wins outright.
  RETURN QUERY
  SELECT * FROM public.devotionals
  WHERE publish_date = local_date
  LIMIT 1;
  IF FOUND THEN
    RETURN;
  END IF;

  -- 2) Otherwise rotate the evergreen pool by days since the fixed epoch,
  -- so the rotation is deterministic and never runs dry.
  RETURN QUERY
  SELECT * FROM public.devotionals
  WHERE sequence IS NOT NULL
  ORDER BY sequence
  OFFSET COALESCE(
    (local_date - DATE '2026-01-01') % NULLIF(
      (SELECT count(*) FROM public.devotionals WHERE sequence IS NOT NULL), 0
    ),
    0
  )
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_today_devotional() TO authenticated;
