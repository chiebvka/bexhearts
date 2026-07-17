import { withTimeout } from '@/utils/withTimeout';

describe('withTimeout', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('resolves with the promise value when it settles in time', async () => {
    const result = withTimeout(Promise.resolve('ok'), 1000);
    await expect(result).resolves.toBe('ok');
  });

  it('propagates a rejection from the wrapped promise', async () => {
    const result = withTimeout(Promise.reject(new Error('boom')), 1000);
    await expect(result).rejects.toThrow('boom');
  });

  it('rejects when the promise never settles', async () => {
    const never = new Promise<string>(() => {});
    const result = withTimeout(never, 1000);
    jest.advanceTimersByTime(1001);
    await expect(result).rejects.toThrow('timeout');
  });

  it('uses the custom message on timeout', async () => {
    const never = new Promise<string>(() => {});
    const result = withTimeout(never, 500, 'Check your connection.');
    jest.advanceTimersByTime(501);
    await expect(result).rejects.toThrow('Check your connection.');
  });
});
