export const ENTITLEMENTS = {
  PREMIUM: 'premium',
} as const;

export const PAYWALL_EVENTS = {
  ONBOARDING: 'onboarding_upsell',
  DEVOTIONAL_GATE: 'feature_devotional_archive',
  CHECK_IN_GATE: 'feature_check_in',
  DATE_IDEAS_GATE: 'feature_premium_dates',
  BOUNDARIES_GATE: 'feature_boundaries',
  PROFILE_UPSELL: 'profile_upsell',
} as const;

export type PaywallEvent = (typeof PAYWALL_EVENTS)[keyof typeof PAYWALL_EVENTS];
