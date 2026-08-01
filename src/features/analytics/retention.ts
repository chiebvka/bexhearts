// D1 / D7 return milestones — pure so the day math is testable without a
// device clock.
//
// Why explicit events rather than leaning on PostHog's retention report: the
// owner asked for a FUNNEL (install → paywall → trial → subscribed → returned),
// and a funnel step needs an event. `d1_returned` / `d7_returned` fire at most
// once per install, so the funnel counts people, not sessions.
//
// "Day" is the DEVICE's local calendar day, matching how a person experiences
// "I came back the next day". Dates are `YYYY-MM-DD` strings so the state
// survives JSON round-tripping (the H2 persisted-cache rule) and no Date
// object is ever stored.

export const RETENTION_MILESTONES = [
  { key: 'd1', days: 1, event: 'd1_returned' },
  { key: 'd7', days: 7, event: 'd7_returned' },
] as const;

export type RetentionMilestoneKey = (typeof RETENTION_MILESTONES)[number]['key'];

export interface RetentionState {
  /** Device-local `YYYY-MM-DD` of the first ever app open. */
  firstOpenDate: string | null;
  /** Milestone keys already reported — each fires at most once per install. */
  fired: RetentionMilestoneKey[];
}

export interface RetentionOutcome {
  next: RetentionState;
  /** Event names to emit, in order. */
  events: string[];
  /** Whole days since the first open (0 on install day). */
  daysSinceFirstOpen: number;
  isFirstOpen: boolean;
}

export const EMPTY_RETENTION_STATE: RetentionState = { firstOpenDate: null, fired: [] };

/** Device-local calendar day as `YYYY-MM-DD` (no UTC shift). */
export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Whole calendar days between two `YYYY-MM-DD` keys (negative if b < a). */
export function daysBetween(fromKey: string, toKey: string): number {
  const from = Date.parse(`${fromKey}T00:00:00Z`);
  const to = Date.parse(`${toKey}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.round((to - from) / 86_400_000);
}

/**
 * Fold today's open into the stored retention state.
 *
 * A clock set backwards (traveller crossing the date line, manual change)
 * yields a negative diff — clamped to 0 so it can neither fire a milestone
 * nor produce a nonsense negative property.
 */
export function resolveRetention(state: RetentionState, todayKey: string): RetentionOutcome {
  const isFirstOpen = !state.firstOpenDate;
  const firstOpenDate = state.firstOpenDate ?? todayKey;
  const daysSinceFirstOpen = Math.max(0, daysBetween(firstOpenDate, todayKey));

  const events: string[] = [];
  const fired = [...state.fired];

  for (const milestone of RETENTION_MILESTONES) {
    if (fired.includes(milestone.key)) continue;
    if (daysSinceFirstOpen < milestone.days) continue;
    fired.push(milestone.key);
    events.push(milestone.event);
  }

  return {
    next: { firstOpenDate, fired },
    events,
    daysSinceFirstOpen,
    isFirstOpen,
  };
}
