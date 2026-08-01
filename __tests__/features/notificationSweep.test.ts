import {
  planCoupleSweep,
  daysUntil,
  SWEEP_HOURS,
  STREAK_RISK_MIN,
  type SweepCoupleInput,
} from '@/features/notifications/sweep';

const base: SweepCoupleInput = {
  coupleId: 'c1',
  localHour: 0,
  localDow: 3, // Wednesday
  localDate: '2026-07-19',
  streakCount: 0,
  members: [
    { id: 'a', devotionalDoneToday: false, checkInThisWeek: false },
    { id: 'b', devotionalDoneToday: true, checkInThisWeek: true },
  ],
  activeSharedPrayers: 0,
  milestones: [],
  graceUsedRecently: false,
};

describe('planCoupleSweep (G3 — hourly scheduled lane)', () => {
  it('sends nothing outside the send windows', () => {
    expect(planCoupleSweep({ ...base, localHour: 7 })).toEqual([]);
    expect(planCoupleSweep({ ...base, localHour: 23 })).toEqual([]);
  });

  it('9am devotional reminder goes ONLY to members who have not done it', () => {
    const actions = planCoupleSweep({ ...base, localHour: SWEEP_HOURS.devotionalReminder });
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      recipientId: 'a',
      category: 'daily_reminder',
      route: '/(tabs)/devotional',
    });
  });

  it('grace notice rides 9am and reaches BOTH members', () => {
    const actions = planCoupleSweep({
      ...base,
      localHour: SWEEP_HOURS.graceNotice,
      graceUsedRecently: true,
      members: base.members.map((m) => ({ ...m, devotionalDoneToday: true })),
    });
    expect(actions).toHaveLength(2);
    expect(actions.every((a) => a.category === 'streak_alert')).toBe(true);
    expect(actions[0].title).toMatch(/grace/i);
  });

  it('10am milestone fires on day-of and 3-days-out, not in between', () => {
    const milestones = [
      { title: 'Our anniversary', icon: '💍', event_date: '2026-07-19' }, // today
      { title: 'First date', icon: null, event_date: '2026-07-22' }, // 3 days
      { title: 'Wedding', icon: '💒', event_date: '2026-07-21' }, // 2 days — no
    ];
    const actions = planCoupleSweep({ ...base, localHour: SWEEP_HOURS.milestone, milestones });
    // 2 due milestones × 2 members
    expect(actions).toHaveLength(4);
    expect(actions.some((a) => a.title.includes('is today'))).toBe(true);
    expect(actions.some((a) => a.title.includes('in 3 days'))).toBe(true);
    expect(actions.some((a) => a.title.includes('Wedding'))).toBe(false);
    // Missing icon falls back rather than printing "null"
    expect(actions.some((a) => a.title.startsWith('🎉 First date'))).toBe(true);
  });

  it('12pm prayer digest counts shared requests and skips an empty list', () => {
    expect(
      planCoupleSweep({ ...base, localHour: SWEEP_HOURS.prayerDigest, activeSharedPrayers: 0 })
    ).toEqual([]);
    const actions = planCoupleSweep({
      ...base,
      localHour: SWEEP_HOURS.prayerDigest,
      activeSharedPrayers: 3,
    });
    expect(actions).toHaveLength(2);
    expect(actions[0].body).toBe('3 shared requests are waiting for you two.');
    const one = planCoupleSweep({
      ...base,
      localHour: SWEEP_HOURS.prayerDigest,
      activeSharedPrayers: 1,
    });
    expect(one[0].body).toBe('1 shared request is waiting for you two.');
  });

  it('check-in reminder fires ONLY on Sunday at 6pm, to members not yet in', () => {
    const wednesday = planCoupleSweep({ ...base, localHour: SWEEP_HOURS.checkInReminder });
    expect(wednesday).toEqual([]);
    const sunday = planCoupleSweep({
      ...base,
      localHour: SWEEP_HOURS.checkInReminder,
      localDow: 0,
    });
    expect(sunday).toHaveLength(1);
    expect(sunday[0].recipientId).toBe('a');
  });

  it(`7pm streak-at-risk needs a streak ≥ ${STREAK_RISK_MIN} and only nudges the missing member`, () => {
    expect(
      planCoupleSweep({ ...base, localHour: SWEEP_HOURS.streakAtRisk, streakCount: 2 })
    ).toEqual([]);
    const actions = planCoupleSweep({
      ...base,
      localHour: SWEEP_HOURS.streakAtRisk,
      streakCount: 5,
    });
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({ recipientId: 'a', category: 'streak_alert' });
    expect(actions[0].title).toContain('5-day streak');
  });
});

describe('daysUntil', () => {
  it('computes calendar-day differences from ymd strings', () => {
    expect(daysUntil('2026-07-22', '2026-07-19')).toBe(3);
    expect(daysUntil('2026-07-19', '2026-07-19')).toBe(0);
    expect(daysUntil('2026-07-18', '2026-07-19')).toBe(-1);
    expect(daysUntil('bad', '2026-07-19')).toBeNaN();
  });
});
