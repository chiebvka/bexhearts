import { Redirect } from 'expo-router';
import { LoadingScreen } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { useMyProfile } from '@/api/profiles';
import { useCoupleStore } from '@/stores/couple.store';

export default function Index() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const coupleId = useCoupleStore((s) => s.coupleId);
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  if (isLoading || (isAuthenticated && profileLoading)) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!profile?.onboarding_completed) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (!coupleId) {
    return <Redirect href="/(onboarding)/partner-invite" />;
  }

  return <Redirect href="/(tabs)" />;
}
