// E6 — timeline assembly. Weaves the couple's manual entries (memories,
// milestones) with auto-generated moments (answered prayers, completed dates)
// into one reverse-chronological feed. Pure + testable; the screen just renders.
//
// Completed devotionals are intentionally excluded for v1 — they happen daily
// and would flood the story; they feed the streak instead. Milestone-style
// devotional moments can be added later.

import { sortImageUrls } from './images';

export type TimelineEntryType = 'memory' | 'milestone' | 'prayer' | 'date';

export interface TimelineEntry<T = unknown> {
  id: string;
  type: TimelineEntryType;
  date: string; // yyyy-MM-dd (sort key)
  title: string;
  subtitle?: string | null;
  imageUrls?: string[]; // memories only — feeds the fanned-polaroid preview
  ref: T;
}

interface MemoryLike {
  id: string;
  title: string;
  description?: string | null;
  memory_date: string;
  memory_images?: { image_url: string; position?: number | null }[] | null;
}
interface MilestoneLike {
  id: string;
  title: string;
  event_date: string;
}
interface PrayerLike {
  id: string;
  title: string;
  answered_at?: string | null;
}
interface DateLike {
  id: string;
  completed_at?: string | null;
  custom_title?: string | null;
  date_ideas?: { title?: string | null } | null;
}

interface TimelineSources {
  memories?: MemoryLike[] | null;
  milestones?: MilestoneLike[] | null;
  answeredPrayers?: PrayerLike[] | null;
  completedDates?: DateLike[] | null;
}

function toYmd(iso?: string | null): string {
  return (iso ?? '').slice(0, 10);
}

export function buildTimeline(sources: TimelineSources): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const m of sources.memories ?? []) {
    entries.push({
      id: `memory-${m.id}`,
      type: 'memory',
      date: m.memory_date,
      title: m.title,
      subtitle: m.description,
      imageUrls: sortImageUrls(m.memory_images ?? []),
      ref: m,
    });
  }
  for (const ms of sources.milestones ?? []) {
    entries.push({ id: `milestone-${ms.id}`, type: 'milestone', date: ms.event_date, title: ms.title, ref: ms });
  }
  for (const p of sources.answeredPrayers ?? []) {
    entries.push({ id: `prayer-${p.id}`, type: 'prayer', date: toYmd(p.answered_at), title: p.title, subtitle: 'Prayer answered', ref: p });
  }
  for (const d of sources.completedDates ?? []) {
    entries.push({
      id: `date-${d.id}`,
      type: 'date',
      date: toYmd(d.completed_at),
      title: d.date_ideas?.title ?? d.custom_title ?? 'Date',
      subtitle: 'Date completed',
      ref: d,
    });
  }

  return entries
    .filter((e) => e.date)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
