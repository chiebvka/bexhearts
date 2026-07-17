-- 00025 — couple_events audit trail + missing timestamps + check-in sharing
-- (owner locked D1–D7, 2026-07-10; this is the D3/D4/D5 schema half).
--
-- 1) couple_events: the generic "what happened, who, when" trail — feeds the
--    points/streak transparency screens, future year-end & anniversary recap
--    cards (owner: NO weekly recap — gather only), and analytics. Written by
--    triggers (SECURITY DEFINER) and best-effort by app mutations.
-- 2) Missing stamps: prayers.archived_at; boundaries.deactivated_at/_by (who
--    retired/resolved it and when — the attribution ask).
-- 3) Check-in sharing flags: gratitude is always revealed once both partners
--    submit; growth note + prayer request stay private unless the author
--    flips the per-field share toggle.

-- ————————————————— 1) couple_events —————————————————
CREATE TABLE public.couple_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  -- who caused it; NULL for system/trigger events with no single actor
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  -- the row this event refers to (prayer id, boundary id, …), if any
  ref_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_couple_events_couple_time
  ON public.couple_events (couple_id, created_at DESC);

ALTER TABLE public.couple_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can read own events"
  ON public.couple_events FOR SELECT
  USING (couple_id = public.get_my_couple_id());

CREATE POLICY "Couple members can log events"
  ON public.couple_events FOR INSERT
  WITH CHECK (couple_id = public.get_my_couple_id() AND user_id = auth.uid());

-- ————————————————— 2) missing timestamps —————————————————
ALTER TABLE public.prayers ADD COLUMN archived_at TIMESTAMPTZ;

ALTER TABLE public.boundaries
  ADD COLUMN deactivated_at TIMESTAMPTZ,
  ADD COLUMN deactivated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ————————————————— 3) check-in share flags —————————————————
ALTER TABLE public.check_ins
  ADD COLUMN share_growth_note BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN share_prayer_request BOOLEAN NOT NULL DEFAULT false;

-- ————————————————— 4) streak trigger now logs its decisions —————————————————
-- Same rules as 00012 (anchor = daily devotional, everyone-in-couple, weekly
-- grace, couple-timezone day) — plus grace_used / streak_reset events so
-- "grace covered you Tuesday" and reset history exist from day one.
CREATE OR REPLACE FUNCTION public.update_couple_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_couple   public.couples%ROWTYPE;
  v_today    DATE;
  v_required INTEGER;
  v_done     INTEGER;
  v_gap      INTEGER;
  v_week     DATE;
  v_prev     INTEGER;
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

  v_prev := v_couple.streak_count;

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
        INSERT INTO public.couple_events (couple_id, event_type, metadata)
        VALUES (NEW.couple_id, 'grace_used',
                jsonb_build_object('missed_day', v_couple.streak_last_date + 1,
                                   'streak', v_couple.streak_count));
      ELSE
        v_couple.streak_count := 1;
        INSERT INTO public.couple_events (couple_id, event_type, metadata)
        VALUES (NEW.couple_id, 'streak_reset',
                jsonb_build_object('previous_streak', v_prev,
                                   'gap_days', v_gap));
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

-- ————————————————— 5) boundaries realtime —————————————————
ALTER PUBLICATION supabase_realtime ADD TABLE public.boundaries;
