// Analytics event names — typed for compile-time safety.
//
// The FUNNEL block below is the owner-specified pre-launch funnel
// (2026-07-26). Everything else is supporting context. Property shapes are
// constrained by `src/features/analytics/schema.ts` — structural only.
export const ANALYTICS_EVENTS = {
  // ── The funnel (build these steps in PostHog, in this order) ──────────────
  APP_OPENED: 'app_opened',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  PAYWALL_SHOWN: 'paywall_shown',
  TRIAL_STARTED: 'trial_started',
  SUBSCRIPTION_STARTED: 'subscription_started',
  PARTNER_LINKED: 'partner_linked',
  DEVOTIONAL_COMPLETED: 'devotional_completed',
  D1_RETURNED: 'd1_returned',
  D7_RETURNED: 'd7_returned',

  // Auth
  SIGN_UP: 'sign_up',
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',
  ACCOUNT_DELETED: 'account_deleted',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  PROFILE_SETUP_COMPLETED: 'profile_setup_completed',

  // Partner
  INVITE_CODE_GENERATED: 'invite_code_generated',
  INVITE_CODE_SHARED: 'invite_code_shared',

  // Devotional
  DEVOTIONAL_VIEWED: 'devotional_viewed',
  REFLECTION_SUBMITTED: 'reflection_submitted',

  // Prayer
  PRAYER_CREATED: 'prayer_created',
  PRAYER_ANSWERED: 'prayer_answered',
  PRAYER_DELETED: 'prayer_deleted',

  // Check-in
  CHECK_IN_SUBMITTED: 'check_in_submitted',

  // Boundaries
  BOUNDARY_CREATED: 'boundary_created',
  BOUNDARY_UPDATED: 'boundary_updated',

  // Dates
  DATE_IDEA_VIEWED: 'date_idea_viewed',
  DATE_COMPLETED: 'date_completed',

  // Subscription
  PAYWALL_PRESENTED: 'paywall_presented',
  PAYWALL_DISMISSED: 'paywall_dismissed',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  RESTORE_PURCHASES: 'restore_purchases',
  COMP_ACCESS_GRANTED: 'comp_access_granted',

  // App
  PUSH_NOTIFICATION_RECEIVED: 'push_notification_received',
  PUSH_NOTIFICATION_TAPPED: 'push_notification_tapped',
  JOURNAL_EXPORTED: 'journal_exported',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * The onboarding steps, in funnel order. `onboarding_step_completed` carries
 * `step` + `step_index` so a single event powers a step-by-step drop-off
 * chart without needing one event name per screen.
 */
export const ONBOARDING_STEPS = [
  'welcome',
  'profile_setup',
  'relationship_stage',
  'personalize',
  'plan_summary',
  'paywall',
  'partner_invite',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
