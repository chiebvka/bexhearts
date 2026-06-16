import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { SignInForm } from '@/features/auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoid>
      <View style={[styles.container, { paddingTop: insets.top + spacing['2xl'] }]}>
        <View style={styles.header}>
          <Text variant="displayLarge">Welcome back</Text>
          <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subtitle}>
            Sign in to continue growing together.
          </Text>
        </View>

        <SignInForm />

        <View style={styles.footer}>
          <Text variant="bodyMedium" color={colors.text.secondary}>
            {"Don't have an account? "}
          </Text>
          <Link href="/(auth)/sign-up">
            <Text variant="labelLarge" color={colors.primary[500]}>
              Sign Up
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
