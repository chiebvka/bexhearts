import { Fragment, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { AppProviders } from '@/providers/AppProviders';
import { ErrorBoundary, OfflineBanner } from '@/components/ui';
import { toastConfig } from '@/components/ui/AppToast';
import { initSuperwall } from '@/services/superwall/client';
import { initSentry } from '@/services/sentry';
import { trackAppOpened } from '@/services/analytics/events';
import { colors } from '@/theme/colors';
import { useThemeMode } from '@/theme/useTheme';
import { useNotificationsRealtime } from '@/api/notifications';
import { useUploadOutbox } from '@/hooks/useUploadOutbox';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

// Theme boundary (Phase 8, 2026-07-18): useThemeMode resolves the Settings →
// Appearance preference (System / Light / Dark, System follows the OS) and
// publishes it BEFORE children render; key={mode} re-mounts the whole UI
// subtree on change so no light-frozen styles survive a switch. Sits INSIDE
// AppProviders so auth/query state is untouched by a theme toggle.
function ThemedApp() {
  const mode = useThemeMode();
  // G1/G2 — ROOT-level on purpose (bug found 2026-07-19): in the tabs layout
  // the subscription never mounted when the app was entered straight into a
  // modal (deep link / push tap), so the bell and open inbox missed live
  // rows. Here it subscribes in every entry context; no-ops until signed in.
  useNotificationsRealtime();
  // H2·M2 — resume queued photo uploads on start / reconnect / foreground.
  useUploadOutbox();

  return (
    <Fragment key={mode}>
      {/* H2·M4 — global offline state; cached content stays usable below. */}
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        {/* Dates is a pushed flow, NOT a tab (owner call 2026-07-25): it
            covers the tab bar like any iOS push, so there's no orphaned bar
            with nothing highlighted — the back button is the way out. */}
        <Stack.Screen name="dates" />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {/* Custom config: every toast gets an ✕ + themes correctly (2026-07-19). */}
      <Toast config={toastConfig} />
    </Fragment>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    initSuperwall();
    // H2·M5 — no-op without a real DSN and in Expo Go.
    initSentry();
  }, []);

  // Phase 7 — the funnel's entry step. Also what D1/D7 return is measured
  // from, so it must fire on a real return-to-app, not just cold start: a
  // person who leaves the app open overnight and comes back to it tomorrow
  // has returned, and the retention numbers should say so.
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    void trackAppOpened();

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        void trackAppOpened();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  return (
    <ErrorBoundary>
      <AppProviders>
        <ThemedApp />
      </AppProviders>
    </ErrorBoundary>
  );
}
