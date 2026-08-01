// Analytics property schema — the enforcement point for the owner's hard
// constraint (2026-07-26): **events are STRUCTURAL ONLY**. Never a prayer
// body, a journal entry, a check-in note, a partner's name, an email.
//
// Religious practice is sensitive-category data. A code review can't be the
// only thing standing between a careless `track('x', { note })` and PostHog,
// so the guard is mechanical and runs on every event:
//
//   1. KEY ALLOWLIST — a property key not listed here is DROPPED. Free text
//      never has a home to travel in, because `note`/`title`/`name`/`body`
//      are not keys we accept.
//   2. VALUE RULES — allowlisted keys still only accept booleans, finite
//      numbers, and short structural tokens (an enum where one exists,
//      otherwise a slug). A sentence cannot pass: spaces are rejected.
//
// Adding a property means adding it HERE first, which is exactly the moment
// to ask "is this structural?".

/** Values a property is allowed to carry once it passes the key allowlist. */
export type AnalyticsValue = string | number | boolean;

/** Every property key the app may send. Anything else is dropped silently. */
export const ALLOWED_PROPERTY_KEYS = [
  'app_env',
  'plan',
  'placement',
  'step',
  'step_index',
  'step_count',
  'role',
  'method',
  'result',
  'source',
  'day_number',
  'days_since_first_open',
  'is_first_open',
  'relationship_stage',
  'is_long_distance',
  'has_partner',
  'is_entitled',
  'count',
  'reason',
] as const;

export type AnalyticsPropertyKey = (typeof ALLOWED_PROPERTY_KEYS)[number];

/**
 * Keys whose string values are a CLOSED set. Anything outside it is dropped —
 * these are the keys most likely to be handed a user-supplied string by
 * mistake (a plan label, a step name typed by hand).
 */
export const PROPERTY_ENUMS: Partial<Record<AnalyticsPropertyKey, readonly string[]>> = {
  app_env: ['development', 'production'],
  plan: ['annual', 'monthly', 'weekly'],
  placement: ['onboarding', 'gate', 'settings'],
  step: [
    'welcome',
    'profile_setup',
    'relationship_stage',
    'personalize',
    'plan_summary',
    'paywall',
    'partner_invite',
    'team',
  ],
  role: ['inviter', 'joiner'],
  method: ['email', 'apple', 'google'],
  result: ['success', 'cancelled', 'failed', 'nothing_to_restore'],
  relationship_stage: ['dating', 'engaged', 'married'],
  reason: ['comp', 'revenuecat'],
};

/** Max length for a free-form structural token (a slug, never a sentence). */
export const MAX_TOKEN_LENGTH = 40;

/** Structural tokens only: no whitespace, no punctuation beyond `_.:-`. */
const TOKEN_PATTERN = /^[A-Za-z0-9_.:-]+$/;

function isAllowedKey(key: string): key is AnalyticsPropertyKey {
  return (ALLOWED_PROPERTY_KEYS as readonly string[]).includes(key);
}

function isAllowedValue(key: AnalyticsPropertyKey, value: unknown): value is AnalyticsValue {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string') return false;

  const allowed = PROPERTY_ENUMS[key];
  if (allowed) return allowed.includes(value);
  return value.length > 0 && value.length <= MAX_TOKEN_LENGTH && TOKEN_PATTERN.test(value);
}

/**
 * Strip an event's properties down to what is provably structural.
 * Returns a NEW object; unknown keys and non-conforming values are dropped
 * rather than throwing, so a mistake degrades to a thinner event, never to a
 * crash in a user's session and never to a leak.
 */
export function sanitizeProperties(
  properties?: Record<string, unknown> | null
): Record<string, AnalyticsValue> {
  if (!properties) return {};
  const clean: Record<string, AnalyticsValue> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined) continue;
    if (!isAllowedKey(key)) continue;
    if (!isAllowedValue(key, value)) continue;
    clean[key] = value;
  }
  return clean;
}
