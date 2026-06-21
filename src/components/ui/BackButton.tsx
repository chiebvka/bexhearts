import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

/**
 * Chevron back button for screens deep in a flow (auth / onboarding).
 * Renders nothing when there is no screen to go back to.
 */
export function BackButton() {
  if (!router.canGoBack()) {
    return null;
  }

  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={styles.button}
    >
      <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: -spacing.xs,
    marginBottom: spacing.sm,
  },
});
