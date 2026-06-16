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

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.neutral[200], text: colors.text.secondary },
  success: { bg: '#E8F5E9', text: colors.success },
  warning: { bg: '#FFF8E1', text: colors.warning },
  premium: { bg: colors.secondary[100], text: colors.secondary[700] },
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const v = variantStyles[variant];

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
