import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, EmptyState } from '@/components/ui';
import { ScriptureBlock, ReflectionInput, CoupleAction } from '@/features/devotional';
import { useTodayDevotional, useDevotionalProgress, useCompleteDevotional } from '@/api/devotionals';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { successHaptic } from '@/lib/haptics';

export default function DevotionalScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: devotional, isLoading } = useTodayDevotional();
  const { data: progress } = useDevotionalProgress(devotional?.id ?? '');
  const completeDevotional = useCompleteDevotional();

  const myProgress = progress?.find((p) => p.user_id === user?.id);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!devotional) {
    return (
      <EmptyState
        title="No devotional today"
        description="Check back tomorrow for a new devotional."
      />
    );
  }

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <Text variant="labelMedium" color={colors.text.tertiary}>
        {"Today's Devotional"}
      </Text>
      <Text variant="displayMedium" style={styles.title}>
        {devotional.title}
      </Text>

      <ScriptureBlock
        reference={devotional.scripture_reference}
        text={devotional.scripture_text}
      />

      <Text variant="headlineSmall" style={styles.sectionTitle}>
        Reflection
      </Text>
      <Text variant="bodyLarge" style={styles.reflectionText}>
        {devotional.reflection}
      </Text>

      <ReflectionInput
        initialValue={myProgress?.reflection_response ?? ''}
        isLoading={completeDevotional.isPending}
        onSubmit={(text) => {
          successHaptic();
          completeDevotional.mutate({
            devotional_id: devotional.id,
            reflection_response: text,
          });
        }}
      />

      <CoupleAction
        action={devotional.couple_action}
        completed={myProgress?.action_completed ?? false}
        onToggle={() => {
          completeDevotional.mutate({
            devotional_id: devotional.id,
            action_completed: !myProgress?.action_completed,
          });
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  reflectionText: {
    color: colors.text.secondary,
    lineHeight: 26,
  },
});
