// Notification preference logic (G1, owner-locked 2026-07-18). Canonical +
// tested here; the send-notification edge function carries a mirrored copy
// (same pattern as the streak engine in dashboard/streak.ts vs 00012).
//
// Rules:
// - Prefs are PER-USER (each partner controls their own phone).
// - A missing key means ENABLED — notifications default on.
// - 'system' (account/security) is always delivered, prefs can't mute it.
// - Quiet hours suppress the OS PUSH only; the inbox row is always written
//   so nothing is ever lost, just not buzzed about.

export type NotificationCategory =
  | 'partner_activity'
  | 'daily_reminder'
  | 'streak_alert'
  | 'milestone'
  | 'system';

export interface QuietHours {
  start: number; // hour 0-23, inclusive
  end: number; // hour 0-23, exclusive
}

export interface NotificationPrefs {
  partner_activity?: boolean;
  daily_reminders?: boolean;
  streak_alerts?: boolean;
  milestones?: boolean;
  quiet_hours?: QuietHours | null;
}

const CATEGORY_PREF_KEY: Record<
  Exclude<NotificationCategory, 'system'>,
  keyof NotificationPrefs
> = {
  partner_activity: 'partner_activity',
  daily_reminder: 'daily_reminders',
  streak_alert: 'streak_alerts',
  milestone: 'milestones',
};

export function isCategoryEnabled(
  prefs: NotificationPrefs | null | undefined,
  category: NotificationCategory
): boolean {
  if (category === 'system') return true;
  const key = CATEGORY_PREF_KEY[category];
  const value = prefs?.[key];
  return value !== false; // absent/undefined/null → enabled
}

// True when `hour` (the recipient's LOCAL hour) falls inside quiet hours.
// Handles overnight windows (22 → 8) and same-day windows (13 → 15).
// start === end means "no window" rather than "all day".
export function isInQuietHours(
  prefs: NotificationPrefs | null | undefined,
  hour: number
): boolean {
  const window = prefs?.quiet_hours;
  if (!window) return false;
  const { start, end } = window;
  if (start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end; // overnight wrap
}

// G2·M2 — push debounce: max one OS PUSH per category per window; the inbox
// row is always written. 0 = never debounced.
export const PUSH_DEBOUNCE_HOURS: Record<NotificationCategory, number> = {
  partner_activity: 2,
  daily_reminder: 0,
  streak_alert: 0,
  milestone: 0,
  system: 0,
};

export function shouldDebouncePush(
  category: NotificationCategory,
  lastPushedAtIso: string | null | undefined,
  now: Date = new Date()
): boolean {
  const hours = PUSH_DEBOUNCE_HOURS[category];
  if (!hours || !lastPushedAtIso) return false;
  const last = new Date(lastPushedAtIso).getTime();
  if (Number.isNaN(last)) return false;
  return now.getTime() - last < hours * 60 * 60 * 1000;
}

// G4 — Settings helpers. Immutable merges so the optimistic UI and the
// jsonb write share one code path. Quiet hours v1 = one sensible fixed
// window (10pm–8am) behind a single switch; custom times can come later.
export const DEFAULT_QUIET_HOURS: QuietHours = { start: 22, end: 8 };

export type TogglablePrefKey = Exclude<keyof NotificationPrefs, 'quiet_hours'>;

export function setCategoryPref(
  prefs: NotificationPrefs | null | undefined,
  key: TogglablePrefKey,
  enabled: boolean
): NotificationPrefs {
  return { ...(prefs ?? {}), [key]: enabled };
}

export function setQuietHoursEnabled(
  prefs: NotificationPrefs | null | undefined,
  enabled: boolean
): NotificationPrefs {
  return { ...(prefs ?? {}), quiet_hours: enabled ? DEFAULT_QUIET_HOURS : null };
}

// The Settings rows (order = display order).
export const PREF_ROWS: { key: TogglablePrefKey; label: string; hint: string }[] = [
  { key: 'partner_activity', label: 'Partner activity', hint: 'Prayers, moments, reactions, dates' },
  { key: 'daily_reminders', label: 'Daily reminders', hint: 'Devotional, prayer digest, check-in' },
  { key: 'streak_alerts', label: 'Streak alerts', hint: 'At-risk warnings and grace notices' },
  { key: 'milestones', label: 'Milestones', hint: 'Anniversary and countdown reminders' },
];

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  partner_activity: 'Partner activity',
  daily_reminder: 'Daily reminders',
  streak_alert: 'Streak alerts',
  milestone: 'Milestones',
  system: 'Account',
};
