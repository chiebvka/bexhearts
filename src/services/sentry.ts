// H2·M5 — crash reporting, degrading gracefully like every paid/keyed SDK
// (CLAUDE.md rule): with no DSN (or a placeholder) nothing initializes, and
// in Expo Go the native module doesn't exist so we never require it there.
// The dev build (J1) is where crashes actually report; source-map upload via
// the @sentry/react-native/expo config plugin is deliberately deferred to J1.
import { isExpoGo } from '@/lib/runtime';

// Pure + testable: a DSN counts only when it's a real https Sentry DSN and
// we're in an environment where the native module exists.
export function sentryEnabled(dsn: string | undefined, inExpoGo: boolean): boolean {
  return !!dsn && dsn.startsWith('https://') && !inExpoGo;
}

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

let sentry: typeof import('@sentry/react-native') | null = null;

export function initSentry(): void {
  if (!sentryEnabled(DSN, isExpoGo)) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sentry = require('@sentry/react-native') as typeof import('@sentry/react-native');
    sentry.init({
      dsn: DSN,
      // Modest sampling — crash visibility is the goal, not tracing volume.
      tracesSampleRate: 0.2,
      sendDefaultPii: false,
    });
  } catch {
    sentry = null;
  }
}

// Safe anywhere (ErrorBoundary, workers): no-ops when Sentry isn't live.
export function captureException(error: unknown): void {
  try {
    sentry?.captureException(error);
  } catch {
    // Never let crash reporting crash anything.
  }
}
