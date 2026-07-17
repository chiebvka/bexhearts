// E5 — "Special Day" countdown. Days until (future) / since (past) an event.
import { differenceInCalendarDays } from 'date-fns';

export interface Countdown {
  days: number; // absolute
  direction: 'past' | 'today' | 'future';
  label: string;
}

export function getCountdown(dateStr: string, now: Date = new Date()): Countdown {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const delta = differenceInCalendarDays(target, today);

  if (delta === 0) return { days: 0, direction: 'today', label: 'Today' };
  if (delta > 0) {
    return { days: delta, direction: 'future', label: delta === 1 ? 'Tomorrow' : `in ${delta} days` };
  }
  const abs = Math.abs(delta);
  return { days: abs, direction: 'past', label: abs === 1 ? '1 day ago' : `${abs} days ago` };
}
