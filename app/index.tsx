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

  // The profile row is the source of truth for couple membership — the store
  // hydrates asynchronously, and trusting it alone re-routed already-linked
  // users to partner-invite on cold start (bug 2026-07-04).
  if (!profile?.couple_id && !coupleId) {
    return <Redirect href="/(onboarding)/partner-invite" />;
  }

  return <Redirect href="/(tabs)" />;
}
