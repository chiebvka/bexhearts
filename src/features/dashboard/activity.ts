// Pure activity math for the streak card (A) + Us hub (D). All functions take
// `today` so tests are deterministic; dates are local yyyy-MM-dd strings.
import { format, subDays } from 'date-fns';

export interface ActivityLike {
  activity_type: string;
  activity_date: string;
  user_id?: string;
}

function ymd(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

// Distinct activity count per day (couple-wide): number of unique
// (user, type) combinations — two partners praying counts as 2.
export function dailyCounts(rows: ActivityLike[]): Map<string, number> {
  const seen = new Set<string>();
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = `${row.activity_date}|${row.user_id ?? ''}|${row.activity_type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    counts.set(row.activity_date, (counts.get(row.activity_date) ?? 0) + 1);
  }
  return counts;
}

export interface WeekDot {
  date: string;
  count: number;
  isToday: boolean;
}

// The last 7 days (oldest → today) for the streak card dots.
export function weekDots(rows: ActivityLike[], today = new Date()): WeekDot[] {
  const counts = dailyCounts(rows);
  const dots: WeekDot[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = ymd(subDays(today, i));
    dots.push({ date, count: counts.get(date) ?? 0, isToday: i === 0 });
  }
  return dots;
}

// GitHub-style heatmap: `weeks` columns of 7 day-counts, oldest column first,
// ending on `today` (partial last column padded with -1 = future).
export function buildHeatmapWeeks(
  rows: ActivityLike[],
  weeks: number,
  today = new Date()
): number[][] {
  const counts = dailyCounts(rows);
  const todayDow = today.getDay(); // 0 = Sunday
  const totalDays = (weeks - 1) * 7 + todayDow + 1;

  const columns: number[][] = [];
  let column: number[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const date = ymd(subDays(today, i));
    column.push(counts.get(date) ?? 0);
    if (column.length === 7) {
      columns.push(column);
      column = [];
    }
  }
  if (column.length) {
    while (column.length < 7) column.push(-1);
    columns.push(column);
  }
  return columns;
}

// Consecutive days (ending today, or yesterday if today hasn't happened yet)
// where the couple logged `type` — any partner counts.
export function activityStreak(
  rows: ActivityLike[],
  type: string,
  today = new Date()
): number {
  const days = new Set(
    rows.filter((r) => r.activity_type === type).map((r) => r.activity_date)
  );
  let streak = 0;
  let offset = days.has(ymd(today)) ? 0 : 1;
  while (days.has(ymd(subDays(today, offset)))) {
    streak++;
    offset++;
  }
  return streak;
}

// Which activity types the couple has logged today (for the trackable chips).
export function typesDoneToday(rows: ActivityLike[], today = new Date()): Set<string> {
  const date = ymd(today);
  return new Set(
    rows.filter((r) => r.activity_date === date).map((r) => r.activity_type)
  );
}

// Simple derived badges for the Us hub.
export interface HubBadge {
  key: string;
  label: string;
  earned: boolean;
}

export function buildBadges(params: {
  streakCount: number;
  totalActivities: number;
  prayerSessions: number;
}): HubBadge[] {
  return [
    { key: 'week', label: '7-day streak', earned: params.streakCount >= 7 },
    { key: 'month', label: '30-day streak', earned: params.streakCount >= 30 },
    {
      key: 'first-prayer',
      label: 'First prayer session',
      earned: params.prayerSessions >= 1,
    },
    {
      key: 'hundred',
      label: '100 moments',
      earned: params.totalActivities >= 100,
    },
  ];
}
