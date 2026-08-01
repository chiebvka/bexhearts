import AsyncStorage from '@react-native-async-storage/async-storage';
import { posthog, analyticsConfigured } from './client';
import {
  ANALYTICS_EVENTS,
  ONBOARDING_STEPS,
  type AnalyticsEventName,
  type OnboardingStep,
} from '@/constants/events';
import { sanitizeProperties } from '@/features/analytics/schema';
import {
  EMPTY_RETENTION_STATE,
  resolveRetention,
  toLocalDateKey,
  type RetentionState,
} from '@/features/analytics/retention';

const RETENTION_KEY = 'bexhearts.analytics.retention';
const ONCE_KEY = 'bexhearts.analytics.once';

/**
 * The ONE way events reach PostHog. Properties pass through the structural
 * sanitizer first (see `features/analytics/schema.ts`) — that is where the
 * "never prayer text, journal content, check-in notes or names" constraint is
 * actually enforced, rather than by convention at every call site.
 */
export function track(event: AnalyticsEventName, properties?: Record<string, unknown>) {
  posthog.capture(event, sanitizeProperties(properties));
}

/**
 * Attach events to a person. The identifier is the Supabase user UUID and
 * NOTHING else — no email, no display name. (The Privacy Policy carried a
 * "[MINIMIZE AT LAUNCH: review whether email is necessary]" flag; this is that
 * review, resolved as "not necessary". A UUID still joins back to the DB for
 * support, without putting an address in a third-party analytics store.)
 *
 * Traits are structural only and go through the same sanitizer.
 */
export function identify(userId: string, traits?: Record<string, unknown>) {
  posthog.identify(userId, sanitizeProperties(traits));
}

export function reset() {
  posthog.reset();
}

// ── Funnel helpers ─────────────────────────────────────────────────────────
// Thin, named wrappers so call sites read as intent and property names can't
// drift between screens.

/**
 * Funnel entry. Also folds today's open into the stored retention state and
 * emits `d1_returned` / `d7_returned` the first time each threshold is met.
 *
 * Best-effort and fire-and-forget: a storage failure costs a retention event,
 * never a launch.
 */
export async function trackAppOpened(now: Date = new Date()): Promise<void> {
  if (!analyticsConfigured) return;
  let state: RetentionState = EMPTY_RETENTION_STATE;
  try {
    const raw = await AsyncStorage.getItem(RETENTION_KEY);
    if (raw) state = { ...EMPTY_RETENTION_STATE, ...(JSON.parse(raw) as RetentionState) };
  } catch {
    // Unreadable/corrupt state — start over rather than lose the open event.
  }

  const outcome = resolveRetention(state, toLocalDateKey(now));

  track(ANALYTICS_EVENTS.APP_OPENED, {
    days_since_first_open: outcome.daysSinceFirstOpen,
    is_first_open: outcome.isFirstOpen,
  });

  for (const event of outcome.events) {
    track(event as AnalyticsEventName, { days_since_first_open: outcome.daysSinceFirstOpen });
  }

  try {
    await AsyncStorage.setItem(RETENTION_KEY, JSON.stringify(outcome.next));
  } catch {
    // Worst case a milestone re-fires on the next open; PostHog funnels count
    // unique persons, so a duplicate doesn't distort the conversion rate.
  }
}

/** Clear per-install analytics state (sign-out on a shared device). */
export async function resetRetentionState(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([RETENTION_KEY, ONCE_KEY]);
  } catch {
    // Non-fatal.
  }
}

/**
 * Emit an event at most once per install.
 *
 * Needed because some funnel steps are observed from STATE rather than from a
 * discrete action — the inviter learns their partner joined by their couple
 * row changing under them, which can re-render any number of times. A funnel
 * step that fires on every render is noise, so the fact is persisted.
 */
export async function trackOnce(
  key: string,
  event: AnalyticsEventName,
  properties?: Record<string, unknown>
): Promise<void> {
  if (!analyticsConfigured) return;
  try {
    const raw = await AsyncStorage.getItem(ONCE_KEY);
    const fired: string[] = raw ? JSON.parse(raw) : [];
    if (fired.includes(key)) return;
    track(event, properties);
    await AsyncStorage.setItem(ONCE_KEY, JSON.stringify([...fired, key]));
  } catch {
    // If the flag can't be read or written, prefer sending the event: PostHog
    // funnels de-duplicate by person, so a repeat costs nothing, while a
    // missing step silently breaks the conversion rate.
    track(event, properties);
  }
}

/** One event per onboarding screen completed, carrying its funnel position. */
export function trackOnboardingStep(step: OnboardingStep) {
  track(ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED, {
    step,
    step_index: ONBOARDING_STEPS.indexOf(step),
    step_count: ONBOARDING_STEPS.length,
  });
}

export function trackPaywallShown(placement: 'onboarding' | 'gate' | 'settings') {
  track(ANALYTICS_EVENTS.PAYWALL_SHOWN, { placement });
}

/**
 * The store sheet came back entitled. Both events fire on the same action by
 * design: with a 3-day intro offer the purchase IS the trial start, and
 * `subscription_started` is the step the owner will later compare against
 * renewal revenue. Keeping them separate now means no schema change when a
 * no-trial offer or a win-back campaign appears.
 */
export function trackTrialStarted(plan: 'annual' | 'monthly' | 'weekly') {
  track(ANALYTICS_EVENTS.TRIAL_STARTED, { plan });
  track(ANALYTICS_EVENTS.SUBSCRIPTION_STARTED, { plan, result: 'success' });
}

/**
 * Fires for BOTH partners, with `role` telling them apart — the inviter is
 * the one who saw the paywall, so without their side the funnel dead-ends at
 * `trial_started` for exactly the person whose conversion we're measuring.
 * Once per install (the inviter observes this as a state change).
 */
export function trackPartnerLinked(role: 'inviter' | 'joiner') {
  void trackOnce('partner_linked', ANALYTICS_EVENTS.PARTNER_LINKED, { role });
}

export function trackDevotionalCompleted() {
  track(ANALYTICS_EVENTS.DEVOTIONAL_COMPLETED);
}

export { ANALYTICS_EVENTS };
