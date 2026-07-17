import {
  dailyCounts,
  weekDots,
  buildHeatmapWeeks,
  activityStreak,
  typesDoneToday,
  buildBadges,
} from '@/features/dashboard/activity';

const TODAY = new Date(2026, 6, 4); // Jul 4 2026 (local), a Saturday

const row = (date: string, type = 'devotional', user = 'u1') => ({
  activity_date: date,
  activity_type: type,
  user_id: user,
});

describe('dailyCounts', () => {
  it('counts distinct (user, type) per day and ignores duplicates', () => {
    const counts = dailyCounts([
      row('2026-07-04', 'devotional', 'u1'),
      row('2026-07-04', 'devotional', 'u1'),
      row('2026-07-04', 'devotional', 'u2'),
      row('2026-07-04', 'prayer_session', 'u1'),
    ]);
    expect(counts.get('2026-07-04')).toBe(3);
  });
});

describe('weekDots', () => {
  it('returns the last 7 days oldest-first, flagging today', () => {
    const dots = weekDots([row('2026-07-04'), row('2026-07-01')], TODAY);
    expect(dots).toHaveLength(7);
    expect(dots[0].date).toBe('2026-06-28');
    expect(dots[6]).toMatchObject({ date: '2026-07-04', count: 1, isToday: true });
    expect(dots.find((d) => d.date === '2026-07-01')?.count).toBe(1);
    expect(dots.find((d) => d.date === '2026-07-02')?.count).toBe(0);
  });
});

describe('buildHeatmapWeeks', () => {
  it('builds week columns ending today with future cells padded as -1', () => {
    const weeks = buildHeatmapWeeks([row('2026-07-04')], 4, TODAY);
    expect(weeks).toHaveLength(4);
    for (const week of weeks) expect(week).toHaveLength(7);
    // Today is Saturday (dow 6) → the last column is a full week with no padding.
    const lastWeek = weeks[3];
    expect(lastWeek[6]).toBe(1); // Saturday = today, one activity
    expect(lastWeek.includes(-1)).toBe(false);
  });

  it('pads mid-week endings with -1', () => {
    const wednesday = new Date(2026, 6, 1); // Jul 1 2026, dow 3
    const weeks = buildHeatmapWeeks([], 2, wednesday);
    const lastWeek = weeks[1];
    expect(lastWeek.slice(4)).toEqual([-1, -1, -1]);
  });
});

describe('activityStreak', () => {
  it('counts consecutive days ending today', () => {
    const rows = [
      row('2026-07-04', 'prayer_session'),
      row('2026-07-03', 'prayer_session'),
      row('2026-07-02', 'prayer_session'),
      row('2026-06-30', 'prayer_session'),
    ];
    expect(activityStreak(rows, 'prayer_session', TODAY)).toBe(3);
  });

  it('still counts a streak ending yesterday (today not done yet)', () => {
    const rows = [row('2026-07-03'), row('2026-07-02')];
    expect(activityStreak(rows, 'devotional', TODAY)).toBe(2);
  });

  it('is zero after a gap', () => {
    expect(activityStreak([row('2026-07-01')], 'devotional', TODAY)).toBe(0);
  });
});

describe('typesDoneToday', () => {
  it('collects only today’s types', () => {
    const types = typesDoneToday(
      [row('2026-07-04', 'devotional'), row('2026-07-03', 'check_in')],
      TODAY
    );
    expect(types.has('devotional')).toBe(true);
    expect(types.has('check_in')).toBe(false);
  });
});

describe('buildBadges', () => {
  it('earns badges from thresholds', () => {
    const badges = buildBadges({ streakCount: 8, totalActivities: 12, prayerSessions: 1 });
    expect(badges.find((b) => b.key === 'week')?.earned).toBe(true);
    expect(badges.find((b) => b.key === 'month')?.earned).toBe(false);
    expect(badges.find((b) => b.key === 'first-prayer')?.earned).toBe(true);
    expect(badges.find((b) => b.key === 'hundred')?.earned).toBe(false);
  });
});
