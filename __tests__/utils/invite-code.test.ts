import {
  generateInviteCode,
  isValidInviteCode,
  formatInviteCode,
  withUniqueInviteCode,
  INVITE_CODE_UNIQUE_VIOLATION,
} from '@/utils/invite-code';

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

describe('withUniqueInviteCode (C2·M1 collision retry)', () => {
  it('returns the code + data on first success', async () => {
    const persist = jest.fn(async () => ({ data: { id: 'c1' }, error: null }));
    const { code, data } = await withUniqueInviteCode(persist);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(code).toHaveLength(6);
    expect(data).toEqual({ id: 'c1' });
  });

  it('regenerates + retries on a unique-violation, then succeeds', async () => {
    let calls = 0;
    const persist = jest.fn(async () => {
      calls += 1;
      return calls < 3
        ? { data: null, error: { code: INVITE_CODE_UNIQUE_VIOLATION } }
        : { data: { id: 'c1' }, error: null };
    });
    const { data } = await withUniqueInviteCode(persist);
    expect(persist).toHaveBeenCalledTimes(3);
    expect(data).toEqual({ id: 'c1' });
  });

  it('rethrows non-collision errors immediately', async () => {
    const err = { code: '42501' }; // insufficient_privilege
    const persist = jest.fn(async () => ({ data: null, error: err }));
    await expect(withUniqueInviteCode(persist)).rejects.toBe(err);
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it('gives up after the attempt limit', async () => {
    const persist = jest.fn(async () => ({
      data: null,
      error: { code: INVITE_CODE_UNIQUE_VIOLATION },
    }));
    await expect(withUniqueInviteCode(persist, 3)).rejects.toThrow(
      /unique invite code/i
    );
    expect(persist).toHaveBeenCalledTimes(3);
  });
});
