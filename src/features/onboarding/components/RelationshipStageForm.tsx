import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useUpdateProfile } from '@/api/profiles';
import { track, ANALYTICS_EVENTS } from '@/services/analytics/events';
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
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<RelationshipStage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onContinue = async () => {
    if (!selected || !RELATIONSHIP_STAGES.includes(selected)) return;
    setError(null);
    try {
      // Stash the stage (written onto the couple when it's created at
      // partner-invite), then mark onboarding complete — the last onboarding step.
      setRelationshipStage(selected);
      await updateProfile.mutateAsync({ onboarding_completed: true });
      track(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, { relationship_stage: selected });
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
  error: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
  },
});
