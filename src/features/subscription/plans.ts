// F1 — plan + trial presentation data. When RevenueCat products exist (F2) the
// paywall shows real localized prices from the offering and these are the
// fallback. Launch pricing (owner, 2026-07-11): $79.99/yr + $12.99/mo +
// $6.99/wk — all three at launch (supersedes the 07-10 "hold weekly" call),
// billed per couple, 3-day free trial on every plan.
export type PlanId = 'annual' | 'monthly' | 'weekly';

export interface PlanOption {
  id: PlanId;
  label: string;
  price: string;
  sub: string;
  highlight?: boolean;
}

export const TRIAL_DAYS = 3;

// Ascending commitment left→right; the annual anchor carries the badge.
// Per-week equivalents keep the three prices comparable at a glance.
export const PLAN_OPTIONS: PlanOption[] = [
  { id: 'weekly', label: 'Weekly', price: '$6.99', sub: 'per week' },
  { id: 'monthly', label: 'Monthly', price: '$12.99', sub: '≈ $3/wk' },
  {
    id: 'annual',
    label: 'Annual',
    price: '$79.99',
    sub: '≈ $1.54/wk',
    highlight: true,
  },
];

// The renewal wording for the disclosure line (price alone drops the period).
const RENEWAL_LABEL: Record<PlanId, string> = {
  weekly: '$6.99/wk',
  monthly: '$12.99/mo',
  annual: '$79.99/yr',
};

export const DEFAULT_PLAN: PlanId = 'annual';

export interface TrialStep {
  icon: string; // Ionicons name
  title: string;
  body: string;
}

export const TRIAL_TIMELINE: TrialStep[] = [
  { icon: 'lock-open', title: 'Today — everything unlocks', body: 'Start using it together, free.' },
  { icon: 'notifications-outline', title: 'Day 2 — a heads-up', body: "We'll remind you before it ends." },
  {
    icon: 'star',
    title: `Day ${TRIAL_DAYS} — your plan begins`,
    body: "Cancel anytime before you're charged.",
  },
];

// The always-honest CTA subtext (App Store 3.1.2 disclosure).
export function trialSubtitle(plan: PlanId): string {
  return `No charge today · then ${RENEWAL_LABEL[plan]} · cancel anytime`;
}
