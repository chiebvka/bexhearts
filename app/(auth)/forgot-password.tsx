import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, Button } from '@/components/ui';
import { FormInput } from '@/components/forms/FormInput';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { useAuth } from '@/features/auth';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/schemas';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { requestPasswordReset, isLoading, error } = useAuth();

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotPasswordFormData) =>
    requestPasswordReset(data.email);

  return (
    <KeyboardAvoid>
      <View style={[styles.container, { paddingTop: insets.top + spacing['2xl'] }]}>
        <Text variant="displayMedium">Reset password</Text>
        <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subtitle}>
          {"Enter your email and we'll send you a 6-digit code to reset your password."}
        </Text>

        <FormInput
          control={control}
          name="email"
          label="Email"
          placeholder="your@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          containerStyle={styles.field}
        />

        {error && (
          <Text variant="bodySmall" color={colors.error} style={styles.error}>
            {error}
          </Text>
        )}

        <Button
          title="Send code"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          fullWidth
        />

        <Button
          title="Back to Sign In"
          onPress={() => router.back()}
          variant="ghost"
          style={styles.backButton}
        />
      </View>
    </KeyboardAvoid>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.md,
  },
  error: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.xl,
  },
  backButton: {
    marginTop: spacing.md,
  },
});
