// D3·M3 — weekly check-in comparison gating.
import {
  getCheckInComparisonState,
  hasSubmitted,
  getVisiblePartnerNotes,
} from '@/features/check-in/comparison';

describe('hasSubmitted', () => {
  it('is false for a missing check-in', () => {
    expect(hasSubmitted(null)).toBe(false);
    expect(hasSubmitted(undefined)).toBe(false);
  });

  it('is true once a check-in row exists', () => {
    expect(hasSubmitted({ id: 'c1' })).toBe(true);
  });
});

describe('getCheckInComparisonState', () => {
  const submitted = { id: 'c1' };

  it('is locked when no partner is linked', () => {
    expect(
      getCheckInComparisonState({ isLinked: false, mine: submitted, partner: submitted })
    ).toBe('locked');
  });

  it('awaits self when the user has not submitted', () => {
    expect(
      getCheckInComparisonState({ isLinked: true, mine: null, partner: submitted })
    ).toBe('await-self');
  });

  it('awaits partner when only the user has submitted', () => {
    expect(
      getCheckInComparisonState({ isLinked: true, mine: submitted, partner: null })
    ).toBe('await-partner');
  });

  it('reveals once both have submitted', () => {
    expect(
      getCheckInComparisonState({ isLinked: true, mine: submitted, partner: submitted })
    ).toBe('revealed');
  });
});

describe('getVisiblePartnerNotes (D3 sharing)', () => {
  const base = {
    gratitude_note: 'You made me laugh all week',
    growth_area: 'Patience',
    prayer_request: 'My job interview',
  };

  it('gratitude is always revealed; growth/prayer only when shared', () => {
    const notes = getVisiblePartnerNotes({
      ...base,
      share_growth_note: false,
      share_prayer_request: false,
    });
    expect(notes.gratitude).toBe('You made me laugh all week');
    expect(notes.growth).toBeNull();
    expect(notes.prayer).toBeNull();
  });

  it('share toggles expose the private fields', () => {
    const notes = getVisiblePartnerNotes({
      ...base,
      share_growth_note: true,
      share_prayer_request: true,
    });
    expect(notes.growth).toBe('Patience');
    expect(notes.prayer).toBe('My job interview');
  });

  it('blank/whitespace notes and missing partner rows yield nothing', () => {
    expect(getVisiblePartnerNotes(null)).toEqual({ gratitude: null, growth: null, prayer: null });
    expect(
      getVisiblePartnerNotes({ gratitude_note: '  ', share_growth_note: true, growth_area: '' })
        .gratitude
    ).toBeNull();
  });
});
