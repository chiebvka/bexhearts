import { View, StyleSheet, type ViewStyle, type ViewProps } from 'react-native';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/borderRadius';
import { spacing } from '@/theme/spacing';
import { shadows } from '@/theme/shadows';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: keyof typeof spacing;
  style?: ViewStyle;
}

// Function, not a module-scope map: the map would freeze light values at
// import time (theme rule — see src/theme/colors.ts).
function variantStyle(variant: CardVariant): ViewStyle {
  switch (variant) {
    case 'outlined':
      return {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.neutral[200],
      };
    case 'filled':
      return { backgroundColor: colors.neutral[100] };
    default:
      return { backgroundColor: colors.surface, ...shadows.md };
  }
}

export function Card({
  variant = 'elevated',
  padding = 'md',
  style,
  children,
  ...props
}: CardProps) {
  return (
    <View
      style={[styles.base, variantStyle(variant), { padding: spacing[padding] }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
  },
});
