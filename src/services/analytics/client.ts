import AsyncStorage from '@react-native-async-storage/async-storage';
import PostHog from 'posthog-react-native';

// PostHog client construction.
//
// ⚠️ THE BUG THIS FILE EXISTS TO AVOID (PROGRESS Phase 5, now FIXED here):
// posthog-react-native's default storage picker (`buildOptimisiticAsyncStorage`)
// prefers expo-file-system when it's installed and calls the LEGACY
// `documentDirectory` / `readAsStringAsync` / `writeAsStringAsync` API — all
// removed from the SDK 54 top-level export. Result: `documentDirectory` is
// undefined, every persist rejects, and the app throws at startup. The previous
// workaround was to never construct the client outside production, which meant
// analytics could not be VERIFIED before shipping — exactly backwards.
//
// The fix is to hand PostHog `customStorage`, which short-circuits that picker
// entirely: AsyncStorage is already a dependency, already works in Expo Go, and
// is the storage the persisted query cache and upload outbox already use. (The
// one other legacy-FS path, `getLegacyValues()`'s migration read, is fully
// try/caught inside the SDK — verified by reading the compiled source.)
const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST;

/** True when a real PostHog project is configured (placeholder keys don't count). */
export const analyticsConfigured =
  !!posthogKey &&
  !!posthogHost &&
  posthogKey.startsWith('phc_') &&
  !posthogKey.includes('xxxxxxxx');

/**
 * Which environment an event came from. Dev builds and simulators DO send
 * events — that's how the funnel gets verified before launch — but every
 * event carries `app_env` so the owner filters development out of real
 * funnels with one property filter.
 */
export const appEnv: 'development' | 'production' = __DEV__ ? 'development' : 'production';

const asyncStorageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => {
    void AsyncStorage.setItem(key, value);
  },
};

const noop = () => undefined;
const noopClient = {
  capture: noop,
  identify: noop,
  reset: noop,
  screen: noop,
  register: noop,
  debug: noop,
  flush: noop,
} as unknown as PostHog;

function createClient(): PostHog {
  if (!analyticsConfigured) return noopClient;
  try {
    const client = new PostHog(posthogKey!, {
      host: posthogHost,
      customStorage: asyncStorageAdapter,
      // We emit our own `app_opened` (with retention properties) so the funnel
      // has one unambiguous entry step; the SDK's native lifecycle events would
      // add a parallel, differently-shaped one.
      captureNativeAppLifecycleEvents: false,
      // Session replay of a prayer journal is a non-starter — sensitive
      // religious content, on video. Off, permanently.
      enableSessionReplay: false,
    });
    // Dev-only: prints every queued/sent event to the device log, which is how
    // this wiring gets verified without opening the PostHog UI. Off in
    // production — it's noisy and would log event names to the device console.
    if (__DEV__) client.debug(true);
    // Stamped on every event from this install.
    client.register({ app_env: appEnv });
    return client;
  } catch (error) {
    // Analytics must never take the app down (the paid-SDKs-degrade-gracefully
    // rule). A failure here means no data, not a broken launch.
    if (__DEV__) console.warn('PostHog failed to initialize; analytics disabled.', error);
    return noopClient;
  }
}

export const posthog: PostHog = createClient();
