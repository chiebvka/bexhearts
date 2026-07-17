// E5+E6 — countdown + timeline assembly.
import { getCountdown } from '@/features/journal/countdown';
import { buildTimeline } from '@/features/journal/timeline';

describe('getCountdown', () => {
  const now = new Date(2026, 6, 1); // Jul 1 2026 (local)

  it('is Today for the same day', () => {
    expect(getCountdown('2026-07-01', now)).toMatchObject({ direction: 'today', label: 'Today' });
  });
  it('counts future days', () => {
    expect(getCountdown('2026-07-02', now)).toMatchObject({ direction: 'future', label: 'Tomorrow' });
    expect(getCountdown('2026-07-06', now)).toMatchObject({ direction: 'future', days: 5, label: 'in 5 days' });
  });
  it('counts past days', () => {
    expect(getCountdown('2026-06-30', now)).toMatchObject({ direction: 'past', label: '1 day ago' });
    expect(getCountdown('2026-06-01', now)).toMatchObject({ direction: 'past', days: 30, label: '30 days ago' });
  });
});

describe('buildTimeline', () => {
  it('merges all sources into one reverse-chronological feed', () => {
    const entries = buildTimeline({
      memories: [{ id: 'm1', title: 'Beach day', description: 'sunny', memory_date: '2026-04-20' }],
      milestones: [{ id: 's1', title: '6 months', event_date: '2026-04-24' }],
      answeredPrayers: [{ id: 'p1', title: 'Job', answered_at: '2026-04-22T10:00:00Z' }],
      completedDates: [
        { id: 'd1', completed_at: '2026-04-18T00:00:00Z', custom_title: 'Lake', date_ideas: null },
      ],
    });

    expect(entries.map((e) => e.id)).toEqual([
      'milestone-s1', // 04-24
      'prayer-p1', // 04-22
      'memory-m1', // 04-20
      'date-d1', // 04-18
    ]);
    expect(entries[1]).toMatchObject({ type: 'prayer', date: '2026-04-22', subtitle: 'Prayer answered' });
    expect(entries[3]).toMatchObject({ type: 'date', title: 'Lake' });
  });

  it('prefers a library date idea title and drops entries with no date', () => {
    const entries = buildTimeline({
      completedDates: [
        { id: 'd1', completed_at: '2026-04-18T00:00:00Z', date_ideas: { title: 'Stargazing' } },
        { id: 'd2', completed_at: null, custom_title: 'Unfinished' },
      ],
    });
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe('Stargazing');
  });

  it('handles empty input', () => {
    expect(buildTimeline({})).toEqual([]);
  });

  it('carries a memory’s image urls, ordered by position (polaroid preview)', () => {
    const entries = buildTimeline({
      memories: [
        {
          id: 'm1',
          title: 'Beach day',
          memory_date: '2026-04-20',
          memory_images: [
            { image_url: 'second.jpg', position: 1 },
            { image_url: 'first.jpg', position: 0 },
          ],
        },
        { id: 'm2', title: 'No photos yet', memory_date: '2026-04-19' },
      ],
    });

    expect(entries[0].imageUrls).toEqual(['first.jpg', 'second.jpg']);
    expect(entries[1].imageUrls).toEqual([]);
  });
});
