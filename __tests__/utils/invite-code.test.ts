import { generateInviteCode, isValidInviteCode, formatInviteCode } from '@/utils/invite-code';

describe('generateInviteCode', () => {
  it('generates a code of the correct length', () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(6);
  });

  it('generates a code with only valid characters', () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]+$/);
  });

  it('does not contain ambiguous characters', () => {
    // Generate many codes to increase confidence
    for (let i = 0; i < 100; i++) {
      const code = generateInviteCode();
      expect(code).not.toMatch(/[O0I1L]/);
    }
  });

  it('respects custom length', () => {
    const code = generateInviteCode(8);
    expect(code).toHaveLength(8);
  });
});

describe('isValidInviteCode', () => {
  it('validates a correct code', () => {
    expect(isValidInviteCode('ABC234')).toBe(true);
  });

  it('validates lowercase input', () => {
    expect(isValidInviteCode('abc234')).toBe(true);
  });

  it('rejects too short', () => {
    expect(isValidInviteCode('ABC')).toBe(false);
  });

  it('rejects too long', () => {
    expect(isValidInviteCode('ABCDEFG')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidInviteCode('')).toBe(false);
  });
});

describe('formatInviteCode', () => {
  it('formats with a dash in the middle', () => {
    expect(formatInviteCode('ABCDEF')).toBe('ABC-DEF');
  });

  it('uppercases input', () => {
    expect(formatInviteCode('abcdef')).toBe('ABC-DEF');
  });

  it('returns short codes as-is', () => {
    expect(formatInviteCode('ABC')).toBe('ABC');
  });
});
