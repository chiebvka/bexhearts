-- 00016 — prayer focus + streak activity foundation (owner decisions 2026-07-04:
-- A+D streak combo, Haiku AI prayers, hybrid prayer IA).

-- 1) Daily activity log — one row per user per activity type per day. Feeds
-- the Home streak card week-dots and the "Us" hub heatmap / per-activity
-- streaks. Types: devotional | prayer_session | check_in | journal.
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (
    activity_type IN ('devotional', 'prayer_session', 'check_in', 'journal')
  ),
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (couple_id, user_id, activity_type, activity_date)
);

CREATE INDEX idx_activity_log_couple_date
  ON public.activity_log (couple_id, activity_date DESC);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can read activity"
  ON public.activity_log FOR SELECT
  USING (couple_id = public.get_my_couple_id());

CREATE POLICY "Users log own activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (user_id = auth.uid() AND couple_id = public.get_my_couple_id());

ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;

-- 2) AI prayer cache — composed ONCE per prayer (cost + consistency), stored
-- on the row. The compose-prayer edge function writes these.
ALTER TABLE public.prayers ADD COLUMN ai_prayer TEXT;
ALTER TABLE public.prayers ADD COLUMN ai_verse_ref TEXT;
ALTER TABLE public.prayers ADD COLUMN ai_verse_text TEXT;
ALTER TABLE public.prayers ADD COLUMN ai_generated_at TIMESTAMPTZ;

-- 3) AI consent — prayers are sensitive religious data; composing sends the
-- request text to Anthropic. Stamped when the user accepts the consent sheet.
ALTER TABLE public.profiles ADD COLUMN ai_prayer_consent_at TIMESTAMPTZ;
