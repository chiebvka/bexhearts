import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuth } from '../hooks/useAuth';
import { getLastUsedMethod, type AuthMethod } from '../lastUsedMethod';
import { signInSchema, type SignInFormData } from '../schemas';
import { SocialAuthButtons } from './SocialAuthButtons';

export function SignInForm() {
  const { signIn, isLoading, error } = useAuth();
  const [lastUsed, setLastUsed] = useState<AuthMethod | null>(null);
  const { control, handleSubmit } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    getLastUsedMethod().then(setLastUsed);
  }, []);

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
        placeholder="Enter your password"
        secureTextEntry
        textContentType="password"
        autoComplete="password"
        containerStyle={styles.field}
      />

      {error && (
        <Text variant="bodySmall" color={colors.error} style={styles.error}>
          {error}
        </Text>
      )}

      {lastUsed === 'email' && (
        <Text
          variant="bodySmall"
          color={colors.text.tertiary}
          style={styles.lastUsed}
        >
          You last signed in with email
        </Text>
      )}

      <Button
        title="Sign In"
        onPress={handleSubmit(signIn)}
        loading={isLoading}
        fullWidth
        style={styles.button}
      />

      <SocialAuthButtons lastUsed={lastUsed} />

      <Link href="/(auth)/forgot-password" style={styles.link}>
        <Text variant="labelLarge" color={colors.primary[500]}>
          Forgot password?
        </Text>
      </Link>
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
  lastUsed: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
  },
  link: {
    marginTop: spacing.md,
    alignSelf: 'center',
  },
});
