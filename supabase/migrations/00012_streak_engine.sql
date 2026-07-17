-- ============================================================
-- STREAK ENGINE (D6 · fixes Bug #4)
-- ============================================================
-- couples.streak_count / streak_last_date existed and were displayed but NOTHING
-- ever wrote them. This adds the engine, server-side (atomic + un-gameable).
--
-- DECISIONS (owner, 2026-06-29):
--   * Anchor  = completing the DAILY DEVOTIONAL is the day's streak action.
--   * Who     = EVERYONE in the couple must complete it that day: 1 person while
--               solo, 2 once linked. A solo streak simply "levels up" into the
--               couple streak on linking (same couple row, count carries over).
--   * Grace   = ONE free missed day per week ("grace covers you"); a single
--               missed day with grace available continues the streak, otherwise
--               it resets to 1. Grace refills at the start of each week.
--   * Day     = computed in the COUPLE'S timezone (avoids UTC off-by-one resets).
--
-- Transition when everyone has completed today (v_today):
--   last = today      -> already counted, noop
--   last = today - 1  -> +1 (consecutive)
--   gap  >= 2, missed=1, grace>=1 -> +1 and consume grace
--   gap  >= 2 otherwise           -> reset to 1
--   last is null      -> first day, = 1
-- Week is Sunday-start to match the app's getWeekOf().
-- ============================================================

ALTER TABLE public.couples
  ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN grace_days_remaining INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN grace_week DATE;

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

  -- not everyone yet -> leave the streak untouched (the "waiting on partner"
  -- state is surfaced in the app), and already-counted-today -> noop
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
      END IF;
    ELSE
      -- gap <= 0 (last_date somehow in the future) — keep at least 1
      v_couple.streak_count := GREATEST(v_couple.streak_count, 1);
    END IF;
  END IF;

  UPDATE public.couples
     SET streak_count = v_couple.streak_count,
         streak_last_date = v_today,
         grace_days_remaining = v_couple.grace_days_remaining,
         grace_week = v_couple.grace_week,
         updated_at = now()
   WHERE id = v_couple.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_couple_streak
  AFTER INSERT OR UPDATE OF completed_at ON public.devotional_progress
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION public.update_couple_streak();
