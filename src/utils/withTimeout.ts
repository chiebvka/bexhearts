// Bound a promise: reject with `message` if it doesn't settle within `ms`.
// Auth flows use this so a promise that never settles (a wedged SecureStore
// call, a dead fetch) surfaces as an error instead of pinning a spinner forever.
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = 'timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}
