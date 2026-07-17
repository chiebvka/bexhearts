import { countryFlag } from '@/lib/flags';

describe('countryFlag', () => {
  it('maps ISO codes to flag emoji', () => {
    expect(countryFlag('US')).toBe('🇺🇸');
    expect(countryFlag('ng')).toBe('🇳🇬');
    expect(countryFlag('GB')).toBe('🇬🇧');
  });

  it('falls back to a globe for missing or malformed codes', () => {
    expect(countryFlag(null)).toBe('🌍');
    expect(countryFlag(undefined)).toBe('🌍');
    expect(countryFlag('USA')).toBe('🌍');
    expect(countryFlag('1!')).toBe('🌍');
  });
});
