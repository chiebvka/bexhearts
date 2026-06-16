import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuth } from '../hooks/useAuth';
import { signUpSchema, type SignUpFormData } from '../schemas';

export function SignUpForm() {
  const { signUp, isLoading, error } = useAuth();
  const { control, handleSubmit } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  return (
    <View style={styles.container}>
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

      <FormInput
        control={control}
        name="password"
        label="Password"
        placeholder="At least 8 characters"
        secureTextEntry
        textContentType="newPassword"
        autoComplete="new-password"
        containerStyle={styles.field}
      />

      <FormInput
        control={control}
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Re-enter your password"
        secureTextEntry
        textContentType="newPassword"
        containerStyle={styles.field}
      />

      {error && (
        <Text variant="bodySmall" color={colors.error} style={styles.error}>
          {error}
        </Text>
      )}

      <Button
        title="Create Account"
        onPress={handleSubmit(signUp)}
        loading={isLoading}
        fullWidth
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  field: {
    marginBottom: spacing.md,
  },
  error: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
  },
});
