import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useUpdateProfile } from '@/api/profiles';
import { track, trackOnboardingStep, ANALYTICS_EVENTS } from '@/services/analytics/events';
import { RELATIONSHIP_STAGES, type RelationshipStage } from '../schemas';

const STAGE_OPTIONS: {
  value: RelationshipStage;
  label: string;
  description: string;
}[] = [
  {
    value: 'dating',
    label: 'Dating',
    description: 'Growing together and discerning the relationship.',
  },
  {
    value: 'engaged',
    label: 'Engaged',
    description: 'Preparing for marriage in this season.',
  },
  {
    value: 'married',
    label: 'Married',
    description: 'Building your life and faith as one.',
  },
];

export function RelationshipStageForm() {
  const setRelationshipStage = useOnboardingStore((s) => s.setRelationshipStage);
  const setIsLongDistance = useOnboardingStore((s) => s.setIsLongDistance);
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<RelationshipStage | null>(null);
  // E11 — the LDR question rides this screen (owner: concise quiz, one
  // question that pays off — virtual date filters + the their-time clock).
  const [longDistance, setLongDistance] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onContinue = async () => {
    if (!selected || !RELATIONSHIP_STAGES.includes(selected)) return;
    setError(null);
    try {
      // Stash the stage (written onto the couple when it's created at
      // partner-invite), then mark onboarding complete — the last onboarding step.
      setRelationshipStage(selected);
      setIsLongDistance(longDistance);
      await updateProfile.mutateAsync({ onboarding_completed: true });
      track(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
        relationship_stage: selected,
        is_long_distance: longDistance,
      });
      trackOnboardingStep('relationship_stage');
      router.push('/(onboarding)/personalize');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="displayMedium" style={styles.title}>
        Where are you in your journey?
      </Text>
      <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subtitle}>
        We&apos;ll tailor your devotionals and content to this season.
      </Text>

      {STAGE_OPTIONS.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => setSelected(opt.value)}
            style={[styles.option, isSelected && styles.optionSelected]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              variant="labelLarge"
              color={isSelected ? colors.primary[600] : colors.text.primary}
            >
              {opt.label}
            </Text>
            <Text variant="bodySmall" color={colors.text.secondary} style={styles.optionDesc}>
              {opt.description}
            </Text>
          </Pressable>
        );
      })}

      <Text variant="labelLarge" style={styles.distanceLabel}>
        Are you long-distance right now?
      </Text>
      <View style={styles.distanceRow}>
        {(
          [
            { value: false, label: 'Together nearby' },
            { value: true, label: 'Long-distance' },
          ] as const
        ).map((opt) => {
          const isSelected = longDistance === opt.value;
          return (
            <Pressable
              key={opt.label}
              onPress={() => setLongDistance(opt.value)}
              style={[styles.distanceChip, isSelected && styles.optionSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                variant="labelMedium"
                color={isSelected ? colors.primary[600] : colors.text.secondary}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && (
        <Text variant="bodySmall" color={colors.error} style={styles.error}>
          {error}
        </Text>
      )}

      <Button
        title="Continue"
        onPress={onContinue}
        disabled={!selected}
        loading={updateProfile.isPending}
        fullWidth
        style={styles.button}
      />
    </View>
  );
}

const styles = themedStyles(() => ({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  option: {
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  optionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionDesc: {
    marginTop: spacing.xs,
  },
  distanceLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  distanceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  distanceChip: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  error: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
  },
}));
