import {
  STREAK_RULES,
  POINT_VALUES,
  POINTS_NOTE,
  REWARDS_NOTE,
  ONBOARDING_STREAK_BEATS,
  PARTNER_INVITE_BEAT,
  TEAM_MOMENT_RULES,
} from '@/features/how-it-works/content';

describe('how-it-works content (E8, owner-locked 2026-07-18)', () => {
  it('mirrors the 00017 points trigger values exactly', () => {
    const values = Object.fromEntries(POINT_VALUES.map((v) => [v.type, v.points]));
    expect(values).toEqual({
      date_completed: 25,
      check_in: 20,
      prayer_session: 15,
      devotional: 10,
      journal: 10,
      date_rated: 5,
    });
  });

  it('lists point values highest-first so the table scans well', () => {
    const points = POINT_VALUES.map((v) => v.points);
    expect([...points].sort((a, b) => b - a)).toEqual(points);
  });

  it('covers the four locked streak rules (both-partners, grace, timezone, solo carry-over)', () => {
    expect(STREAK_RULES).toHaveLength(4);
    const bodies = STREAK_RULES.map((r) => `${r.title} ${r.body}`.toLowerCase());
    expect(bodies.some((b) => b.includes('both'))).toBe(true);
    expect(bodies.some((b) => b.includes('grace'))).toBe(true);
    expect(bodies.some((b) => b.includes('timezone'))).toBe(true);
    expect(bodies.some((b) => b.includes('carry over'))).toBe(true);
  });

  it('keeps onboarding beats concise (owner: brief, one line each)', () => {
    expect(ONBOARDING_STREAK_BEATS).toHaveLength(3);
    for (const beat of ONBOARDING_STREAK_BEATS) {
      expect(beat.length).toBeGreaterThan(0);
      expect(beat.length).toBeLessThanOrEqual(80);
    }
    expect(PARTNER_INVITE_BEAT.length).toBeLessThanOrEqual(80);
  });

  it('keeps the team moment to two rules max', () => {
    expect(TEAM_MOMENT_RULES.length).toBeLessThanOrEqual(2);
    for (const rule of TEAM_MOMENT_RULES) {
      expect(rule.body.length).toBeGreaterThan(0);
    }
  });

  it('stays honest about rewards (no specific promises)', () => {
    expect(REWARDS_NOTE).not.toMatch(/\$|getaway|trip|gift card/i);
    expect(POINTS_NOTE).toMatch(/once per person per day/i);
  });
});
