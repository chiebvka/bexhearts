import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { SignUpForm } from '@/features/auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoid>
      <View style={[styles.container, { paddingTop: insets.top + spacing['2xl'] }]}>
        <View style={styles.header}>
          <Text variant="displayLarge">Create account</Text>
          <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subtitle}>
            Start your journey of intentional love.
          </Text>
        </View>

        <SignUpForm />

        <View style={styles.footer}>
          <Text variant="bodyMedium" color={colors.text.secondary}>
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/sign-in">
            <Text variant="labelLarge" color={colors.primary[500]}>
              Sign In
            </Text>
          </Link>
        </View>
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
  header: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
