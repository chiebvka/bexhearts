import PostHog from 'posthog-react-native';

const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST;
const analyticsConfigured = !!posthogKey && !!posthogHost && !posthogKey.includes('xxxxxxxx');

export const posthog = new PostHog(posthogKey || 'disabled-local-key', {
  host: posthogHost,
  // Disable in development to avoid polluting analytics
  disabled: __DEV__ || !analyticsConfigured,
});
