import { View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, EmptyState, Card } from '@/components/ui';
import {
  ScriptureBlock,
  ReflectionInput,
  CoupleAction,
  PartnerReflection,
  getReflectionRevealState,
} from '@/features/devotional';
import { useTodayDevotional, useDevotionalProgress, useCompleteDevotional } from '@/api/devotionals';
import { usePartnerProfile } from '@/api/couples';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { successHaptic } from '@/lib/haptics';

export default function DevotionalScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const isLinked = useCoupleStore((s) => s.isLinked);
  const { data: devotional, isLoading } = useTodayDevotional();
  const { data: progress } = useDevotionalProgress(devotional?.id ?? '');
  const { data: partner } = usePartnerProfile();
  const completeDevotional = useCompleteDevotional();

  const myProgress = progress?.find((p) => p.user_id === user?.id);
  const partnerProgress = progress?.find((p) => p.user_id !== user?.id);
  const revealState = getReflectionRevealState({
    isLinked,
    mine: myProgress,
    partner: partnerProgress,
  });

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
      <Pressable onPress={() => router.push('/modal/prayer-focus')} accessibilityRole="button">
        <Card variant="outlined" padding="md" style={styles.prayerTime}>
          <View style={styles.prayerTimeIcon}>
            <Ionicons name="flower-outline" size={20} color={colors.primary[500]} />
          </View>
          <View style={styles.prayerTimeText}>
            <Text variant="headlineSmall">Prayer time</Text>
            <Text variant="bodySmall" color={colors.text.secondary}>
              A few quiet minutes with your prayers
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
        </Card>
      </Pressable>

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

      <PartnerReflection
        state={revealState}
        partnerName={partner?.full_name}
        partnerReflection={partnerProgress?.reflection_response}
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
  prayerTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  prayerTimeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerTimeText: {
    flex: 1,
  },
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
