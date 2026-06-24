import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { spacing } from '@/theme/spacing';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useUpdateProfile } from '@/api/profiles';
import { profileSetupSchema, type ProfileSetupFormData } from '../schemas';

export function ProfileSetupForm() {
  const setProfileData = useOnboardingStore((s) => s.setProfileData);
  const updateProfile = useUpdateProfile();

  const { control, handleSubmit } = useForm<ProfileSetupFormData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: { fullName: '', denomination: '' },
  });

  const onSubmit = async (data: ProfileSetupFormData) => {
    setProfileData({ fullName: data.fullName, denomination: data.denomination });

    // onboarding_completed is set on the relationship-stage screen (the last
    // onboarding step) so route-gating can't skip past the stage question.
    await updateProfile.mutateAsync({
      full_name: data.fullName,
      denomination: data.denomination || null,
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

      <FormInput
        control={control}
        name="denomination"
        label="Denomination (optional)"
        placeholder="e.g. Baptist, Catholic, Non-denominational"
        containerStyle={styles.field}
      />

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
  button: {
    marginTop: spacing.lg,
  },
});
