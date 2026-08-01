import {
  isCategoryEnabled,
  isInQuietHours,
  shouldDebouncePush,
  setCategoryPref,
  setQuietHoursEnabled,
  DEFAULT_QUIET_HOURS,
  PREF_ROWS,
} from '@/features/notifications/prefs';

describe('isCategoryEnabled (G1 — absent means ON)', () => {
  it('defaults every category to enabled when prefs are empty or missing', () => {
    for (const prefs of [undefined, null, {}] as const) {
      expect(isCategoryEnabled(prefs, 'partner_activity')).toBe(true);
      expect(isCategoryEnabled(prefs, 'daily_reminder')).toBe(true);
      expect(isCategoryEnabled(prefs, 'streak_alert')).toBe(true);
      expect(isCategoryEnabled(prefs, 'milestone')).toBe(true);
    }
  });

  it('respects an explicit false', () => {
    expect(isCategoryEnabled({ partner_activity: false }, 'partner_activity')).toBe(false);
    expect(isCategoryEnabled({ streak_alerts: false }, 'streak_alert')).toBe(false);
    // Other categories untouched by that pref
    expect(isCategoryEnabled({ partner_activity: false }, 'milestone')).toBe(true);
  });

  it("never mutes 'system' (account/security), even if someone tries", () => {
    expect(
      isCategoryEnabled(
        { partner_activity: false, daily_reminders: false } as never,
        'system'
      )
    ).toBe(true);
  });
});

describe('isInQuietHours (push suppressed, inbox still written)', () => {
  it('handles the overnight wrap (22 → 8)', () => {
    const prefs = { quiet_hours: { start: 22, end: 8 } };
    expect(isInQuietHours(prefs, 23)).toBe(true);
    expect(isInQuietHours(prefs, 2)).toBe(true);
    expect(isInQuietHours(prefs, 7)).toBe(true);
    expect(isInQuietHours(prefs, 8)).toBe(false);
    expect(isInQuietHours(prefs, 12)).toBe(false);
    expect(isInQuietHours(prefs, 21)).toBe(false);
  });

  it('handles a same-day window (13 → 15)', () => {
    const prefs = { quiet_hours: { start: 13, end: 15 } };
    expect(isInQuietHours(prefs, 13)).toBe(true);
    expect(isInQuietHours(prefs, 14)).toBe(true);
    expect(isInQuietHours(prefs, 15)).toBe(false);
    expect(isInQuietHours(prefs, 9)).toBe(false);
  });

  it('no window / degenerate window means never quiet', () => {
    expect(isInQuietHours({}, 3)).toBe(false);
    expect(isInQuietHours(null, 3)).toBe(false);
    expect(isInQuietHours({ quiet_hours: null }, 3)).toBe(false);
    expect(isInQuietHours({ quiet_hours: { start: 9, end: 9 } }, 9)).toBe(false);
  });
});

describe('shouldDebouncePush (G2 — one push per category per window)', () => {
  const now = new Date('2026-07-19T12:00:00Z');

  it('debounces partner_activity inside the 2h window', () => {
    expect(
      shouldDebouncePush('partner_activity', '2026-07-19T11:30:00Z', now)
    ).toBe(true);
    expect(
      shouldDebouncePush('partner_activity', '2026-07-19T09:59:00Z', now)
    ).toBe(false);
  });

  it('never debounces when nothing was pushed before or window is 0', () => {
    expect(shouldDebouncePush('partner_activity', null, now)).toBe(false);
    expect(shouldDebouncePush('streak_alert', '2026-07-19T11:59:00Z', now)).toBe(false);
    expect(shouldDebouncePush('system', '2026-07-19T11:59:00Z', now)).toBe(false);
  });

  it('treats malformed timestamps as not debounced', () => {
    expect(shouldDebouncePush('partner_activity', 'not-a-date', now)).toBe(false);
  });
});

describe('G4 settings helpers', () => {
  it('setCategoryPref merges immutably and only touches its key', () => {
    const prefs = { daily_reminders: true, quiet_hours: { start: 22, end: 8 } };
    const next = setCategoryPref(prefs, 'streak_alerts', false);
    expect(next.streak_alerts).toBe(false);
    expect(next.daily_reminders).toBe(true);
    expect(next.quiet_hours).toEqual({ start: 22, end: 8 });
    expect(prefs).not.toHaveProperty('streak_alerts'); // original untouched
    // From empty/null prefs too
    expect(setCategoryPref(null, 'partner_activity', false)).toEqual({
      partner_activity: false,
    });
  });

  it('setQuietHoursEnabled toggles the fixed 22→8 window', () => {
    expect(setQuietHoursEnabled(null, true).quiet_hours).toEqual(DEFAULT_QUIET_HOURS);
    expect(setQuietHoursEnabled({ quiet_hours: DEFAULT_QUIET_HOURS }, false).quiet_hours).toBeNull();
  });

  it('a toggled-off category is honored by the enforcement gate', () => {
    const next = setCategoryPref({}, 'milestones', false);
    expect(isCategoryEnabled(next, 'milestone')).toBe(false);
    expect(isCategoryEnabled(setCategoryPref(next, 'milestones', true), 'milestone')).toBe(true);
  });

  it('every PREF_ROW key is a real prefs key', () => {
    for (const row of PREF_ROWS) {
      const next = setCategoryPref({}, row.key, false);
      expect(next[row.key]).toBe(false);
    }
  });
});
