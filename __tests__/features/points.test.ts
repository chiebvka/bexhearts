// D2 — points-history presentation logic.
import {
  partitionPointsHistory,
  pointReasonLabel,
  weekStart,
  type PointsLedgerEntry,
} from '@/features/dashboard/points';

const row = (over: Partial<PointsLedgerEntry>): PointsLedgerEntry => ({
  id: Math.random().toString(36).slice(2),
  user_id: 'u1',
  points: 10,
  reason: 'devotional',
  created_at: '2026-07-08T12:00:00Z',
  ...over,
});

describe('pointReasonLabel', () => {
  it('maps every trigger reason to a friendly label', () => {
    expect(pointReasonLabel('devotional')).toBe('Devotional together');
    expect(pointReasonLabel('prayer_session')).toBe('Prayer session');
    expect(pointReasonLabel('check_in')).toBe('Weekly check-in');
    expect(pointReasonLabel('date_rated')).toBe('Date rated');
  });

  it('humanizes unknown reasons instead of leaking raw slugs', () => {
    expect(pointReasonLabel('some_new_thing')).toBe('some new thing');
  });
});

describe('weekStart', () => {
  it('returns the Sunday of the given week (matches the streak grace week)', () => {
    // 2026-07-10 is a Friday → week starts Sunday 2026-07-05
    const start = weekStart(new Date(2026, 6, 10, 15, 30));
    expect(start.getDay()).toBe(0);
    expect(start.getDate()).toBe(5);
    expect(start.getHours()).toBe(0);
  });
});

describe('partitionPointsHistory', () => {
  const now = new Date(2026, 6, 10, 12, 0); // Fri; week = Sun Jul 5

  it('splits this week from earlier and totals both', () => {
    const rows = [
      row({ points: 10, created_at: '2026-07-09T08:00:00' }), // this week
      row({ points: 20, created_at: '2026-07-06T08:00:00' }), // this week
      row({ points: 15, created_at: '2026-07-01T08:00:00' }), // earlier
    ];
    const split = partitionPointsHistory(rows, now);
    expect(split.thisWeek).toHaveLength(2);
    expect(split.earlier).toHaveLength(1);
    expect(split.weekTotal).toBe(30);
    expect(split.allTotal).toBe(45);
  });

  it('handles empty/missing input', () => {
    expect(partitionPointsHistory(null, now)).toEqual({
      thisWeek: [],
      earlier: [],
      weekTotal: 0,
      allTotal: 0,
    });
  });

  it('rows without a timestamp count as earlier, never this week', () => {
    const split = partitionPointsHistory([row({ created_at: null, points: 5 })], now);
    expect(split.earlier).toHaveLength(1);
    expect(split.weekTotal).toBe(0);
    expect(split.allTotal).toBe(5);
  });
});
