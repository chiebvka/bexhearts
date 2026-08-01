import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, BackButton } from '@/components/ui';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { VerifyEmailForm } from '@/features/auth';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <KeyboardAvoid>
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <BackButton />
        <View style={styles.header}>
          <Text variant="displayLarge">Check your email</Text>
          <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subtitle}>
            We sent a 6-digit code to {email ?? 'your inbox'}. Enter it below to
            confirm your account.
          </Text>
        </View>

        <VerifyEmailForm email={email ?? ''} />
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
