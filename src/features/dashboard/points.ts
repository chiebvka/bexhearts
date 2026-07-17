// D2 (owner locked 2026-07-10) — points-history presentation logic.
// The ledger is the audit trail (one row per award, written only by the DB
// trigger); this file turns it into the transparency screen: what earned
// what, who did it, and when. Couple-private — other couples only ever see
// totals via the leaderboard RPC.

export interface PointsLedgerEntry {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  created_at: string | null;
}

// Friendly labels for the trigger's reason values (00017).
export const POINT_REASON_LABELS: Record<string, string> = {
  devotional: 'Devotional together',
  prayer_session: 'Prayer session',
  check_in: 'Weekly check-in',
  journal: 'Journal moment',
  date_completed: 'Date completed',
  date_rated: 'Date rated',
};

export function pointReasonLabel(reason: string): string {
  return POINT_REASON_LABELS[reason] ?? reason.replaceAll('_', ' ');
}

// Sunday-start week, matching the streak engine's grace week (00012).
export function weekStart(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export interface PointsHistorySections {
  thisWeek: PointsLedgerEntry[];
  earlier: PointsLedgerEntry[];
  weekTotal: number;
  allTotal: number;
}

// Splits a newest-first ledger into This week / Earlier with totals.
export function partitionPointsHistory(
  rows: PointsLedgerEntry[] | null | undefined,
  now: Date = new Date()
): PointsHistorySections {
  const start = weekStart(now).getTime();
  const thisWeek: PointsLedgerEntry[] = [];
  const earlier: PointsLedgerEntry[] = [];
  let weekTotal = 0;
  let allTotal = 0;

  for (const row of rows ?? []) {
    allTotal += row.points;
    const ts = row.created_at ? new Date(row.created_at).getTime() : 0;
    if (ts >= start) {
      thisWeek.push(row);
      weekTotal += row.points;
    } else {
      earlier.push(row);
    }
  }

  return { thisWeek, earlier, weekTotal, allTotal };
}
