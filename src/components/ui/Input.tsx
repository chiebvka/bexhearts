import { useState } from 'react';
import {
  TextInput,
  View,
  Pressable,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  secureTextEntry,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View style={containerStyle}>
      {label && (
        <Text variant="labelLarge" style={styles.label}>
          {label}
        </Text>
      )}
      <View style={styles.inputRow}>
        <TextInput
          {...props}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={colors.text.tertiary}
          style={[
            styles.input,
            isFocused && styles.focused,
            error && styles.error,
            isPassword && styles.inputWithIcon,
            style,
          ]}
        />
        {isPassword && (
          <Pressable
            onPress={() => setIsPasswordVisible((v) => !v)}
            style={styles.eyeButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.text.tertiary}
            />
          </Pressable>
        )}
      </View>
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
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
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
  inputWithIcon: {
    paddingRight: 48,
  },
  focused: {
    borderColor: colors.primary[500],
  },
  error: {
    borderColor: colors.error,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    marginTop: spacing.xs,
  },
});
