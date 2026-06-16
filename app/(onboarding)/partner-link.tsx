import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PartnerLinkForm } from '@/features/onboarding';
import { spacing } from '@/theme/spacing';

export default function PartnerLinkScreen() {
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code?: string }>();

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.xl }}>
      <PartnerLinkForm initialCode={code} />
    </ScreenContainer>
  );
}
