// D6 — streak transition + day-state logic (mirrors the SQL trigger 00012).
import {
  computeStreakTransition,
  getStreakDayState,
  type StreakState,
} from '@/features/dashboard/streak';

const base: StreakState = {
  streakCount: 5,
  lastDate: '2026-07-01', // a Wednesday
  graceRemaining: 1,
  graceWeek: '2026-06-28', // week of (Sunday) for 2026-07-01
};

describe('computeStreakTransition', () => {
  it('increments on a consecutive day', () => {
    const next = computeStreakTransition(base, '2026-07-02');
    expect(next.streakCount).toBe(6);
    expect(next.lastDate).toBe('2026-07-02');
  });

  it('is a no-op when already counted today', () => {
    const next = computeStreakTransition(base, '2026-07-01');
    expect(next).toEqual(base);
  });

  it('starts at 1 for the first ever completion', () => {
    const next = computeStreakTransition(
      { streakCount: 0, lastDate: null, graceRemaining: 1, graceWeek: null },
      '2026-07-01'
    );
    expect(next.streakCount).toBe(1);
    expect(next.lastDate).toBe('2026-07-01');
  });

  it('a single missed day is covered by grace (streak continues, grace consumed)', () => {
    // last Wed 07-01, come back Fri 07-03 → missed Thu (1 day)
    const next = computeStreakTransition(base, '2026-07-03');
    expect(next.streakCount).toBe(6);
    expect(next.graceRemaining).toBe(0);
  });

  it('resets when a single day is missed but no grace remains', () => {
    const noGrace = { ...base, graceRemaining: 0 };
    const next = computeStreakTransition(noGrace, '2026-07-03');
    expect(next.streakCount).toBe(1);
    expect(next.graceRemaining).toBe(0);
  });

  it('resets when two or more days are missed even with grace', () => {
    // last Wed 07-01, come back Sun 07-05 → missed Thu+Fri+Sat
    const next = computeStreakTransition(base, '2026-07-05');
    expect(next.streakCount).toBe(1);
  });

  it('refills grace at the start of a new week', () => {
    // graceWeek is 2026-06-28; 2026-07-05 is a Sunday → new week → refill to 1,
    // then it is spent covering... but here the gap is 4 (>=2) so it resets and
    // grace stays refilled at 1 (not consumed).
    const spent = { ...base, graceRemaining: 0 };
    const next = computeStreakTransition(spent, '2026-07-05');
    expect(next.graceWeek).toBe('2026-07-05');
    expect(next.graceRemaining).toBe(1);
  });
});

describe('getStreakDayState', () => {
  it('solo: complete when the one user is done, else none', () => {
    expect(getStreakDayState({ isLinked: false, myDone: true, partnerDone: false })).toBe(
      'complete'
    );
    expect(getStreakDayState({ isLinked: false, myDone: false, partnerDone: false })).toBe(
      'none'
    );
  });

  it('linked: reveals who the streak is waiting on', () => {
    expect(getStreakDayState({ isLinked: true, myDone: true, partnerDone: true })).toBe(
      'complete'
    );
    expect(getStreakDayState({ isLinked: true, myDone: true, partnerDone: false })).toBe(
      'waiting-partner'
    );
    expect(getStreakDayState({ isLinked: true, myDone: false, partnerDone: true })).toBe(
      'waiting-you'
    );
    expect(getStreakDayState({ isLinked: true, myDone: false, partnerDone: false })).toBe(
      'none'
    );
  });
});
