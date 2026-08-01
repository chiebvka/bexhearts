import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button, Text, Card } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { ONBOARDING_STREAK_BEATS } from '@/features/how-it-works/content';
import { trackOnboardingStep } from '@/services/analytics/events';
import {
  GROWTH_FOCUS_OPTIONS,
  type RelationshipStage,
} from '../schemas';

const STAGE_BLURB: Record<RelationshipStage, string> = {
  dating: 'dating journey',
  engaged: 'engagement season',
  married: 'marriage',
};

const FOCUS_LABEL = Object.fromEntries(
  GROWTH_FOCUS_OPTIONS.map((o) => [o.value, o.label])
);

export function PlanSummary() {
  const profileData = useOnboardingStore((s) => s.profileData);
  const relationshipStage = useOnboardingStore((s) => s.relationshipStage);
  const growthFocus = useOnboardingStore((s) => s.growthFocus);
  const firstName = profileData.fullName?.split(' ')[0] || 'friend';
  const stageBlurb = relationshipStage
    ? STAGE_BLURB[relationshipStage]
    : 'relationship';
  const focusLabels = growthFocus.map((f) => FOCUS_LABEL[f]).filter(Boolean);

  const onStart = () => {
    // Hard paywall: the plan reveal leads into the 3-day-trial paywall before
    // partner-invite (F1). The paywall itself no-ops the funnel through in dev.
    trackOnboardingStep('plan_summary');
    router.push('/(onboarding)/paywall');
  };

  return (
    <View style={styles.container}>
      <Text variant="displayMedium" style={styles.title}>
        {firstName}, here&apos;s your plan
      </Text>
      <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subtitle}>
        A daily rhythm for your {stageBlurb} — devotionals, shared prayer, and
        weekly check-ins, built around what you want to grow in.
      </Text>

      {focusLabels.length > 0 && (
        <Card variant="outlined" padding="md" style={styles.card}>
          <Text variant="labelLarge" color={colors.text.secondary} style={styles.cardLabel}>
            We&apos;ll focus on
          </Text>
          {focusLabels.map((label) => (
            <Text key={label} variant="bodyLarge" style={styles.focusItem}>
              • {label}
            </Text>
          ))}
        </Card>
      )}

      {/* E8·M1 — concise streak beats (owner 2026-07-18: brief, no lecture;
          the full rules live on the How-it-works screen). */}
      <Card variant="outlined" padding="md" style={styles.beatsCard}>
        {ONBOARDING_STREAK_BEATS.map((beat) => (
          <Text key={beat} variant="bodySmall" style={styles.beat}>
            {beat}
          </Text>
        ))}
      </Card>

      <Text variant="bodyMedium" color={colors.text.secondary} style={styles.trialNote}>
        Start with a 3-day free trial.
      </Text>

      <Button
        title="Start my free trial"
        onPress={onStart}
        fullWidth
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.lg,
  },
  beatsCard: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  beat: {
    // Emoji clip without an explicit lineHeight (2026-07-04g).
    lineHeight: 20,
  },
  cardLabel: {
    marginBottom: spacing.sm,
  },
  focusItem: {
    marginBottom: spacing.xs,
  },
  trialNote: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
  },
});
