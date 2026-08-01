-- 00026 — usage rate limits (E9, owner-locked 2026-07-18)
--
-- WHY: compose-prayer caches one AI generation per prayer, but nothing capped
-- how many prayers a couple could compose — unlimited prayer creation meant
-- unlimited Anthropic calls. This adds couple-level counters + one generic
-- SECURITY DEFINER gate the edge functions call BEFORE doing paid work.
--
-- LIMITS (owner 2026-07-18, tunable in consume_usage_credit below — edit the
-- CASE and re-run CREATE OR REPLACE in Studio, no app release needed):
--   compose_prayer : 40/day per couple, 150/month per couple
--   upload_presign : 400/day per couple (pure abuse guard for R2 presigns)
--
-- Day boundaries use the COUPLE'S timezone (same rule as the streak engine,
-- 00012/00023) so "try again tomorrow" means the couple's midnight.
--
-- Edge functions DEGRADE OPEN if this migration isn't applied yet (they log
-- and proceed), so applying it is what turns enforcement on.

-- ————————————————— 1) counters table —————————————————
CREATE TABLE public.usage_counters (
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  used_on DATE NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (couple_id, kind, used_on)
);

ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

-- Couple members may SEE their own counters (transparency / future UI);
-- nobody writes directly — only the SECURITY DEFINER function below.
CREATE POLICY "Couple can view own usage counters"
  ON public.usage_counters FOR SELECT
  USING (couple_id = public.get_my_couple_id());

-- ————————————————— 2) the gate —————————————————
CREATE OR REPLACE FUNCTION public.consume_usage_credit(p_kind TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_couple_id UUID;
  v_tz TEXT;
  v_today DATE;
  v_month_start DATE;
  v_day_limit INTEGER;
  v_month_limit INTEGER; -- NULL = no monthly cap
  v_day_used INTEGER;
  v_month_used INTEGER;
BEGIN
  v_couple_id := public.get_my_couple_id();
  IF v_couple_id IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'scope', 'no_couple');
  END IF;

  -- Per-kind limits (owner-tunable here).
  CASE p_kind
    WHEN 'compose_prayer' THEN
      v_day_limit := 40;
      v_month_limit := 150;
    WHEN 'upload_presign' THEN
      v_day_limit := 400;
      v_month_limit := NULL;
    ELSE
      RAISE EXCEPTION 'Unknown usage kind: %', p_kind;
  END CASE;

  SELECT timezone INTO v_tz FROM public.couples WHERE id = v_couple_id;
  v_today := (now() AT TIME ZONE COALESCE(v_tz, 'UTC'))::date;
  v_month_start := date_trunc('month', v_today)::date;

  SELECT COALESCE(used, 0) INTO v_day_used
  FROM public.usage_counters
  WHERE couple_id = v_couple_id AND kind = p_kind AND used_on = v_today;
  v_day_used := COALESCE(v_day_used, 0);

  IF v_day_used >= v_day_limit THEN
    RETURN jsonb_build_object('allowed', false, 'scope', 'day');
  END IF;

  IF v_month_limit IS NOT NULL THEN
    SELECT COALESCE(SUM(used), 0) INTO v_month_used
    FROM public.usage_counters
    WHERE couple_id = v_couple_id AND kind = p_kind AND used_on >= v_month_start;

    IF v_month_used >= v_month_limit THEN
      RETURN jsonb_build_object('allowed', false, 'scope', 'month');
    END IF;
  END IF;

  INSERT INTO public.usage_counters (couple_id, kind, used_on, used)
  VALUES (v_couple_id, p_kind, v_today, 1)
  ON CONFLICT (couple_id, kind, used_on)
  DO UPDATE SET used = public.usage_counters.used + 1;

  RETURN jsonb_build_object('allowed', true, 'remaining_today', v_day_limit - v_day_used - 1);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_usage_credit(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_usage_credit(TEXT) TO authenticated;
