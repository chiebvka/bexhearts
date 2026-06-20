import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuth } from '../hooks/useAuth';
import { otpSchema, type OtpFormData } from '../schemas';

export function VerifyEmailForm({ email }: { email: string }) {
  const { verifyEmailOtp, resendEmailOtp, isLoading, error } = useAuth();
  const [resent, setResent] = useState(false);
  const { control, handleSubmit } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: '' },
  });

  const onVerify = (data: OtpFormData) => verifyEmailOtp(email, data.token);

  const onResend = async () => {
    const ok = await resendEmailOtp(email);
    if (ok) setResent(true);
  };

  return (
    <View style={styles.container}>
      <FormInput
        control={control}
        name="token"
        label="6-digit code"
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        containerStyle={styles.field}
      />

      {error && (
        <Text variant="bodySmall" color={colors.error} style={styles.message}>
          {error}
        </Text>
      )}

      <Button
        title="Verify email"
        onPress={handleSubmit(onVerify)}
        loading={isLoading}
        fullWidth
        style={styles.button}
      />

      <Pressable onPress={onResend} style={styles.resend}>
        <Text variant="bodyMedium" color={colors.primary[500]}>
          {resent ? 'Code re-sent — check your email' : 'Resend code'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  field: { marginBottom: spacing.md },
  message: { marginBottom: spacing.md, textAlign: 'center' },
  button: { marginTop: spacing.sm },
  resend: { marginTop: spacing.lg, alignItems: 'center' },
});
