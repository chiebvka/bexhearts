import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { ModalHeader } from '@/components/ui';
import { PrayerForm } from '@/features/prayer';
import { spacing } from '@/theme/spacing';

export default function PrayerFormModal() {
  const insets = useSafeAreaInsets();
  // Edit mode: the prayers screen passes the author's own prayer as params.
  const params = useLocalSearchParams<{
    prayerId?: string;
    title?: string;
    body?: string;
    isPrivate?: string;
  }>();

  return (
    <KeyboardAvoid>
      <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
        <ModalHeader />
        <PrayerForm
          onSuccess={() => router.back()}
          initial={
            params.prayerId
              ? {
                  id: params.prayerId,
                  title: params.title ?? '',
                  body: params.body || null,
                  isPrivate: params.isPrivate === 'true',
                }
              : undefined
          }
        />
      </ScreenContainer>
    </KeyboardAvoid>
  );
}
