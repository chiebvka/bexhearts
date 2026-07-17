import { format, isToday, isYesterday, startOfWeek, differenceInDays } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'h:mm a');
}

export function getWeekOf(date: Date = new Date()): string {
  return format(startOfWeek(date, { weekStartsOn: 0 }), 'yyyy-MM-dd');
}

// IANA timezone of the current device (e.g. 'America/New_York'); falls back to
// UTC if the platform doesn't expose it. Used to anchor a couple's streak day.
export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function getStreakMessage(count: number): string {
  // The couple streak anchors on BOTH partners finishing the daily devotional
  // (D6) — say so, or a zero next to filled activity dots reads as a bug.
  if (count === 0) return "Both finish today's devotional to light the flame";
  if (count === 1) return '1 day streak - great start!';
  if (count < 7) return `${count} day streak - keep going!`;
  if (count < 30) return `${count} day streak - amazing!`;
  return `${count} day streak - incredible!`;
}

export function daysSince(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return differenceInDays(new Date(), d);
}
