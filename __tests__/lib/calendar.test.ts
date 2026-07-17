import {
  buildMonthMatrix,
  daysInMonth,
  toYmd,
  parseYmd,
  addMonths,
} from '@/lib/calendar';

describe('buildMonthMatrix', () => {
  it('lays out July 2026 (starts Wednesday, 31 days)', () => {
    const weeks = buildMonthMatrix(2026, 7);

    // First row: Sun–Tue blank, then 1 (Wed July 1st 2026).
    expect(weeks[0]).toEqual([null, null, null, 1, 2, 3, 4]);
    // Every row is a full week.
    for (const week of weeks) expect(week).toHaveLength(7);
    // All 31 days present, in order.
    const days = weeks.flat().filter((d): d is number => d !== null);
    expect(days).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
  });

  it('handles a month starting on Sunday with no leading blanks', () => {
    // Feb 2026 starts on a Sunday.
    const weeks = buildMonthMatrix(2026, 2);
    expect(weeks[0][0]).toBe(1);
    expect(weeks.flat().filter((d) => d !== null)).toHaveLength(28);
  });

  it('handles leap February', () => {
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(buildMonthMatrix(2028, 2).flat().filter((d) => d !== null)).toHaveLength(29);
  });
});

describe('toYmd / parseYmd', () => {
  it('round-trips with zero padding', () => {
    expect(toYmd(2026, 4, 5)).toBe('2026-04-05');
    expect(parseYmd('2026-04-05')).toEqual({ year: 2026, month: 4, day: 5 });
  });

  it('rejects malformed or impossible dates', () => {
    expect(parseYmd('not-a-date')).toBeNull();
    expect(parseYmd('2026-13-01')).toBeNull();
    expect(parseYmd('2026-02-30')).toBeNull();
    expect(parseYmd(null)).toBeNull();
  });
});

describe('addMonths', () => {
  it('moves forward across a year boundary', () => {
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });
  it('moves backward across a year boundary', () => {
    expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });
  it('stays put with zero delta', () => {
    expect(addMonths(2026, 7, 0)).toEqual({ year: 2026, month: 7 });
  });
});
