import {
  dailyCounts,
  weekDots,
  buildHeatmapCells,
  lastDaysCells,
  countsFromDaily,
  rangeDays,
  heatCellLabel,
  activityStreak,
  bestLastLabel,
  bestStreakLine,
  togetherLabel,
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

describe('buildHeatmapCells (E10)', () => {
  it('builds Sunday-aligned dated columns covering at least the asked days', () => {
    const counts = dailyCounts([row('2026-07-04')]);
    const weeks = buildHeatmapCells(counts, 30, TODAY);
    for (const week of weeks) expect(week).toHaveLength(7);
    const flat = weeks.flat().filter((c) => !c.future);
    expect(flat.length).toBeGreaterThanOrEqual(30);
    // Today is Saturday → last column ends exactly on today, no future padding.
    const last = weeks[weeks.length - 1];
    expect(last[6]).toMatchObject({ date: '2026-07-04', count: 1, future: false });
    // Every column starts on a Sunday.
    expect(new Date(`${weeks[0][0].date}T12:00:00`).getDay()).toBe(0);
  });

  it('flags mid-week endings as future cells', () => {
    const wednesday = new Date(2026, 6, 1); // Jul 1 2026, dow 3
    const weeks = buildHeatmapCells(new Map(), 30, wednesday);
    const last = weeks[weeks.length - 1];
    expect(last[3]).toMatchObject({ date: '2026-07-01', future: false });
    expect(last.slice(4).every((c) => c.future)).toBe(true);
  });
});

describe('lastDaysCells (E10 7d row)', () => {
  it('returns exactly the last N days oldest-first', () => {
    const counts = dailyCounts([row('2026-07-02')]);
    const cells = lastDaysCells(counts, 7, TODAY);
    expect(cells).toHaveLength(7);
    expect(cells[0].date).toBe('2026-06-28');
    expect(cells[6].date).toBe('2026-07-04');
    expect(cells.find((c) => c.date === '2026-07-02')?.count).toBe(1);
  });
});

describe('countsFromDaily / rangeDays (E10 All filter)', () => {
  it('maps the server daily-counts rows into the client counts shape', () => {
    const counts = countsFromDaily([
      { activity_date: '2026-07-01', activity_count: 3 },
      { activity_date: '2026-07-04', activity_count: 1 },
    ]);
    expect(counts.get('2026-07-01')).toBe(3);
    expect(counts.get('2026-07-03')).toBeUndefined();
  });

  it('rangeDays: fixed windows for 7d/30d, stretches to the earliest day for all', () => {
    const counts = countsFromDaily([{ activity_date: '2026-05-01', activity_count: 1 }]);
    expect(rangeDays('7d', counts, TODAY)).toBe(7);
    expect(rangeDays('30d', counts, TODAY)).toBe(30);
    expect(rangeDays('all', counts, TODAY)).toBe(65); // May 1 → Jul 4 inclusive
    expect(rangeDays('all', new Map(), TODAY)).toBe(30); // empty history floor
  });
});

describe('heatCellLabel (E10 tooltip)', () => {
  it('formats date + count, singular/plural/empty', () => {
    expect(heatCellLabel({ date: '2026-07-04', count: 3, future: false })).toBe(
      'Jul 4 · 3 activities'
    );
    expect(heatCellLabel({ date: '2026-07-04', count: 1, future: false })).toBe(
      'Jul 4 · 1 activity'
    );
    expect(heatCellLabel({ date: '2026-07-04', count: 0, future: false })).toBe(
      'Jul 4 · no activity'
    );
  });
});

describe('bestLastLabel (E10 per-activity stats)', () => {
  const stats = [
    { activity_type: 'devotional', best_streak: 14, last_done: '2026-07-04' },
    { activity_type: 'prayer_session', best_streak: 4, last_done: '2026-06-12' },
  ];

  it('shows "today" when last done today, a date otherwise', () => {
    expect(bestLastLabel(stats, 'devotional', TODAY)).toBe('best 14 · last today');
    expect(bestLastLabel(stats, 'prayer_session', TODAY)).toBe('best 4 · last Jun 12');
  });

  it('is null for untracked activities or missing stats', () => {
    expect(bestLastLabel(stats, 'journal', TODAY)).toBeNull();
    expect(bestLastLabel(undefined, 'devotional', TODAY)).toBeNull();
  });
});

describe('bestStreakLine (E10 hero record)', () => {
  it('formats the record with its date span', () => {
    expect(
      bestStreakLine({ longest: 12, startedOn: '2026-06-03', endedOn: '2026-06-14' })
    ).toBe('Best streak: 12 days · Jun 3 – Jun 14');
  });

  it('handles a 1-day record and missing dates', () => {
    expect(bestStreakLine({ longest: 1, startedOn: '2026-06-03', endedOn: '2026-06-03' })).toBe(
      'Best streak: 1 day · Jun 3'
    );
    expect(bestStreakLine({ longest: 5 })).toBe('Best streak: 5 days');
  });

  it('is null with no history', () => {
    expect(bestStreakLine({ longest: 0 })).toBeNull();
    expect(bestStreakLine({ longest: null })).toBeNull();
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

// First-run pass (2026-07-27) — the Us-hub hero caption on a brand-new couple.
describe('togetherLabel', () => {
  it('reads warmly on day zero instead of "0 days"', () => {
    expect(togetherLabel(0)).toBe('together since today');
  });

  it('pluralises day one correctly', () => {
    expect(togetherLabel(1)).toBe('1 day in the app together');
  });

  it('pluralises beyond day one', () => {
    expect(togetherLabel(2)).toBe('2 days in the app together');
    expect(togetherLabel(365)).toBe('365 days in the app together');
  });

  it('renders nothing when the couple has no created_at to measure from', () => {
    expect(togetherLabel(null)).toBeNull();
    expect(togetherLabel(undefined)).toBeNull();
  });

  it('renders nothing rather than a negative count on a skewed clock', () => {
    expect(togetherLabel(-1)).toBeNull();
  });
});
