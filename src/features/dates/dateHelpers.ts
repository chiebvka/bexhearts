// D5 — couple-date lifecycle helpers. Status is DERIVED (no status column):
// completed_at wins; else a scheduled_for makes it Planned; else it's a Saved
// wishlist item.

export type CoupleDateStatus = 'planned' | 'saved' | 'completed';

interface StatusInput {
  completed_at?: string | null;
  scheduled_for?: string | null;
}

export function getDateStatus(date: StatusInput): CoupleDateStatus {
  if (date.completed_at) return 'completed';
  if (date.scheduled_for) return 'planned';
  return 'saved';
}

interface TitleInput {
  custom_title?: string | null;
  date_ideas?: { title?: string | null } | null;
}

// A library date shows its idea's title; a custom date shows its own.
export function getDateTitle(date: TitleInput): string {
  return date.date_ideas?.title ?? date.custom_title ?? 'Untitled date';
}

export function partitionCoupleDates<T extends StatusInput>(
  dates?: T[] | null
): { planned: T[]; saved: T[]; completed: T[] } {
  const planned: T[] = [];
  const saved: T[] = [];
  const completed: T[] = [];
  for (const date of dates ?? []) {
    const status = getDateStatus(date);
    if (status === 'completed') completed.push(date);
    else if (status === 'planned') planned.push(date);
    else saved.push(date);
  }
  return { planned, saved, completed };
}
