import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { AppProviders } from '@/providers/AppProviders';
import { ErrorBoundary } from '@/components/ui';
import { initSuperwall } from '@/services/superwall/client';
import { colors } from '@/theme/colors';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    initSuperwall();
  }, []);

  return (
    <ErrorBoundary>
      <AppProviders>
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
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
            }}
          />
        </Stack>
        <StatusBar style="dark" />
        <Toast />
      </AppProviders>
    </ErrorBoundary>
  );
}
