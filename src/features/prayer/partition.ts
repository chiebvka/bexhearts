// D2·M1 — split the (non-archived) prayer list into the two sections the
// screen shows: still "Praying" vs. "Answered". Archived prayers are already
// excluded by the query, so they never reach here. Answered prayers move out of
// the active section so it doesn't become a graveyard, while still being
// celebrated in their own section.

interface PrayerLike {
  is_answered?: boolean | null;
  answered_at?: string | null;
}

export function partitionPrayers<T extends PrayerLike>(
  prayers?: T[] | null
): { active: T[]; answered: T[] } {
  const active: T[] = [];
  const answered: T[] = [];
  for (const prayer of prayers ?? []) {
    if (prayer.is_answered) answered.push(prayer);
    else active.push(prayer);
  }
  return { active, answered };
}
