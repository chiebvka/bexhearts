import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useUpdateProfile } from '@/api/profiles';
import { profileSetupSchema, type ProfileSetupFormData } from '../schemas';

const DENOMINATIONS = [
  'Non-denominational',
  'Baptist',
  'Catholic',
  'Methodist',
  'Pentecostal',
  'Presbyterian',
  'Lutheran',
  'Anglican / Episcopal',
  'Orthodox',
  'Adventist',
  'Other',
];

export function ProfileSetupForm() {
  const setProfileData = useOnboardingStore((s) => s.setProfileData);
  const updateProfile = useUpdateProfile();
  const [denomination, setDenomination] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ProfileSetupFormData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: { fullName: '', denomination: '' },
  });

  const onSubmit = async (data: ProfileSetupFormData) => {
    setProfileData({ fullName: data.fullName, denomination: denomination ?? undefined });

    // onboarding_completed is set on the relationship-stage screen (the last
    // onboarding step) so route-gating can't skip past the stage question.
    await updateProfile.mutateAsync({
      full_name: data.fullName,
      denomination,
    });

    router.push('/(onboarding)/relationship-stage');
  };

  return (
    <View style={styles.container}>
      <Text variant="displayMedium" style={styles.title}>
        Tell us about yourself
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Help your partner recognize you in the app.
      </Text>

      <FormInput
        control={control}
        name="fullName"
        label="Your Name"
        placeholder="First and last name"
        autoCapitalize="words"
        textContentType="name"
        containerStyle={styles.field}
      />

      <Text variant="labelLarge" color={colors.text.secondary} style={styles.label}>
        Your tradition (optional)
      </Text>
      <View style={styles.chips}>
        {DENOMINATIONS.map((d) => {
          const selected = denomination === d;
          return (
            <Pressable
              key={d}
              onPress={() => setDenomination(selected ? null : d)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text
                variant="labelMedium"
                color={selected ? colors.text.inverse : colors.text.secondary}
              >
                {d}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        title="Continue"
        onPress={handleSubmit(onSubmit)}
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
    opacity: 0.7,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
  },
  chipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  button: {
    marginTop: spacing.lg,
  },
});
