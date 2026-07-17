import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BackButton } from '@/components/ui';
import { Paywall } from '@/features/subscription/components/Paywall';
import { track, ANALYTICS_EVENTS } from '@/services/analytics/events';
import { spacing } from '@/theme/spacing';

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <BackButton />
      <Paywall
        onComplete={() => {
          track(ANALYTICS_EVENTS.PAYWALL_PRESENTED, { placement: 'onboarding', action: 'started' });
          router.replace('/(onboarding)/partner-invite');
        }}
      />
    </ScreenContainer>
  );
}
