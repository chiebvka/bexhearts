import { posthog } from './client';
import { ANALYTICS_EVENTS, type AnalyticsEventName } from '@/constants/events';

type AnalyticsProperties = Parameters<typeof posthog.capture>[1];
type UserTraits = Parameters<typeof posthog.identify>[1];

export function track(event: AnalyticsEventName, properties?: AnalyticsProperties) {
  posthog.capture(event, properties);
}

export function identify(userId: string, traits?: UserTraits) {
  posthog.identify(userId, traits);
}

export function reset() {
  posthog.reset();
}

export { ANALYTICS_EVENTS };
