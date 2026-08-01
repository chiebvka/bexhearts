import {
  getCountry,
  ideaCountries,
  isGlobal,
  countryRatingLabel,
  passportCountries,
  passportProgress,
  PASSPORT_TARGET,
  GLOBAL_TAG,
} from '@/features/dates/countries';

describe('getCountry / ideaCountries (E13 tags)', () => {
  it('resolves known codes to a name + flag, case-insensitively', () => {
    expect(getCountry('NG')).toEqual({ code: 'NG', name: 'Nigeria', flag: '🇳🇬' });
    expect(getCountry('ng').name).toBe('Nigeria');
  });

  it('degrades gracefully for an unknown code rather than breaking the row', () => {
    expect(getCountry('ZZ')).toEqual({ code: 'ZZ', name: 'ZZ', flag: '📍' });
  });

  it('shows a single Anywhere chip when an idea has no tags', () => {
    expect(ideaCountries([])).toEqual([GLOBAL_TAG]);
    expect(ideaCountries(null)).toEqual([GLOBAL_TAG]);
    expect(isGlobal([])).toBe(true);
  });

  it('maps every tag on a regional idea', () => {
    const countries = ideaCountries(['NG', 'GH']);
    expect(countries.map((c) => c.name)).toEqual(['Nigeria', 'Ghana']);
    expect(isGlobal(['NG'])).toBe(false);
  });
});

describe('countryRatingLabel', () => {
  it('reads naturally with ratings, singular and plural', () => {
    expect(countryRatingLabel({ avg_rating: 4.6, couples_count: 12 }, 'Nigeria')).toBe(
      '★4.6 from 12 couples in Nigeria'
    );
    expect(countryRatingLabel({ avg_rating: 5, couples_count: 1 }, 'Kenya')).toBe(
      '★5 from 1 couple in Kenya'
    );
  });

  it('invites the first rating instead of showing an empty stat', () => {
    expect(countryRatingLabel(undefined, 'Brazil')).toBe(
      'No couples in Brazil have rated this yet — you could be first.'
    );
    expect(countryRatingLabel({ avg_rating: 0, couples_count: 0 }, 'Brazil')).toMatch(
      /could be first/
    );
  });
});

describe('passport badge (E13 — a badge, never a prize)', () => {
  const date = (completed: boolean, tags: string[]) => ({
    completed_at: completed ? '2026-07-01T00:00:00Z' : null,
    date_ideas: { country_tags: tags },
  });

  it('counts distinct countries from COMPLETED dates only', () => {
    const dates = [
      date(true, ['NG']),
      date(true, ['NG', 'GH']),
      date(false, ['IN']), // saved but never done — doesn't count
    ];
    expect(passportCountries(dates)).toEqual(['GH', 'NG']);
  });

  it('ignores global ideas — the badge is about reaching outside your context', () => {
    expect(passportCountries([date(true, []), date(true, ['MX'])])).toEqual(['MX']);
  });

  it('tracks progress then flips to earned at the target', () => {
    const two = [date(true, ['NG']), date(true, ['IN'])];
    expect(passportProgress(two)).toMatchObject({
      count: 2,
      earned: false,
      label: `Passport 🌍 — 2/${PASSPORT_TARGET} countries`,
    });

    const three = [...two, date(true, ['BR'])];
    expect(passportProgress(three)).toMatchObject({
      count: 3,
      earned: true,
      label: 'Passport 🌍 — dates from 3 countries',
    });
  });

  it('handles an empty/absent history', () => {
    expect(passportProgress(undefined).count).toBe(0);
    expect(passportProgress([]).earned).toBe(false);
  });
});
