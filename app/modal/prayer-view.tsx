import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card, Badge, ModalHeader, LoadingScreen } from '@/components/ui';
import { queryKeys } from '@/api/keys';
import { supabase } from '@/services/supabase/client';
import { formatDate } from '@/lib/dates';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// D6 (owner locked 2026-07-10) — an answered prayer on the journal wall opens
// here: the request, when God answered it, and the composed prayer that was
// prayed over it (if one was made). Read-only — the full-circle moment.
export default function PrayerViewModal() {
  const insets = useSafeAreaInsets();
  const { prayerId } = useLocalSearchParams<{ prayerId: string }>();

  const { data: prayer, isLoading } = useQuery({
    queryKey: [...queryKeys.prayers.all, 'one', prayerId ?? ''],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .eq('id', prayerId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!prayerId,
  });

  if (isLoading || !prayer) return <LoadingScreen />;

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <ModalHeader title={prayer.title} />

      {prayer.is_answered && (
        <Badge
          label={
            prayer.answered_at ? `Answered 🙌 · ${formatDate(prayer.answered_at)}` : 'Answered 🙌'
          }
          variant="success"
        />
      )}

      {prayer.body ? (
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.body}>
          {prayer.body}
        </Text>
      ) : null}

      {prayer.ai_prayer ? (
        <Card variant="filled" padding="md" style={styles.prayerCard}>
          {prayer.ai_verse_ref ? (
            <Text variant="labelMedium" color={colors.primary[600]}>
              {prayer.ai_verse_ref}
            </Text>
          ) : null}
          {prayer.ai_verse_text ? (
            <Text variant="bodySmall" color={colors.text.secondary} style={styles.verse}>
              “{prayer.ai_verse_text}”
            </Text>
          ) : null}
          <Text variant="bodyLarge" style={styles.prayerText}>
            {prayer.ai_prayer}
          </Text>
        </Card>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: spacing.md,
    lineHeight: 22,
  },
  prayerCard: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  verse: {
    fontStyle: 'italic',
  },
  prayerText: {
    lineHeight: 24,
  },
});
