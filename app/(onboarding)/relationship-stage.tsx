import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BackButton } from '@/components/ui';
import { RelationshipStageForm } from '@/features/onboarding';
import { SignOutLink } from '@/features/auth';
import { spacing } from '@/theme/spacing';

export default function RelationshipStageScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <BackButton />
      <RelationshipStageForm />
      <SignOutLink />
    </ScreenContainer>
  );
}
