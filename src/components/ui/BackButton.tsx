import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface BackButtonProps {
  /**
   * Extra layout for screens whose container is edge-to-edge (padding applied
   * per-section rather than on the screen). Pass `paddingLeft: spacing.md` so
   * the chevron lines up with the title instead of hugging the screen edge.
   */
  style?: ViewStyle;
}

/**
 * Chevron back button for screens deep in a flow.
 * Renders nothing when there is no screen to go back to.
 *
 * The negative left margin cancels the glyph's own left bearing so the
 * chevron optically aligns with the text below it — it assumes the parent
 * already applies the standard horizontal padding.
 */
export function BackButton({ style }: BackButtonProps) {
  if (!router.canGoBack()) {
    return null;
  }

  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={[styles.button, style]}
    >
      <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: -spacing.xs,
    marginBottom: spacing.xs,
  },
});
