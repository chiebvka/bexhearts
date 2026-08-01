-- ============================================================
-- 00030 — E10 STREAK BREAKDOWN V2 (longest streak + activity stats)
-- ============================================================
-- Fixes the "0-day streak but the heatmap is full" confusion by giving the
-- Us hub real history to show:
--   1) couples.longest_streak (+ started/ended dates + the CURRENT run's
--      start date), maintained by update_couple_streak() and backfilled once
--      from devotional_progress history using the exact 00012 rules
--      (couple-timezone days, everyone-completes anchor, 1 grace day per
--      Sunday-start week, required members flips 1→2 at linked_at).
--   2) get_activity_stats() — all-time per-activity best streak + last-done
--      (the client only fetches 120 days, so "best 14 · last Jul 12" needs SQL).
--   3) get_activity_daily_counts() — all-time daily activity counts for the
--      heatmap's "All" filter (small payload: one row per active day).
-- Owner applies this in Studio. Regen types when convenient (database.ts is
-- hand-updated in the same commit).
-- ============================================================

-- 1) Columns ---------------------------------------------------------------
ALTER TABLE public.couples
  ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN longest_streak_started_on DATE,
  ADD COLUMN longest_streak_ended_on DATE,
  ADD COLUMN streak_started_on DATE;

-- 2) Trigger now maintains the record --------------------------------------
-- Same transition table as 00012; additions are marked NEW.
CREATE OR REPLACE FUNCTION public.update_couple_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_couple   public.couples%ROWTYPE;
  v_today    DATE;
  v_required INTEGER;
  v_done     INTEGER;
  v_gap      INTEGER;
  v_week     DATE;
BEGIN
  SELECT * INTO v_couple FROM public.couples WHERE id = NEW.couple_id;
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- "today" in the couple's timezone
  v_today := (now() AT TIME ZONE v_couple.timezone)::date;

  -- everyone in the couple: 2 if linked, else 1
  v_required := CASE WHEN v_couple.partner_b_id IS NOT NULL THEN 2 ELSE 1 END;

  -- distinct couple members who completed a devotional "today"
  SELECT count(DISTINCT user_id) INTO v_done
  FROM public.devotional_progress
  WHERE couple_id = NEW.couple_id
    AND completed_at IS NOT NULL
    AND (completed_at AT TIME ZONE v_couple.timezone)::date = v_today;

  IF v_done < v_required OR v_couple.streak_last_date = v_today THEN
    RETURN NEW;
  END IF;

  -- weekly grace refill (Sunday-start week)
  v_week := v_today - EXTRACT(DOW FROM v_today)::integer;
  IF v_couple.grace_week IS DISTINCT FROM v_week THEN
    v_couple.grace_days_remaining := 1;
    v_couple.grace_week := v_week;
  END IF;

  IF v_couple.streak_last_date IS NULL THEN
    v_couple.streak_count := 1;
    v_couple.streak_started_on := v_today;                       -- NEW
  ELSE
    v_gap := v_today - v_couple.streak_last_date;
    IF v_gap = 1 THEN
      v_couple.streak_count := v_couple.streak_count + 1;
    ELSIF v_gap >= 2 THEN
      IF (v_gap - 1) = 1 AND v_couple.grace_days_remaining >= 1 THEN
        v_couple.streak_count := v_couple.streak_count + 1;
        v_couple.grace_days_remaining := v_couple.grace_days_remaining - 1;
      ELSE
        v_couple.streak_count := 1;
        v_couple.streak_started_on := v_today;                   -- NEW
      END IF;
    ELSE
      -- gap <= 0 (last_date somehow in the future) — keep at least 1
      v_couple.streak_count := GREATEST(v_couple.streak_count, 1);
    END IF;
  END IF;

  -- NEW: runs that started before this migration have no start stamp;
  -- approximate as an unbroken run (grace days would push it earlier — fine).
  IF v_couple.streak_started_on IS NULL THEN
    v_couple.streak_started_on := v_today - (v_couple.streak_count - 1);
  END IF;

  -- NEW: a new personal best — stamp the record
  IF v_couple.streak_count > COALESCE(v_couple.longest_streak, 0) THEN
    v_couple.longest_streak := v_couple.streak_count;
    v_couple.longest_streak_started_on := v_couple.streak_started_on;
    v_couple.longest_streak_ended_on := v_today;
  END IF;

  UPDATE public.couples
     SET streak_count = v_couple.streak_count,
         streak_last_date = v_today,
         streak_started_on = v_couple.streak_started_on,
         longest_streak = v_couple.longest_streak,
         longest_streak_started_on = v_couple.longest_streak_started_on,
         longest_streak_ended_on = v_couple.longest_streak_ended_on,
         grace_days_remaining = v_couple.grace_days_remaining,
         grace_week = v_couple.grace_week,
         updated_at = now()
   WHERE id = v_couple.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) One-time backfill from devotional_progress history ---------------------
-- Replays the 00012 rules per couple over every qualifying day (a day where
-- all required members completed, in the couple's timezone). Required flips
-- 1→2 on the linked_at day, matching how the trigger behaved live.
DO $$
DECLARE
  c            RECORD;
  d            RECORD;
  v_link_day   DATE;
  v_prev       DATE;
  v_run        INTEGER;
  v_run_start  DATE;
  v_grace      INTEGER;
  v_grace_week DATE;
  v_week       DATE;
  v_gap        INTEGER;
  v_best       INTEGER;
  v_best_start DATE;
  v_best_end   DATE;
  v_required   INTEGER;
BEGIN
  FOR c IN SELECT * FROM public.couples LOOP
    v_link_day := CASE
      WHEN c.partner_b_id IS NOT NULL
        THEN COALESCE((c.linked_at AT TIME ZONE c.timezone)::date, '-infinity'::date)
      ELSE NULL
    END;

    v_prev := NULL;  v_run := 0;  v_run_start := NULL;
    v_grace := 1;    v_grace_week := NULL;
    v_best := 0;     v_best_start := NULL;  v_best_end := NULL;

    FOR d IN
      SELECT (dp.completed_at AT TIME ZONE c.timezone)::date AS day,
             count(DISTINCT dp.user_id) AS done
      FROM public.devotional_progress dp
      WHERE dp.couple_id = c.id
        AND dp.completed_at IS NOT NULL
      GROUP BY 1
      ORDER BY 1
    LOOP
      v_required := CASE
        WHEN v_link_day IS NOT NULL AND d.day >= v_link_day THEN 2
        ELSE 1
      END;
      CONTINUE WHEN d.done < v_required;

      v_week := d.day - EXTRACT(DOW FROM d.day)::integer;
      IF v_grace_week IS DISTINCT FROM v_week THEN
        v_grace := 1;
        v_grace_week := v_week;
      END IF;

      IF v_prev IS NULL THEN
        v_run := 1;  v_run_start := d.day;
      ELSE
        v_gap := d.day - v_prev;
        IF v_gap = 1 THEN
          v_run := v_run + 1;
        ELSIF v_gap = 2 AND v_grace >= 1 THEN
          v_run := v_run + 1;  v_grace := v_grace - 1;
        ELSE
          v_run := 1;  v_run_start := d.day;
        END IF;
      END IF;
      v_prev := d.day;

      IF v_run > v_best THEN
        v_best := v_run;  v_best_start := v_run_start;  v_best_end := d.day;
      END IF;
    END LOOP;

    -- Never report less than the live counter (belt-and-suspenders: the
    -- replay should already reproduce it, but the counter is the truth).
    IF COALESCE(c.streak_count, 0) > v_best THEN
      v_best := c.streak_count;
      v_best_end := c.streak_last_date;
      v_best_start := CASE
        WHEN c.streak_last_date IS NOT NULL
          THEN c.streak_last_date - (c.streak_count - 1)
        ELSE NULL
      END;
    END IF;

    UPDATE public.couples
       SET longest_streak = v_best,
           longest_streak_started_on = v_best_start,
           longest_streak_ended_on = v_best_end,
           -- only stamp the current run's start when the replay's final run
           -- is the live one (its last day = the live streak_last_date)
           streak_started_on = CASE
             WHEN c.streak_last_date IS NOT NULL AND v_prev = c.streak_last_date
               THEN v_run_start
             ELSE streak_started_on
           END
     WHERE id = c.id;
  END LOOP;
END $$;

-- 4) Per-activity all-time stats (Us hub "best 14 · last Jul 12") -----------
-- SECURITY INVOKER on purpose: the activity_log RLS SELECT policy scopes it,
-- and get_my_couple_id() keeps the index hot.
CREATE OR REPLACE FUNCTION public.get_activity_stats()
RETURNS TABLE (activity_type TEXT, best_streak INTEGER, last_done DATE)
LANGUAGE sql
STABLE
AS $$
  WITH days AS (
    SELECT DISTINCT a.activity_type, a.activity_date
    FROM public.activity_log a
    WHERE a.couple_id = public.get_my_couple_id()
  ),
  islands AS (
    SELECT activity_type, activity_date,
           activity_date
             - (ROW_NUMBER() OVER (PARTITION BY activity_type
                                   ORDER BY activity_date))::integer AS grp
    FROM days
  ),
  runs AS (
    SELECT activity_type, count(*) AS len
    FROM islands
    GROUP BY activity_type, grp
  )
  SELECT r.activity_type,
         max(r.len)::integer AS best_streak,
         (SELECT max(d.activity_date) FROM days d
           WHERE d.activity_type = r.activity_type) AS last_done
  FROM runs r
  GROUP BY r.activity_type;
$$;

GRANT EXECUTE ON FUNCTION public.get_activity_stats() TO authenticated;

-- 5) All-time daily counts for the heatmap "All" filter ----------------------
-- activity_log is unique per (couple, user, type, date), so count(*) per day
-- is exactly the client's dailyCounts() math. One row per active day.
CREATE OR REPLACE FUNCTION public.get_activity_daily_counts()
RETURNS TABLE (activity_date DATE, activity_count INTEGER)
LANGUAGE sql
STABLE
AS $$
  SELECT a.activity_date, count(*)::integer AS activity_count
  FROM public.activity_log a
  WHERE a.couple_id = public.get_my_couple_id()
  GROUP BY a.activity_date
  ORDER BY a.activity_date;
$$;

GRANT EXECUTE ON FUNCTION public.get_activity_daily_counts() TO authenticated;
