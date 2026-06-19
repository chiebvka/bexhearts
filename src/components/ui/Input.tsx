import { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/borderRadius';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label && (
        <Text variant="labelLarge" style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.focused,
          error && styles.error,
          style,
        ]}
        placeholderTextColor={colors.text.tertiary}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <Text variant="bodySmall" color={colors.error} style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
    color: colors.text.secondary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.none,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 4,
    fontSize: 16,
    fontFamily: fonts.sans.regular,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  focused: {
    borderColor: colors.primary[500],
  },
  error: {
    borderColor: colors.error,
  },
  errorText: {
    marginTop: spacing.xs,
  },
});
