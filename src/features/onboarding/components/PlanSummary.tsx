import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button, Text, Card } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { triggerPaywall } from '@/services/superwall/client';
import { track, ANALYTICS_EVENTS } from '@/services/analytics/events';
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
  const [isLoading, setIsLoading] = useState(false);

  const firstName = profileData.fullName?.split(' ')[0] || 'friend';
  const stageBlurb = relationshipStage
    ? STAGE_BLURB[relationshipStage]
    : 'relationship';
  const focusLabels = growthFocus.map((f) => FOCUS_LABEL[f]).filter(Boolean);

  const onStart = async () => {
    setIsLoading(true);
    try {
      track(ANALYTICS_EVENTS.PAYWALL_PRESENTED, { placement: 'onboarding' });
      // Presents the 7-day-trial paywall when Superwall is configured; no-ops
      // gracefully in dev (placeholder keys) so the funnel continues.
      await triggerPaywall('onboarding_paywall');
    } finally {
      setIsLoading(false);
      router.push('/(onboarding)/partner-invite');
    }
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

      <Text variant="bodyMedium" color={colors.text.secondary} style={styles.trialNote}>
        Start with a 7-day free trial.
      </Text>

      <Button
        title="Start my free trial"
        onPress={onStart}
        loading={isLoading}
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
