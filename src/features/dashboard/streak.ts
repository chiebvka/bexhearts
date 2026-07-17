// D6 — streak logic (canonical reference, mirrored by the SQL trigger
// `update_couple_streak` in 00012). Kept here as the single tested spec of the
// rule; the runtime write happens server-side so it can't be gamed.
import { format, startOfWeek, differenceInCalendarDays } from 'date-fns';

export interface StreakState {
  streakCount: number;
  lastDate: string | null; // yyyy-MM-dd (in the couple's timezone)
  graceRemaining: number;
  graceWeek: string | null; // yyyy-MM-dd week start (Sunday)
}

function parseYmd(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function weekOf(value: string): string {
  return format(startOfWeek(parseYmd(value), { weekStartsOn: 0 }), 'yyyy-MM-dd');
}

// Applies the day's transition, GIVEN that everyone in the couple has completed
// today's devotional (the trigger gates on that before calling this logic).
// One free missed day per week; a single missed day with grace continues the
// streak, otherwise it resets to 1.
export function computeStreakTransition(state: StreakState, today: string): StreakState {
  if (state.lastDate === today) return state; // already counted today

  let graceRemaining = state.graceRemaining;
  let graceWeek = state.graceWeek;
  const currentWeek = weekOf(today);
  if (graceWeek !== currentWeek) {
    graceRemaining = 1; // weekly refill
    graceWeek = currentWeek;
  }

  let streakCount: number;
  if (state.lastDate === null) {
    streakCount = 1;
  } else {
    const gap = differenceInCalendarDays(parseYmd(today), parseYmd(state.lastDate));
    if (gap === 1) {
      streakCount = state.streakCount + 1;
    } else if (gap >= 2) {
      const missed = gap - 1;
      if (missed === 1 && graceRemaining >= 1) {
        streakCount = state.streakCount + 1;
        graceRemaining -= 1;
      } else {
        streakCount = 1;
      }
    } else {
      streakCount = Math.max(state.streakCount, 1); // gap <= 0, shouldn't happen
    }
  }

  return { streakCount, lastDate: today, graceRemaining, graceWeek };
}

// Dashboard "did we keep it alive today?" state — drives the waiting-on-partner
// nudge, the single best re-engagement mechanic in the app.
export type StreakDayState = 'complete' | 'waiting-partner' | 'waiting-you' | 'none';

export function getStreakDayState(args: {
  isLinked: boolean;
  myDone: boolean;
  partnerDone: boolean;
}): StreakDayState {
  const { isLinked, myDone, partnerDone } = args;
  if (!isLinked) return myDone ? 'complete' : 'none';
  if (myDone && partnerDone) return 'complete';
  if (myDone) return 'waiting-partner';
  if (partnerDone) return 'waiting-you';
  return 'none';
}
