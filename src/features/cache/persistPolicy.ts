// H2·M3 — what may be written to the on-disk query cache.
//
// TWO RULES, both learned the hard way (2026-07-25):
//   1. Anything persisted must survive a JSON round-trip. The cache is
//      stringified, so a Map/Set silently returns as `{}` on the next cold
//      start — that shipped as a crash on the date Ideas list
//      (`aggregates?.get is not a function`).
//   2. Live entitlement/pricing state must NOT be persisted. A day-old
//      "premium: true" restored from disk would unlock paid features after a
//      subscription lapsed, and stale store offerings would show wrong prices.
//
// Kept as pure predicates so both are unit-testable without a QueryClient.

// Query-key roots that are deliberately never written to disk.
export const NON_PERSISTED_KEY_ROOTS = ['entitlement', 'offerings'] as const;

export function isPersistableKey(queryKey: readonly unknown[]): boolean {
  const root = queryKey[0];
  return !NON_PERSISTED_KEY_ROOTS.includes(root as (typeof NON_PERSISTED_KEY_ROOTS)[number]);
}

// True when `value` means the same thing after JSON.stringify → JSON.parse.
// Maps, Sets, class instances and functions do not; plain objects, arrays and
// primitives do. Used to refuse to persist a shape that would come back wrong.
export function isJsonRoundTrippable(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') return true;
  if (type === 'function' || type === 'symbol' || type === 'bigint') return false;
  if (Array.isArray(value)) return value.every(isJsonRoundTrippable);
  if (type === 'object') {
    // Maps/Sets/Dates and any other exotic object stringify to something the
    // app can't use again ({} or a bare string).
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) return false;
    return Object.values(value as Record<string, unknown>).every(isJsonRoundTrippable);
  }
  return false;
}

// The persister's gate: skip anything sensitive or non-round-trippable rather
// than writing a value that will deserialize into a different shape.
export function shouldPersistQuery(queryKey: readonly unknown[], data: unknown): boolean {
  return isPersistableKey(queryKey) && isJsonRoundTrippable(data);
}
