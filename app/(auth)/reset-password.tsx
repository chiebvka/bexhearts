import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, BackButton } from '@/components/ui';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { ResetPasswordForm } from '@/features/auth';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <KeyboardAvoid>
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <BackButton />
        <View style={styles.header}>
          <Text variant="displayLarge">Reset password</Text>
          <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subtitle}>
            If an account exists for {email ?? 'that email'}, we sent a 6-digit
            code. Enter it below with your new password.
          </Text>
        </View>

        <ResetPasswordForm email={email ?? ''} />
      </View>
    </KeyboardAvoid>
  );
}

const styles = themedStyles(() => ({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
}));
