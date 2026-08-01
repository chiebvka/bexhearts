import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BackButton, LoadingScreen } from '@/components/ui';
import { Paywall } from '@/features/subscription/components/Paywall';
import { SignOutLink } from '@/features/auth';
import { useEntitlementAccess } from '@/features/subscription/hooks/useEntitlement';
import { isRevenueCatConfigured } from '@/services/revenuecat/client';
import { trackOnboardingStep } from '@/services/analytics/events';
import { spacing } from '@/theme/spacing';

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  // RevenueCat OR the comp allowlist — a comped tester must never be pinned
  // to a price they will never pay.
  const { isEntitled, reason, isLoading } = useEntitlementAccess();
  // In Expo Go / local dev `checkPremium` returns true so premium features stay
  // testable — that is a convenience, NOT an entitlement, and skipping the
  // paywall on the strength of it would make this screen unreachable in the
  // one environment where it gets eyeballed. A comp grant is real everywhere.
  const hasRealEntitlement = isEntitled && (reason === 'comp' || isRevenueCatConfigured());
  // The app-wide gate redirects here with placement=gate; the onboarding step
  // arrives with nothing. Same screen, very different funnel meaning — a
  // paywall seen at the gate is a LAPSE, not a first look at the price.
  const { placement } = useLocalSearchParams<{ placement?: string }>();
  const isGate = placement === 'gate';

  // Already entitled and walking onboarding: don't show a price at all. This
  // is the App Review demo account's path (comped in 00036) and also the path
  // of anyone reinstalling with a live subscription — quoting either of them
  // a price they will never be charged is confusing at best, and for App
  // Review it looks like the demo credentials didn't work.
  if (isLoading) return <LoadingScreen />;
  if (hasRealEntitlement) {
    // Entitlement can also resolve to true AFTER the gate sent us here — the
    // comp check is a network round-trip. Leaving an entitled person staring
    // at a paywall would make the gate look broken.
    return <Redirect href={isGate ? '/(tabs)' : '/(onboarding)/partner-invite'} />;
  }

  // F2 — this screen does double duty: an onboarding step (where going back
  // is fine) and the app-wide gate for a couple whose trial lapsed, where it
  // must NOT be escapable or the gate is decorative. Signing out is the
  // deliberate way off a hard gate. Past the guard above nobody here is
  // entitled, so there is no back button — only sign out.
  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      {isGate ? null : <BackButton />}
      <Paywall
        placement={isGate ? 'gate' : 'onboarding'}
        onComplete={() => {
          // A lapsed couple who just re-subscribed belongs back in the app,
          // not re-walked through onboarding they finished months ago.
          if (isGate) {
            router.replace('/(tabs)');
            return;
          }
          trackOnboardingStep('paywall');
          router.replace('/(onboarding)/partner-invite');
        }}
      />
      <SignOutLink />
    </ScreenContainer>
  );
}
