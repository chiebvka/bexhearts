-- 00017 — points ledger + global leaderboard (owner decisions 2026-07-05).
-- Points start accruing NOW so reward cutoffs can be studied later; the
-- rewards program itself is undecided (copy says "exciting rewards ahead").
-- Design goals: tamper-resistant (only a SECURITY DEFINER trigger writes the
-- ledger; activity_log's daily uniqueness caps farming) and privacy-safe
-- (leaderboard names are masked server-side unless the couple opts in).

-- 1) Widen activity types for the dates flow (completion + rating).
ALTER TABLE public.activity_log DROP CONSTRAINT activity_log_activity_type_check;
ALTER TABLE public.activity_log ADD CONSTRAINT activity_log_activity_type_check CHECK (
  activity_type IN (
    'devotional', 'prayer_session', 'check_in', 'journal',
    'date_completed', 'date_rated'
  )
);

-- 2) The ledger. No client INSERT/UPDATE/DELETE policies — only the trigger
-- below (SECURITY DEFINER) writes rows.
CREATE TABLE public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_points_ledger_couple ON public.points_ledger (couple_id);

ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can read own points"
  ON public.points_ledger FOR SELECT
  USING (couple_id = public.get_my_couple_id());

-- 3) Point values (tune here; one credit per user/type/day via activity_log).
CREATE OR REPLACE FUNCTION public.award_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.points_ledger (couple_id, user_id, points, reason)
  VALUES (
    NEW.couple_id,
    NEW.user_id,
    CASE NEW.activity_type
      WHEN 'devotional'     THEN 10
      WHEN 'prayer_session' THEN 15
      WHEN 'check_in'       THEN 20
      WHEN 'journal'        THEN 10
      WHEN 'date_completed' THEN 25
      WHEN 'date_rated'     THEN 5
      ELSE 0
    END,
    NEW.activity_type
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_award_points
  AFTER INSERT ON public.activity_log
  FOR EACH ROW EXECUTE FUNCTION public.award_points();

-- 4) Leaderboard identity: opt-in display, a human-friendly couple number
-- (NOT a uuid), and the store/device country for the flag.
CREATE SEQUENCE public.couple_number_seq START 1000;
ALTER TABLE public.couples ADD COLUMN leaderboard_opt_in BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.couples ADD COLUMN leaderboard_number INTEGER NOT NULL DEFAULT nextval('public.couple_number_seq');
ALTER TABLE public.couples ADD COLUMN country_code TEXT;

-- 5) Masked name: "Tony" → "t**y" (opted-out couples stay pseudonymous).
CREATE OR REPLACE FUNCTION public.mask_name(name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN name IS NULL OR length(trim(name)) < 2 THEN 'someone'
    ELSE lower(left(trim(name), 1)) || repeat('*', greatest(length(trim(name)) - 2, 1)) || lower(right(trim(name), 1))
  END;
$$;

-- 6) The global leaderboard, masked server-side. SECURITY DEFINER because it
-- reads across couples; it exposes ONLY label/number/country/points.
CREATE OR REPLACE FUNCTION public.get_leaderboard(entry_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  rank BIGINT,
  label TEXT,
  couple_number INTEGER,
  country_code TEXT,
  points BIGINT,
  is_you BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH totals AS (
    SELECT couple_id, SUM(points)::BIGINT AS points
    FROM public.points_ledger
    GROUP BY couple_id
  ),
  labeled AS (
    SELECT
      c.id,
      c.leaderboard_number,
      c.country_code,
      t.points,
      (
        SELECT string_agg(
          CASE WHEN c.leaderboard_opt_in
            THEN split_part(p.full_name, ' ', 1)
            ELSE public.mask_name(split_part(p.full_name, ' ', 1))
          END,
          ' & ' ORDER BY p.created_at
        )
        FROM public.profiles p
        WHERE p.couple_id = c.id
      ) AS label
    FROM public.couples c
    JOIN totals t ON t.couple_id = c.id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY points DESC, leaderboard_number ASC) AS rank,
    label,
    leaderboard_number AS couple_number,
    country_code,
    points,
    id = public.get_my_couple_id() AS is_you
  FROM labeled
  ORDER BY points DESC, leaderboard_number ASC
  LIMIT entry_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(INTEGER) TO authenticated;
