import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BackButton } from '@/components/ui';
import { PlanSummary } from '@/features/onboarding';
import { spacing } from '@/theme/spacing';

export default function PlanSummaryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <BackButton />
      <PlanSummary />
    </ScreenContainer>
  );
}
