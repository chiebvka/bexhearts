import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BackButton } from '@/components/ui';
import { PersonalizationForm } from '@/features/onboarding';
import { SignOutLink } from '@/features/auth';
import { spacing } from '@/theme/spacing';

export default function PersonalizeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <BackButton />
      <PersonalizationForm />
      <SignOutLink />
    </ScreenContainer>
  );
}
