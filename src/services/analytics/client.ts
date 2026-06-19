import PostHog from 'posthog-react-native';

const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST;
const analyticsConfigured = !!posthogKey && !!posthogHost && !posthogKey.includes('xxxxxxxx');

// PostHog initializes its persistence eagerly on construction, which in
// posthog-react-native calls expo-file-system's legacy `writeAsStringAsync` —
// removed in SDK 54, so it throws an uncaught rejection at startup. We only
// construct the real client when analytics is actually configured AND we're not
// in development; otherwise we export a no-op with the same surface the app uses
// (keeps the paid-SDKs-degrade-gracefully rule intact).
const noop = () => undefined;
const noopClient = {
  capture: noop,
  identify: noop,
  reset: noop,
  screen: noop,
  flush: noop,
} as unknown as PostHog;

export const posthog: PostHog =
  analyticsConfigured && !__DEV__
    ? new PostHog(posthogKey!, { host: posthogHost })
    : noopClient;
