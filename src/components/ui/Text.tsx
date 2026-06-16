import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { textStyles, type TextVariant } from '@/theme/typography';
import { colors } from '@/theme/colors';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

export function Text({
  variant = 'bodyMedium',
  color = colors.text.primary,
  style,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[textStyles[variant], { color }, style]}
      {...props}
    />
  );
}
