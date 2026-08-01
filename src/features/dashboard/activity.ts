// Pure activity math for the streak card (A) + Us hub (D). All functions take
// `today` so tests are deterministic; dates are local yyyy-MM-dd strings.
import { format, parseISO, subDays, differenceInCalendarDays } from 'date-fns';

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

// ---------------------------------------------------------------------------
// E10 — heatmap v2 (7d / 30d / All filters + tappable cells)

export interface HeatCell {
  date: string; // yyyy-MM-dd
  count: number;
  future: boolean;
}

// Server-side daily counts (get_activity_daily_counts) → the same Map shape
// dailyCounts() produces from raw rows, so the grid builders take either.
export function countsFromDaily(
  rows: { activity_date: string; activity_count: number }[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.activity_date, row.activity_count);
  return counts;
}

export type HeatmapRange = '7d' | '30d' | 'all';

// Sunday-aligned week columns (oldest first) covering at least `days` days and
// ending on `today`, with dates attached so cells are tappable. Future cells
// in the final partial week are flagged instead of using the -1 sentinel.
export function buildHeatmapCells(
  counts: Map<string, number>,
  days: number,
  today = new Date()
): HeatCell[][] {
  const todayDow = today.getDay(); // 0 = Sunday
  const weeks = Math.max(1, Math.ceil((days - todayDow - 1) / 7) + 1);
  const totalDays = (weeks - 1) * 7 + todayDow + 1;

  const columns: HeatCell[][] = [];
  let column: HeatCell[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const date = ymd(subDays(today, i));
    column.push({ date, count: counts.get(date) ?? 0, future: false });
    if (column.length === 7) {
      columns.push(column);
      column = [];
    }
  }
  if (column.length) {
    let ahead = 1;
    while (column.length < 7) {
      column.push({ date: ymd(subDays(today, -ahead)), count: 0, future: true });
      ahead++;
    }
    columns.push(column);
  }
  return columns;
}

// A flat row of the last `days` days (oldest → today) — the 7d filter renders
// one large tappable row instead of a sparse Sunday-aligned grid.
export function lastDaysCells(
  counts: Map<string, number>,
  days: number,
  today = new Date()
): HeatCell[] {
  const cells: HeatCell[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = ymd(subDays(today, i));
    cells.push({ date, count: counts.get(date) ?? 0, future: false });
  }
  return cells;
}

// How many days a range spans. 'all' stretches back to the earliest active
// day in `counts` (min 30 so a brand-new couple still sees a real grid).
export function rangeDays(
  range: HeatmapRange,
  counts: Map<string, number>,
  today = new Date()
): number {
  if (range === '7d') return 7;
  if (range === '30d') return 30;
  let earliest: string | null = null;
  for (const date of counts.keys()) {
    if (earliest === null || date < earliest) earliest = date;
  }
  if (!earliest) return 30;
  return Math.max(30, differenceInCalendarDays(today, parseISO(earliest)) + 1);
}

// "Jul 12 · 3 activities" for the tapped cell.
export function heatCellLabel(cell: HeatCell): string {
  const day = format(parseISO(cell.date), 'MMM d');
  if (cell.count === 0) return `${day} · no activity`;
  return `${day} · ${cell.count} ${cell.count === 1 ? 'activity' : 'activities'}`;
}

// ---------------------------------------------------------------------------
// E10 — per-activity all-time stats + hero record line

export interface ActivityStatLike {
  activity_type: string;
  best_streak: number;
  last_done: string; // yyyy-MM-dd
}

// "best 14 · last Jul 12" under each per-activity streak row. Null when the
// couple has never logged that activity (row shows the current streak alone).
export function bestLastLabel(
  stats: ActivityStatLike[] | undefined,
  type: string,
  today = new Date()
): string | null {
  const stat = stats?.find((s) => s.activity_type === type);
  if (!stat || stat.best_streak <= 0) return null;
  const last = parseISO(stat.last_done);
  const lastLabel =
    differenceInCalendarDays(today, last) === 0 ? 'today' : format(last, 'MMM d');
  return `best ${stat.best_streak} · last ${lastLabel}`;
}

// How long this couple has been in the app, for the Us-hub hero caption.
//
// First-run pass (2026-07-27): the raw day count produced two things App
// Review would have seen on a fresh demo account — "0 days in the app
// together" on the day they signed up, and "1 days" the morning after. Day
// zero is the one moment this line should feel warm rather than arithmetic.
export function togetherLabel(days: number | null | undefined): string | null {
  if (days === null || days === undefined || days < 0) return null;
  if (days === 0) return 'together since today';
  if (days === 1) return '1 day in the app together';
  return `${days} days in the app together`;
}

// Hero record line: "Best streak: 12 days · Jun 3 – Jun 14". Shown once the
// couple has any history, so a broken (0-day) streak next to a full heatmap
// reads as "the record survives" instead of a contradiction.
export function bestStreakLine(params: {
  longest: number | null | undefined;
  startedOn?: string | null;
  endedOn?: string | null;
}): string | null {
  const { longest, startedOn, endedOn } = params;
  if (!longest || longest <= 0) return null;
  let line = `Best streak: ${longest} ${longest === 1 ? 'day' : 'days'}`;
  if (startedOn && endedOn) {
    const start = format(parseISO(startedOn), 'MMM d');
    const end = format(parseISO(endedOn), 'MMM d');
    line += longest === 1 ? ` · ${end}` : ` · ${start} – ${end}`;
  }
  return line;
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
