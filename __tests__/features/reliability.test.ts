import { resizeSpec, MAX_UPLOAD_DIMENSION } from '@/lib/imageCompression';
import { friendlyMutationError } from '@/lib/errors';
import { sentryEnabled } from '@/services/sentry';

describe('resizeSpec (H2·M1)', () => {
  it('shrinks the longer side to the cap, preserving orientation', () => {
    expect(resizeSpec(4000, 3000)).toEqual({ width: MAX_UPLOAD_DIMENSION });
    expect(resizeSpec(3000, 4000)).toEqual({ height: MAX_UPLOAD_DIMENSION });
  });

  it('never upscales small images', () => {
    expect(resizeSpec(800, 600)).toBeNull();
    expect(resizeSpec(1600, 1600)).toBeNull();
  });

  it('caps defensively when dimensions are unknown', () => {
    expect(resizeSpec(undefined, undefined)).toEqual({ width: MAX_UPLOAD_DIMENSION });
  });
});

describe('friendlyMutationError (H2·M4)', () => {
  it('frames network-ish failures as offline', () => {
    expect(friendlyMutationError(new Error('Network request failed'))).toMatch(/offline/);
    expect(friendlyMutationError(new Error('fetch failed'))).toMatch(/offline/);
    expect(friendlyMutationError(new Error('Request timed out'))).toMatch(/offline/);
  });

  it('never leaks raw driver text for other errors', () => {
    const message = friendlyMutationError(
      new Error('duplicate key value violates unique constraint "prayers_pkey"')
    );
    expect(message).toBe("Something didn't save. Please try again.");
    expect(friendlyMutationError(undefined)).toBe("Something didn't save. Please try again.");
  });
});

describe('sentryEnabled (H2·M5)', () => {
  it('requires a real https DSN outside Expo Go', () => {
    expect(sentryEnabled('https://abc@o1.ingest.sentry.io/1', false)).toBe(true);
  });

  it('stays off for placeholders, missing keys, and Expo Go', () => {
    expect(sentryEnabled('your-sentry-dsn', false)).toBe(false);
    expect(sentryEnabled(undefined, false)).toBe(false);
    expect(sentryEnabled('', false)).toBe(false);
    expect(sentryEnabled('https://abc@o1.ingest.sentry.io/1', true)).toBe(false);
  });
});
