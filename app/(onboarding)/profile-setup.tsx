import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BackButton } from '@/components/ui';
import { ProfileSetupForm } from '@/features/onboarding';
import { spacing } from '@/theme/spacing';

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <BackButton />
      <ProfileSetupForm />
    </ScreenContainer>
  );
}
