import {
  sanitizeProperties,
  ALLOWED_PROPERTY_KEYS,
  MAX_TOKEN_LENGTH,
} from '@/features/analytics/schema';
import {
  resolveRetention,
  toLocalDateKey,
  daysBetween,
  EMPTY_RETENTION_STATE,
  type RetentionState,
} from '@/features/analytics/retention';
import { ONBOARDING_STEPS, ANALYTICS_EVENTS } from '@/constants/events';

// The owner's hard constraint (2026-07-26): analytics events are STRUCTURAL
// ONLY — never prayer text, journal content, check-in notes or names.
// These tests are the enforcement of that promise, not a description of it.
describe('analytics — structural-only guard', () => {
  it('drops content-bearing keys outright', () => {
    const clean = sanitizeProperties({
      prayer_body: 'Please heal my mother, she has been unwell for weeks',
      journal_entry: 'Today we argued about money and then prayed together',
      note: 'I struggle with this',
      title: 'Our first anniversary',
      name: 'Bexoni',
      full_name: 'AJ Okafor',
      email: 'someone@example.com',
      partner_name: 'Tony',
    });

    expect(clean).toEqual({});
  });

  it('keeps allowlisted structural properties', () => {
    expect(
      sanitizeProperties({
        plan: 'annual',
        step: 'paywall',
        step_index: 5,
        is_first_open: false,
        days_since_first_open: 7,
      })
    ).toEqual({
      plan: 'annual',
      step: 'paywall',
      step_index: 5,
      is_first_open: false,
      days_since_first_open: 7,
    });
  });

  it('rejects an off-enum value even on an allowlisted key', () => {
    // The most realistic leak: someone passes a human-readable label through a
    // key that looks harmless.
    expect(sanitizeProperties({ plan: 'Annual — best value for both of you' })).toEqual({});
    expect(sanitizeProperties({ step: 'the screen where they pick a photo' })).toEqual({});
    expect(sanitizeProperties({ role: 'husband' })).toEqual({});
  });

  it('rejects prose on allowlisted keys that have no enum', () => {
    // `source` has no closed set, so the token rules are the only defence:
    // whitespace and length. A sentence fails both.
    expect(sanitizeProperties({ source: 'she found us through her small group' })).toEqual({});
    expect(sanitizeProperties({ source: 'a'.repeat(MAX_TOKEN_LENGTH + 1) })).toEqual({});
    expect(sanitizeProperties({ source: 'tiktok_bio' })).toEqual({ source: 'tiktok_bio' });
  });

  it('drops null, undefined, objects and arrays', () => {
    expect(
      sanitizeProperties({
        plan: null,
        step: undefined,
        count: { nested: 1 },
        reason: ['comp'],
      })
    ).toEqual({});
  });

  it('handles no properties at all', () => {
    expect(sanitizeProperties()).toEqual({});
    expect(sanitizeProperties(null)).toEqual({});
  });

  it('rejects NaN and Infinity on numeric keys', () => {
    expect(sanitizeProperties({ count: NaN, step_index: Infinity })).toEqual({});
  });

  it('has no content-shaped key in the allowlist', () => {
    // A guard on the guard: if someone adds `note` or `body` to the allowlist,
    // this fails before it can ship.
    const forbidden = ['note', 'body', 'text', 'content', 'title', 'name', 'email', 'message'];
    for (const key of forbidden) {
      expect(ALLOWED_PROPERTY_KEYS).not.toContain(key);
    }
  });

  it('accepts every onboarding step name the app can emit', () => {
    for (const step of ONBOARDING_STEPS) {
      expect(sanitizeProperties({ step })).toEqual({ step });
    }
  });
});

describe('analytics — D1/D7 retention milestones', () => {
  const fresh = (): RetentionState => ({ ...EMPTY_RETENTION_STATE, fired: [] });

  it('records the first open without firing a milestone', () => {
    const out = resolveRetention(fresh(), '2026-07-26');

    expect(out.isFirstOpen).toBe(true);
    expect(out.daysSinceFirstOpen).toBe(0);
    expect(out.events).toEqual([]);
    expect(out.next.firstOpenDate).toBe('2026-07-26');
  });

  it('fires d1_returned the next calendar day, once', () => {
    const day1 = resolveRetention({ firstOpenDate: '2026-07-26', fired: [] }, '2026-07-27');
    expect(day1.events).toEqual([ANALYTICS_EVENTS.D1_RETURNED]);

    // Re-opening later the same day must not re-fire it.
    const again = resolveRetention(day1.next, '2026-07-27');
    expect(again.events).toEqual([]);
  });

  it('fires d7_returned on day 7 and beyond', () => {
    const out = resolveRetention({ firstOpenDate: '2026-07-26', fired: ['d1'] }, '2026-08-02');
    expect(out.events).toEqual([ANALYTICS_EVENTS.D7_RETURNED]);
    expect(out.daysSinceFirstOpen).toBe(7);
  });

  it('fires both when the first return is a week later', () => {
    // Someone installs, ignores the app, comes back on day 9: they DID return
    // at d1's threshold and d7's, so both steps count — otherwise the funnel
    // undercounts exactly the returners we most want to see.
    const out = resolveRetention({ firstOpenDate: '2026-07-26', fired: [] }, '2026-08-04');
    expect(out.events).toEqual([ANALYTICS_EVENTS.D1_RETURNED, ANALYTICS_EVENTS.D7_RETURNED]);
    expect(out.next.fired).toEqual(['d1', 'd7']);
  });

  it('never fires on a backwards clock', () => {
    // Crossing the date line westward, or a manual clock change.
    const out = resolveRetention({ firstOpenDate: '2026-07-26', fired: [] }, '2026-07-25');
    expect(out.events).toEqual([]);
    expect(out.daysSinceFirstOpen).toBe(0);
  });

  it('survives a corrupt stored date without throwing', () => {
    const out = resolveRetention({ firstOpenDate: 'not-a-date', fired: [] }, '2026-07-26');
    expect(out.events).toEqual([]);
    expect(out.daysSinceFirstOpen).toBe(0);
  });

  it('uses the DEVICE-local calendar day, not UTC', () => {
    // 11pm local on the 26th is still the 26th, even though it's the 27th in
    // UTC — otherwise a night-time user "returns" a day early every evening.
    const lateEvening = new Date(2026, 6, 26, 23, 30);
    expect(toLocalDateKey(lateEvening)).toBe('2026-07-26');
  });

  it('counts whole days across a month boundary', () => {
    expect(daysBetween('2026-07-26', '2026-08-02')).toBe(7);
    expect(daysBetween('2026-02-27', '2026-03-01')).toBe(2); // 2026 is not a leap year
  });

  it('round-trips through JSON (the H2 persisted-state rule)', () => {
    const out = resolveRetention(fresh(), '2026-07-26');
    expect(JSON.parse(JSON.stringify(out.next))).toEqual(out.next);
  });
});
