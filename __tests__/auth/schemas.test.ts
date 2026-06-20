import { otpSchema, signUpSchema } from '@/features/auth/schemas';

describe('otpSchema', () => {
  it('accepts a 6-digit code', () => {
    expect(otpSchema.safeParse({ token: '123456' }).success).toBe(true);
  });

  it('trims surrounding whitespace', () => {
    expect(otpSchema.safeParse({ token: ' 123456 ' }).success).toBe(true);
  });

  it('rejects codes that are not exactly 6 digits', () => {
    expect(otpSchema.safeParse({ token: '12345' }).success).toBe(false);
    expect(otpSchema.safeParse({ token: '1234567' }).success).toBe(false);
    expect(otpSchema.safeParse({ token: 'abcdef' }).success).toBe(false);
  });
});

describe('signUpSchema', () => {
  const base = { email: 'a@b.com', password: 'Password1' };

  it('accepts matching valid input', () => {
    expect(
      signUpSchema.safeParse({ ...base, confirmPassword: 'Password1' }).success
    ).toBe(true);
  });

  it('rejects when passwords do not match', () => {
    expect(
      signUpSchema.safeParse({ ...base, confirmPassword: 'Password2' }).success
    ).toBe(false);
  });

  it('rejects a weak password (no uppercase/number)', () => {
    expect(
      signUpSchema.safeParse({
        email: 'a@b.com',
        password: 'password',
        confirmPassword: 'password',
      }).success
    ).toBe(false);
  });
});
