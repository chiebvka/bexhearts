import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuth } from '../hooks/useAuth';

/**
 * Subtle "Sign out" link for screens outside the tabs (e.g. onboarding), so a
 * signed-in-but-not-onboarded user can bail. The primary sign-out lives on the
 * Profile tab.
 */
export function SignOutLink() {
  const { signOut } = useAuth();

  return (
    <Pressable
      onPress={signOut}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      style={styles.button}
    >
      <Text variant="bodyMedium" color={colors.text.tertiary}>
        Sign out
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
});
