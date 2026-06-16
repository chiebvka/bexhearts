import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PremiumGate } from '@/components/ui';
import { CheckInForm } from '@/features/check-in';
import { PAYWALL_EVENTS } from '@/constants/entitlements';
import { spacing } from '@/theme/spacing';

export default function CheckInFormModal() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <PremiumGate paywallEvent={PAYWALL_EVENTS.CHECK_IN_GATE}>
        <CheckInForm onSuccess={() => router.back()} />
      </PremiumGate>
    </ScreenContainer>
  );
}
