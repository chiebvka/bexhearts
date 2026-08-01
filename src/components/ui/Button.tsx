import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/borderRadius';
import { spacing } from '@/theme/spacing';
import { lightHaptic } from '@/lib/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

// Function, not a module-scope map: the map would freeze light values at
// import time (theme rule — see src/theme/colors.ts).
function variantStyle(variant: ButtonVariant): { container: ViewStyle; text: TextStyle } {
  switch (variant) {
    case 'secondary':
      return {
        container: { backgroundColor: colors.secondary[500] },
        text: { color: colors.text.inverse },
      };
    case 'outline':
      return {
        container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary[500] },
        text: { color: colors.primary[500] },
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent' },
        text: { color: colors.primary[500] },
      };
    case 'danger':
      return {
        container: { backgroundColor: colors.error },
        text: { color: colors.text.inverse },
      };
    default:
      return {
        container: { backgroundColor: colors.primary[500] },
        text: { color: colors.text.inverse },
      };
  }
}

const sizeStyles: Record<ButtonSize, { container: ViewStyle; fontSize: number }> = {
  sm: { container: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }, fontSize: 14 },
  md: { container: { paddingVertical: spacing.md - 4, paddingHorizontal: spacing.lg }, fontSize: 16 },
  lg: { container: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl }, fontSize: 16 },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const vStyle = variantStyle(variant);
  const sStyle = sizeStyles[size];

  return (
    <Pressable
      onPress={() => {
        lightHaptic();
        onPress();
      }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        vStyle.container,
        sStyle.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyle.text.color} size="small" />
      ) : (
        <Text
          variant={size === 'sm' ? 'buttonSmall' : 'button'}
          color={vStyle.text.color as string}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.none,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
