// JOURNAL PDF EXPORT
//
// Two things made this pre-launch rather than nice-to-have:
//
//  1. THE E14 BREAKUP CASE. `leave_couple()` detaches the leaver immediately
//     and RLS does the rest, so the moment someone leaves they lose read
//     access to years of shared journal. The 30-day archive was deliberately
//     deferred (it needs RLS rework across every couple-scoped table), which
//     leaves export as the only way to take your own memories with you —
//     and it has to be done BEFORE you leave.
//
//  2. THE ToS-FLAGGED LEGAL EXPOSURE. TERMS_OF_SERVICE.md flags for the
//     attorney that a data-export path may be legally REQUIRED (not optional)
//     in some jurisdictions. This is that path.
//
// WHAT GOES IN, AND WHY (owner-specified 2026-07-26):
//
//   Journal moments + photos ....... always. This is the thing being exported.
//   Milestones ..................... always. They're the spine of the story.
//   Completed dates ................ always. Already on the timeline.
//   Answered prayers ............... always. A record of prayers answered is
//                                    the part people most want to keep.
//   ACTIVE prayers ................. OPT-IN. Still-open requests are raw and
//                                    current in a way answered ones aren't.
//   Boundaries & temptation plans .. EXCLUDED BY DEFAULT, behind a SEPARATE
//                                    confirmation. A temptation plan is the
//                                    most sensitive thing in this app; it must
//                                    never land in a PDF because someone tapped
//                                    "export" expecting holiday photos.
//
// WHO CAN EXPORT WHAT:
//   Shared content — either partner. It belongs to both of them.
//   Boundaries/temptation plans — THE AUTHOR ONLY, enforced here in
//   `buildExportDocument` and mirrored by the D5 author-only rules in the UI.
//   Exporting your partner's temptation plan would turn a support tool into
//   a surveillance one.

export interface ExportOptions {
  /** Still-open prayer requests. Off by default. */
  includeActivePrayers: boolean;
  /** Boundaries + temptation plans. Off by default, separate confirmation. */
  includeBoundaries: boolean;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeActivePrayers: false,
  includeBoundaries: false,
};

export interface ExportMemory {
  id: string;
  title: string;
  description?: string | null;
  memory_date: string;
  memory_images?: { image_url: string; position?: number | null }[] | null;
}
export interface ExportMilestone {
  id: string;
  title: string;
  event_date: string;
  icon?: string | null;
}
export interface ExportPrayer {
  id: string;
  title: string;
  body?: string | null;
  is_answered?: boolean | null;
  answered_at?: string | null;
  created_at?: string | null;
  is_private?: boolean | null;
  author_id?: string | null;
}
export interface ExportDate {
  id: string;
  completed_at?: string | null;
  custom_title?: string | null;
  notes?: string | null;
  date_ideas?: { title?: string | null } | null;
}
export interface ExportBoundary {
  id: string;
  type: 'boundary' | 'temptation' | string;
  title: string;
  description?: string | null;
  action_plan?: string | null;
  author_id: string;
  created_at?: string | null;
  is_active?: boolean | null;
}

export interface ExportSources {
  memories?: ExportMemory[] | null;
  milestones?: ExportMilestone[] | null;
  prayers?: ExportPrayer[] | null;
  completedDates?: ExportDate[] | null;
  boundaries?: ExportBoundary[] | null;
}

export type ExportEntryKind =
  | 'memory'
  | 'milestone'
  | 'date'
  | 'prayer_answered'
  | 'prayer_active';

export interface ExportEntry {
  id: string;
  kind: ExportEntryKind;
  /** yyyy-MM-dd — the sort key and the date printed on the entry. */
  date: string;
  title: string;
  body?: string | null;
  imageUrls: string[];
}

export interface ExportBoundaryEntry {
  id: string;
  kind: 'boundary' | 'temptation';
  date: string;
  title: string;
  body?: string | null;
  actionPlan?: string | null;
}

export interface ExportDocument {
  entries: ExportEntry[];
  /** Kept OUT of the chronological story: a separate, clearly-marked appendix. */
  boundaries: ExportBoundaryEntry[];
  counts: {
    memories: number;
    milestones: number;
    dates: number;
    answeredPrayers: number;
    activePrayers: number;
    boundaries: number;
    photos: number;
  };
  /** Earliest → latest entry date, for the cover page. Null when empty. */
  range: { from: string; to: string } | null;
}

function toYmd(iso?: string | null): string {
  return (iso ?? '').slice(0, 10);
}

function sortedImageUrls(
  images?: { image_url: string; position?: number | null }[] | null
): string[] {
  return [...(images ?? [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((i) => i.image_url)
    .filter(Boolean);
}

/**
 * Assemble the export. Pure, so the inclusion and authorship rules above are
 * unit-testable without a database, a renderer, or a device.
 *
 * `viewerId` is the person doing the exporting — it is what makes the
 * author-only boundary rule enforceable rather than aspirational.
 */
export function buildExportDocument(
  sources: ExportSources,
  options: ExportOptions,
  viewerId: string
): ExportDocument {
  const entries: ExportEntry[] = [];
  let photos = 0;

  for (const m of sources.memories ?? []) {
    const imageUrls = sortedImageUrls(m.memory_images);
    photos += imageUrls.length;
    entries.push({
      id: `memory-${m.id}`,
      kind: 'memory',
      date: m.memory_date,
      title: m.title,
      body: m.description,
      imageUrls,
    });
  }

  for (const ms of sources.milestones ?? []) {
    entries.push({
      id: `milestone-${ms.id}`,
      kind: 'milestone',
      date: ms.event_date,
      title: ms.icon ? `${ms.icon} ${ms.title}` : ms.title,
      imageUrls: [],
    });
  }

  for (const d of sources.completedDates ?? []) {
    entries.push({
      id: `date-${d.id}`,
      kind: 'date',
      date: toYmd(d.completed_at),
      title: d.custom_title || d.date_ideas?.title || 'A date together',
      body: d.notes,
      imageUrls: [],
    });
  }

  for (const p of sources.prayers ?? []) {
    const answered = !!p.is_answered;
    if (!answered && !options.includeActivePrayers) continue;
    // A personal prayer belongs to its author alone. RLS (00015) already keeps
    // the partner's private prayers out of the query — this is the same rule
    // restated where the document is assembled, so a future change to the
    // fetch can't quietly widen what gets printed.
    if (p.is_private && p.author_id && p.author_id !== viewerId) continue;
    entries.push({
      id: `prayer-${p.id}`,
      kind: answered ? 'prayer_answered' : 'prayer_active',
      date: answered ? toYmd(p.answered_at) : toYmd(p.created_at),
      title: p.title,
      body: p.body,
      imageUrls: [],
    });
  }

  // Oldest first: this reads as a story from the beginning, not a feed.
  // Undated rows sink to the end rather than corrupting the order.
  entries.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });

  const boundaries: ExportBoundaryEntry[] = options.includeBoundaries
    ? (sources.boundaries ?? [])
        .filter((b) => b.author_id === viewerId)
        .map<ExportBoundaryEntry>((b) => ({
          id: `boundary-${b.id}`,
          kind: b.type === 'temptation' ? 'temptation' : 'boundary',
          date: toYmd(b.created_at),
          title: b.title,
          body: b.description,
          actionPlan: b.action_plan,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const dated = entries.filter((e) => e.date);

  return {
    entries,
    boundaries,
    counts: {
      memories: entries.filter((e) => e.kind === 'memory').length,
      milestones: entries.filter((e) => e.kind === 'milestone').length,
      dates: entries.filter((e) => e.kind === 'date').length,
      answeredPrayers: entries.filter((e) => e.kind === 'prayer_answered').length,
      activePrayers: entries.filter((e) => e.kind === 'prayer_active').length,
      boundaries: boundaries.length,
      photos,
    },
    range: dated.length
      ? { from: dated[0].date, to: dated[dated.length - 1].date }
      : null,
  };
}
