// G3 — the scheduled-notification sweep planner (canonical + tested here;
// supabase/functions/notification-sweep carries a mirrored copy, same pattern
// as prefs.ts / the streak engine). pg_cron pings the sweep function hourly;
// for each couple it computes the LOCAL hour (couples.timezone — the same
// day-boundary rule as streaks) and this planner decides what, if anything,
// each member should receive. Copy rule: names/counts only, never content
// (milestone titles are the couple's own celebratory data — allowed by
// design; prayer/journal/check-in text never appears).

import type { NotificationCategory } from './prefs';

// Local-hour send windows (owner architecture 2026-07-18).
export const SWEEP_HOURS = {
  devotionalReminder: 9,
  graceNotice: 9,
  milestone: 10,
  prayerDigest: 12,
  checkInReminder: 18, // Sundays only
  streakAtRisk: 19,
} as const;

export const CHECK_IN_DOW = 0; // Sunday
export const STREAK_RISK_MIN = 3; // no nagging over 1–2 day streaks

export interface SweepMember {
  id: string;
  devotionalDoneToday: boolean;
  checkInThisWeek: boolean;
}

export interface SweepCoupleInput {
  coupleId: string;
  localHour: number; // 0-23 in the couple's timezone
  localDow: number; // 0 = Sunday
  localDate: string; // yyyy-mm-dd in the couple's timezone
  streakCount: number;
  members: SweepMember[];
  activeSharedPrayers: number;
  milestones: { title: string; icon: string | null; event_date: string }[];
  graceUsedRecently: boolean;
}

export interface SweepAction {
  recipientId: string;
  category: NotificationCategory;
  title: string;
  body: string | null;
  route: string;
}

// Days from localDate to eventDate (both yyyy-mm-dd); positive = future.
export function daysUntil(eventDate: string, localDate: string): number {
  const event = Date.parse(`${eventDate}T00:00:00Z`);
  const today = Date.parse(`${localDate}T00:00:00Z`);
  if (Number.isNaN(event) || Number.isNaN(today)) return NaN;
  return Math.round((event - today) / 86_400_000);
}

export function planCoupleSweep(input: SweepCoupleInput): SweepAction[] {
  const actions: SweepAction[] = [];
  const {
    localHour,
    localDow,
    localDate,
    streakCount,
    members,
    activeSharedPrayers,
    milestones,
    graceUsedRecently,
  } = input;

  // 9am — today's devotional is ready (only for members who haven't done it).
  if (localHour === SWEEP_HOURS.devotionalReminder) {
    for (const m of members) {
      if (!m.devotionalDoneToday) {
        actions.push({
          recipientId: m.id,
          category: 'daily_reminder',
          title: "Today's devotional is ready 🕊️",
          body: 'A few quiet minutes together — light the flame.',
          route: '/(tabs)/devotional',
        });
      }
    }
    // Grace notice rides the same hour: both members hear grace held the flame.
    if (graceUsedRecently) {
      for (const m of members) {
        actions.push({
          recipientId: m.id,
          category: 'streak_alert',
          title: '🕊️ Grace covered you yesterday',
          body: 'One missed day is held — the flame is still lit.',
          route: '/modal/us-hub',
        });
      }
    }
  }

  // 10am — milestone countdowns (3 days out + day of), to both members.
  if (localHour === SWEEP_HOURS.milestone) {
    for (const milestone of milestones) {
      const days = daysUntil(milestone.event_date, localDate);
      if (days !== 0 && days !== 3) continue;
      const icon = milestone.icon || '🎉';
      const title =
        days === 0
          ? `${icon} ${milestone.title} is today 🎉`
          : `${icon} ${milestone.title} is in 3 days`;
      for (const m of members) {
        actions.push({
          recipientId: m.id,
          category: 'milestone',
          title,
          body: null,
          route: '/(tabs)/journal',
        });
      }
    }
  }

  // 12pm — the one daily prayer digest (LOCKED 2026-06-29: never per-prayer).
  if (localHour === SWEEP_HOURS.prayerDigest && activeSharedPrayers > 0) {
    const n = activeSharedPrayers;
    for (const m of members) {
      actions.push({
        recipientId: m.id,
        category: 'daily_reminder',
        title: 'A moment for prayer 🙏',
        body: `${n} shared request${n === 1 ? '' : 's'} ${n === 1 ? 'is' : 'are'} waiting for you two.`,
        route: '/(tabs)/connect/prayers',
      });
    }
  }

  // Sunday 6pm — weekly check-in reminder for members who haven't submitted.
  if (localHour === SWEEP_HOURS.checkInReminder && localDow === CHECK_IN_DOW) {
    for (const m of members) {
      if (!m.checkInThisWeek) {
        actions.push({
          recipientId: m.id,
          category: 'daily_reminder',
          title: 'Your weekly check-in is open 💬',
          body: "Five minutes tonight — see each other's week.",
          route: '/(tabs)/connect',
        });
      }
    }
  }

  // 7pm — streak-at-risk: only real streaks, only members still missing today.
  if (localHour === SWEEP_HOURS.streakAtRisk && streakCount >= STREAK_RISK_MIN) {
    for (const m of members) {
      if (!m.devotionalDoneToday) {
        actions.push({
          recipientId: m.id,
          category: 'streak_alert',
          title: `🔥 Your ${streakCount}-day streak is on the line`,
          body: "Finish today's devotional to keep the flame.",
          route: '/(tabs)/devotional',
        });
      }
    }
  }

  return actions;
}
