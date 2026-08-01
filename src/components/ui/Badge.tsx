import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/borderRadius';
import { spacing } from '@/theme/spacing';

type BadgeVariant = 'default' | 'success' | 'warning' | 'premium';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

// Function, not a module-scope map: the map would freeze light values at
// import time (theme rule — see src/theme/colors.ts). The success/warning
// pastels now come from the accent/secondary tint scales so they theme too.
function variantStyle(variant: BadgeVariant): { bg: string; text: string } {
  switch (variant) {
    case 'success':
      return { bg: colors.accent[100], text: colors.success };
    case 'warning':
      return { bg: colors.secondary[100], text: colors.warning };
    case 'premium':
      return { bg: colors.secondary[100], text: colors.secondary[700] };
    default:
      return { bg: colors.neutral[200], text: colors.text.secondary };
  }
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const v = variantStyle(variant);

  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text variant="labelSmall" color={v.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
});
