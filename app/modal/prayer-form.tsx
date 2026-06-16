import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { PrayerForm } from '@/features/prayer';
import { spacing } from '@/theme/spacing';

export default function PrayerFormModal() {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoid>
      <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
        <PrayerForm onSuccess={() => router.back()} />
      </ScreenContainer>
    </KeyboardAvoid>
  );
}
