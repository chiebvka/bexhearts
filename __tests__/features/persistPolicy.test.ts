import {
  isPersistableKey,
  isJsonRoundTrippable,
  shouldPersistQuery,
} from '@/features/cache/persistPolicy';

// Regression guard for the 2026-07-25 crash: the persisted query cache is
// JSON, so a Map came back from a cold start as `{}` and the date Ideas list
// died on `aggregates?.get(...)`. These tests fail if a non-round-trippable
// shape is ever handed to the persister again.

describe('isJsonRoundTrippable', () => {
  it('accepts the shapes the API layer actually returns', () => {
    expect(isJsonRoundTrippable({ 'idea-1': { avg_rating: 4.6, couples_count: 12 } })).toBe(
      true
    );
    expect(isJsonRoundTrippable([{ id: 'a', nested: { ok: true } }])).toBe(true);
    expect(isJsonRoundTrippable('text')).toBe(true);
    expect(isJsonRoundTrippable(42)).toBe(true);
    expect(isJsonRoundTrippable(null)).toBe(true);
    expect(isJsonRoundTrippable(undefined)).toBe(true);
  });

  it('rejects a Map — the exact shape that shipped the crash', () => {
    const aggregates = new Map([['idea-1', { avg_rating: 4.6 }]]);
    expect(isJsonRoundTrippable(aggregates)).toBe(false);
    // Proof of why: the Map really does stringify to nothing usable.
    expect(JSON.parse(JSON.stringify(aggregates))).toEqual({});
  });

  it('rejects Sets, Dates, class instances and functions, nested or not', () => {
    expect(isJsonRoundTrippable(new Set(['a']))).toBe(false);
    expect(isJsonRoundTrippable(new Date())).toBe(false);
    expect(isJsonRoundTrippable(() => {})).toBe(false);
    expect(isJsonRoundTrippable({ deep: { inner: new Map() } })).toBe(false);
    expect(isJsonRoundTrippable([{ ok: true }, new Set()])).toBe(false);
  });
});

describe('isPersistableKey', () => {
  it('keeps entitlement + offerings off disk (stale premium / stale prices)', () => {
    expect(isPersistableKey(['entitlement', 'premium'])).toBe(false);
    expect(isPersistableKey(['offerings'])).toBe(false);
  });

  it('allows the content queries the offline cold start depends on', () => {
    expect(isPersistableKey(['devotionals', 'today'])).toBe(true);
    expect(isPersistableKey(['journal', 'couple-1', 'timeline'])).toBe(true);
    expect(isPersistableKey(['activity', 'couple-1'])).toBe(true);
    expect(isPersistableKey(['couple', 'mine'])).toBe(true);
  });
});

describe('shouldPersistQuery', () => {
  it('requires both a persistable key and a round-trippable value', () => {
    expect(shouldPersistQuery(['date-ideas', 'aggregates'], { a: { avg_rating: 5 } })).toBe(
      true
    );
    expect(shouldPersistQuery(['date-ideas', 'aggregates'], new Map())).toBe(false);
    expect(shouldPersistQuery(['entitlement', 'premium'], true)).toBe(false);
  });
});
