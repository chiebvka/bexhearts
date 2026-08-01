-- 00027 — notification infrastructure (G1, owner-locked architecture 2026-07-18)
--
-- WHAT: the in-app notification INBOX + per-user notification preferences.
-- Every notification (partner activity now in G2, scheduled reminders in G3)
-- is written here first — the OS push is a side effect sent by the
-- send-notification edge function; the inbox is the source of truth and
-- powers the Home bell + notifications page (works fully in Expo Go).
--
-- WHO WRITES: ONLY the send-notification edge function (service role — RLS
-- has no INSERT policy on purpose). Recipients can read + mark-read their own.
-- Prefs are PER-USER (each partner controls their own phone), stored on
-- profiles as jsonb; missing keys mean "enabled" (defaults live in app code:
-- src/features/notifications/prefs.ts, mirrored in the edge function).

-- ————————————————— 1) inbox —————————————————
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'partner_activity', 'daily_reminder', 'streak_alert', 'milestone', 'system'
  )),
  title TEXT NOT NULL,
  body TEXT,
  route TEXT,            -- in-app path to open on tap, e.g. '/modal/us-hub'
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient
  ON public.notifications (recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread
  ON public.notifications (recipient_id) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipient can view own notifications"
  ON public.notifications FOR SELECT
  USING (recipient_id = auth.uid());

-- Mark-read only; the recipient can't forge new content via UPDATE because
-- WITH CHECK still pins the row to them and the app only touches read_at.
CREATE POLICY "Recipient can update own notifications"
  ON public.notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Recipient can delete own notifications"
  ON public.notifications FOR DELETE
  USING (recipient_id = auth.uid());

-- Live badge: the bell subscribes to INSERTs on this table.
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ————————————————— 2) per-user preferences —————————————————
-- Shape (all optional; absent = enabled):
--   { "partner_activity": bool, "daily_reminders": bool,
--     "streak_alerts": bool, "milestones": bool,
--     "quiet_hours": { "start": 22, "end": 8 } | null }
-- 'system' category is always delivered (account/security).
ALTER TABLE public.profiles
  ADD COLUMN notification_prefs JSONB NOT NULL DEFAULT '{}'::jsonb;
