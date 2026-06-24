// Analytics event names — typed for compile-time safety
export const ANALYTICS_EVENTS = {
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
  PARTNER_LINKED: 'partner_linked',

  // Devotional
  DEVOTIONAL_VIEWED: 'devotional_viewed',
  DEVOTIONAL_COMPLETED: 'devotional_completed',
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
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  RESTORE_PURCHASES: 'restore_purchases',

  // App
  APP_OPENED: 'app_opened',
  PUSH_NOTIFICATION_RECEIVED: 'push_notification_received',
  PUSH_NOTIFICATION_TAPPED: 'push_notification_tapped',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
