// D5 — lightweight, JS-only date scheduling (no native date-picker dependency).
// Quick presets are lower-friction than a calendar for "when's our next date?"
// and keep the dev build free of an extra native module. `now` is injectable so
// the presets are deterministically testable.
import { format, addDays, addWeeks, nextFriday, nextSaturday } from 'date-fns';

export interface SchedulePreset {
  key: string;
  label: string;
  date: string; // yyyy-MM-dd
}

export function getSchedulePresets(now: Date = new Date()): SchedulePreset[] {
  return [
    { key: 'tomorrow', label: 'Tomorrow', date: format(addDays(now, 1), 'yyyy-MM-dd') },
    { key: 'this-weekend', label: 'This weekend', date: format(nextSaturday(now), 'yyyy-MM-dd') },
    { key: 'next-friday', label: 'Next Friday', date: format(nextFriday(now), 'yyyy-MM-dd') },
    { key: 'in-two-weeks', label: 'In 2 weeks', date: format(addWeeks(now, 2), 'yyyy-MM-dd') },
  ];
}
