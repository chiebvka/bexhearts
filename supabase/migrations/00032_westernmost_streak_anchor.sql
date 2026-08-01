-- ============================================================
-- 00032 — E12: STREAK DAY ANCHOR = THE WESTERNMOST PARTNER
-- ============================================================
-- `couples.timezone` decides when the streak day flips, which devotional is
-- "today" (00023), and when the notification sweep fires. Until now it was
-- whoever CREATED the couple — arbitrary, and harsh for couples in different
-- timezones: an eastern anchor can end the western partner's day at 6pm their
-- local time, so they'd lose a streak they had every intention of keeping.
--
-- Owner decision 2026-07-26: anchor to the WESTERNMOST partner (the lowest
-- UTC offset). Their midnight lands last in absolute time, so BOTH partners
-- always get their full local day. It needs no billing data (deliberately
-- rejected anchoring to the subscription payer — same couple, same effort,
-- different outcome depending on whose card is on file) and it can only ever
-- be more forgiving than the old rule.
--
-- Owner applies in Studio.

-- 1) Offset helper — seconds east of UTC for an IANA zone, right now.
-- STABLE, not IMMUTABLE: DST means the answer changes through the year.
CREATE OR REPLACE FUNCTION public.tz_offset_seconds(p_timezone TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN EXTRACT(
    EPOCH FROM ((now() AT TIME ZONE p_timezone) - (now() AT TIME ZONE 'UTC'))
  )::integer;
EXCEPTION WHEN OTHERS THEN
  -- Unknown/invalid zone name — treat as UTC so a bad value can never break
  -- the streak engine.
  RETURN 0;
END;
$$;

-- 2) Recompute one couple's anchor from its members' profile timezones.
-- Falls back to the existing value when nobody has a timezone stamped yet.
CREATE OR REPLACE FUNCTION public.recompute_couple_timezone(p_couple_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_timezone TEXT;
BEGIN
  SELECT p.timezone INTO v_timezone
  FROM public.profiles p
  JOIN public.couples c ON c.id = p_couple_id
  WHERE p.id IN (c.partner_a_id, c.partner_b_id)
    AND p.timezone IS NOT NULL
  ORDER BY public.tz_offset_seconds(p.timezone) ASC  -- westernmost wins
  LIMIT 1;

  IF v_timezone IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.couples
     SET timezone = v_timezone,
         updated_at = now()
   WHERE id = p_couple_id
     AND timezone IS DISTINCT FROM v_timezone;
END;
$$;

-- 3) Keep it current: the app stamps profiles.timezone on every app start and
-- whenever the device zone drifts (travel, moves, DST), so re-anchor then.
CREATE OR REPLACE FUNCTION public.on_profile_timezone_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.couple_id IS NOT NULL THEN
    PERFORM public.recompute_couple_timezone(NEW.couple_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_profile_timezone_changed
  AFTER INSERT OR UPDATE OF timezone, couple_id ON public.profiles
  FOR EACH ROW
  WHEN (NEW.timezone IS NOT NULL AND NEW.couple_id IS NOT NULL)
  EXECUTE FUNCTION public.on_profile_timezone_changed();

-- 4) One-time backfill for existing couples.
-- NOTE: this can shift a couple's day boundary by a few hours. It cannot
-- retroactively rewrite history (streak_last_date is a DATE that has already
-- been written), and the 00012 weekly grace day absorbs a single boundary
-- straddle, so no streak is lost by applying this.
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN SELECT id FROM public.couples LOOP
    PERFORM public.recompute_couple_timezone(c.id);
  END LOOP;
END $$;
