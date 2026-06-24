import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useUpdateProfile } from '@/api/profiles';
import { GROWTH_FOCUS_OPTIONS, type GrowthFocus } from '../schemas';

export function PersonalizationForm() {
  const setGrowthFocus = useOnboardingStore((s) => s.setGrowthFocus);
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<GrowthFocus[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggle = (value: GrowthFocus) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const onContinue = async () => {
    if (selected.length === 0) return;
    setError(null);
    try {
      await updateProfile.mutateAsync({ growth_focus: selected });
      setGrowthFocus(selected);
      router.push('/(onboarding)/plan-summary');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="displayMedium" style={styles.title}>
        What do you want to grow in?
      </Text>
      <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subtitle}>
        Pick what matters most — choose as many as you like.
      </Text>

      <View style={styles.chips}>
        {GROWTH_FOCUS_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <Pressable
              key={opt.value}
              onPress={() => toggle(opt.value)}
              style={[styles.chip, isSelected && styles.chipSelected]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              <Text
                variant="labelLarge"
                color={isSelected ? colors.primary[600] : colors.text.primary}
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
        disabled={selected.length === 0}
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  error: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.xl,
  },
});
