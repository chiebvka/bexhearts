// Long-distance mode pure helpers.
//   E11 (2026-07-25): capture + Virtual chip + "their time" clock.
//   E12 (2026-07-26): virtual-first ordering with a "For your next visit"
//   split, a real asleep indicator, and the next-visit countdown.

// ---------------------------------------------------------------------------
// The partner clock

const DEFAULT_SLEEP_START = 22; // 10pm
const DEFAULT_SLEEP_END = 7; // 7am

export interface PartnerClock {
  /** "3:42 PM" in their timezone. */
  time: string;
  /** They're inside their own quiet-hours window — probably asleep. */
  asleep: boolean;
}

function hourIn(timeZone: string, now: Date): number {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone,
    }).format(now)
  );
}

// True when `hour` falls in [start, end). Handles overnight windows (22 → 7).
// start === end means "no window" rather than "all day" (matches the
// notification prefs rule in features/notifications/prefs.ts).
export function isSleepingHour(hour: number, start: number, end: number): boolean {
  if (start === end) return false;
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

// The partner's local time plus whether they're likely asleep. Null when it
// would add nothing: no timezone stamped, an invalid zone, or both clocks
// read the same (same/equivalent timezone).
//
// The sleep window comes from THEIR quiet-hours notification setting when
// they've set one — it is literally their own answer to "when should I not be
// disturbed" — and falls back to 10pm–7am otherwise.
export function partnerClock(params: {
  partnerTimezone: string | null | undefined;
  myTimezone: string;
  quietHours?: { start: number; end: number } | null;
  now?: Date;
}): PartnerClock | null {
  const { partnerTimezone, myTimezone, quietHours, now = new Date() } = params;
  if (!partnerTimezone) return null;
  try {
    const fmt = (timeZone: string) =>
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone,
      }).format(now);
    const time = fmt(partnerTimezone);
    if (time === fmt(myTimezone)) return null;

    const start = quietHours?.start ?? DEFAULT_SLEEP_START;
    const end = quietHours?.end ?? DEFAULT_SLEEP_END;
    return { time, asleep: isSleepingHour(hourIn(partnerTimezone, now), start, end) };
  } catch {
    return null; // unknown/invalid IANA name
  }
}

// Header caption: "2:09 AM their time", with a moon when they're likely
// asleep. Deliberately descriptive, never prescriptive — it tells you what
// time it is there, it doesn't tell you not to message them.
export function partnerClockLabel(clock: PartnerClock | null): string | null {
  if (!clock) return null;
  return clock.asleep ? `🌙 ${clock.time} their time` : `${clock.time} their time`;
}

// ---------------------------------------------------------------------------
// Idea filters + ordering

export interface IdeaFilter {
  key: string;
  label: string;
}

export const VIRTUAL_FILTER: IdeaFilter = { key: 'virtual', label: 'Virtual 💻' };

// Category chips for the Ideas tab. Virtual leads for long-distance couples
// (their default mode of dating) and trails the categories otherwise.
export function buildIdeaFilters(
  categories: IdeaFilter[],
  isLongDistance: boolean
): IdeaFilter[] {
  return isLongDistance
    ? [VIRTUAL_FILTER, ...categories]
    : [...categories, VIRTUAL_FILTER];
}

export interface IdeaLike {
  id: string;
  is_virtual?: boolean | null;
}

export interface IdeaSection<T> {
  key: 'apart' | 'together' | 'all';
  title: string | null;
  data: T[];
}

// E12 — for a long-distance couple the unfiltered list splits in two:
// what you can do RIGHT NOW while apart, then everything else reframed as
// visit planning. Co-located ideas are SUNK, never hidden — LDR couples do
// meet up, and that's exactly when they need the hiking and road trips.
//
// Only applies to the unfiltered "All" view: once someone picks a category
// chip they've asked a specific question, so give them a flat answer.
export function buildIdeaSections<T extends IdeaLike>(params: {
  ideas: T[];
  isLongDistance: boolean;
  filtered: boolean;
}): IdeaSection<T>[] {
  const { ideas, isLongDistance, filtered } = params;
  if (!isLongDistance || filtered || ideas.length === 0) {
    return [{ key: 'all', title: null, data: ideas }];
  }

  const apart = ideas.filter((idea) => idea.is_virtual);
  const together = ideas.filter((idea) => !idea.is_virtual);

  const sections: IdeaSection<T>[] = [];
  if (apart.length) sections.push({ key: 'apart', title: 'While you’re apart', data: apart });
  if (together.length) {
    sections.push({ key: 'together', title: 'For your next visit', data: together });
  }
  return sections;
}

// ---------------------------------------------------------------------------
// Next-visit countdown

/** The ✈️ preset on the special-day form marks a visit milestone. */
export const NEXT_VISIT_ICON = '✈️';

export interface MilestoneLike {
  icon?: string | null;
  event_date: string; // yyyy-MM-dd
}

// The soonest upcoming ✈️ visit (today counts). Null when none is set.
export function nextVisit<T extends MilestoneLike>(
  milestones: T[] | undefined,
  today: string
): T | null {
  const upcoming = (milestones ?? [])
    .filter((m) => m.icon === NEXT_VISIT_ICON && m.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  return upcoming[0] ?? null;
}

// "9 days until you're together" — the emotional core of the feature.
// Not gated on the LDR toggle: couples apart for a work trip want this too.
export function visitCountdownLabel(days: number): string {
  if (days <= 0) return 'You’re together 💜';
  if (days === 1) return 'Tomorrow you’re together 💜';
  return `${days} days until you’re together 💜`;
}
