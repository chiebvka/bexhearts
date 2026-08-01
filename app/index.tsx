import { Redirect } from 'expo-router';
import { useIsRestoring } from '@tanstack/react-query';
import { LoadingScreen } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { useMyProfile } from '@/api/profiles';
import { useCoupleStore } from '@/stores/couple.store';
import { resolveLandingRoute } from '@/features/auth/routeGate';

export default function Index() {
  const authLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const coupleId = useCoupleStore((s) => s.coupleId);
  // H2·M3 — the persisted cache is read off disk asynchronously; queries
  // report isLoading:false with no data during that window (see routeGate).
  const isRestoring = useIsRestoring();
  const { data: profile, isLoading: profileLoading, isError } = useMyProfile();

  const route = resolveLandingRoute({
    authLoading,
    isAuthenticated,
    isRestoring,
    profileLoading,
    profileError: isError,
    profile,
    coupleId,
  });

  switch (route) {
    case 'loading':
      return <LoadingScreen message="Loading..." />;
    case 'sign-in':
      return <Redirect href="/(auth)/sign-in" />;
    case 'onboarding':
      return <Redirect href="/(onboarding)/welcome" />;
    case 'partner-invite':
      return <Redirect href="/(onboarding)/partner-invite" />;
    case 'tabs':
      return <Redirect href="/(tabs)" />;
  }
}
