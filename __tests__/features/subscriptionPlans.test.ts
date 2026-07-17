// F1 — paywall plan + trial presentation data.
import {
  PLAN_OPTIONS,
  TRIAL_TIMELINE,
  TRIAL_DAYS,
  DEFAULT_PLAN,
  trialSubtitle,
} from '@/features/subscription/plans';

describe('subscription plans', () => {
  it('offers weekly + monthly + annual, with annual highlighted + the default', () => {
    expect(PLAN_OPTIONS.map((p) => p.id)).toEqual(['weekly', 'monthly', 'annual']);
    expect(PLAN_OPTIONS.find((p) => p.id === 'annual')?.highlight).toBe(true);
    expect(DEFAULT_PLAN).toBe('annual');
  });

  it('has a 3-step trial timeline ending on the trial-end day', () => {
    expect(TRIAL_TIMELINE).toHaveLength(3);
    expect(TRIAL_TIMELINE[2].title).toContain(`Day ${TRIAL_DAYS}`);
  });

  it('trialSubtitle always discloses no-charge-today + the renewing price', () => {
    const annual = trialSubtitle('annual');
    expect(annual).toContain('No charge today');
    expect(annual).toContain('$79.99/yr');
    expect(annual).toContain('cancel anytime');
    expect(trialSubtitle('monthly')).toContain('$12.99/mo');
    expect(trialSubtitle('weekly')).toContain('$6.99/wk');
  });
});
