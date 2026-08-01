// D5 — couple-date lifecycle helpers. Status is DERIVED (no status column):
// completed_at wins; a pending suggestion (G2 Dates v2: suggested_by set,
// not yet accepted) comes next; else scheduled_for makes it Planned; else
// it's a Saved wishlist item. Legacy rows (suggested_by null) are untouched.

export type CoupleDateStatus = 'planned' | 'saved' | 'completed' | 'suggested';

interface StatusInput {
  completed_at?: string | null;
  scheduled_for?: string | null;
  suggested_by?: string | null;
  accepted_at?: string | null;
}

export function getDateStatus(date: StatusInput): CoupleDateStatus {
  if (date.completed_at) return 'completed';
  if (date.suggested_by && !date.accepted_at) return 'suggested';
  if (date.scheduled_for) return 'planned';
  return 'saved';
}

// Only the NON-suggesting partner gets Accept/Pass; the suggester waits.
export function canRespondToSuggestion(
  date: StatusInput,
  myUserId: string | undefined
): boolean {
  return (
    getDateStatus(date) === 'suggested' &&
    !!myUserId &&
    date.suggested_by !== myUserId
  );
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
): { suggested: T[]; planned: T[]; saved: T[]; completed: T[] } {
  const suggested: T[] = [];
  const planned: T[] = [];
  const saved: T[] = [];
  const completed: T[] = [];
  for (const date of dates ?? []) {
    const status = getDateStatus(date);
    if (status === 'completed') completed.push(date);
    else if (status === 'suggested') suggested.push(date);
    else if (status === 'planned') planned.push(date);
    else saved.push(date);
  }
  return { suggested, planned, saved, completed };
}
