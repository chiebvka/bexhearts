// D4 — split the active boundaries list into its two registers: proactive
// shared "boundaries" (covenants) and personal "temptation" plans (grace-framed
// accountability). They deserve distinct sections + copy + mechanics.

interface BoundaryLike {
  type: string;
}

export function partitionBoundaries<T extends BoundaryLike>(
  boundaries?: T[] | null
): { boundaries: T[]; temptations: T[] } {
  const boundaryItems: T[] = [];
  const temptationItems: T[] = [];
  for (const item of boundaries ?? []) {
    if (item.type === 'temptation') temptationItems.push(item);
    else boundaryItems.push(item);
  }
  return { boundaries: boundaryItems, temptations: temptationItems };
}

// D5 (owner locked 2026-07-10) — inactive rows don't vanish anymore: retired
// boundaries become "Past covenants" and resolved temptation plans become
// "Victories" (the never-resets victory record — testimony, not archive).
export interface BoundaryHistoryGroups<T> {
  boundaries: T[]; // active covenants
  temptations: T[]; // active plans
  victories: T[]; // resolved temptation plans
  pastCovenants: T[]; // retired boundaries
}

export function partitionBoundaryHistory<T extends BoundaryLike & { is_active?: boolean | null }>(
  rows?: T[] | null
): BoundaryHistoryGroups<T> {
  const groups: BoundaryHistoryGroups<T> = {
    boundaries: [],
    temptations: [],
    victories: [],
    pastCovenants: [],
  };
  for (const item of rows ?? []) {
    const active = item.is_active !== false;
    if (item.type === 'temptation') {
      (active ? groups.temptations : groups.victories).push(item);
    } else {
      (active ? groups.boundaries : groups.pastCovenants).push(item);
    }
  }
  return groups;
}

// D5 — only the author may resolve their own temptation plan (it's their
// personal journey); boundaries are shared covenants either partner can
// retire (with attribution).
export function canDeactivate(
  item: { type: string; author_id?: string | null },
  userId?: string | null
): boolean {
  if (item.type !== 'temptation') return true;
  return !!userId && item.author_id === userId;
}
