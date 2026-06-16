import { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';
import { fonts } from '@/theme/typography';

interface ReflectionInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
  initialValue?: string;
}

export function ReflectionInput({ onSubmit, isLoading, initialValue = '' }: ReflectionInputProps) {
  const [text, setText] = useState(initialValue);

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={styles.label}>
        Your Reflection
      </Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="What stood out to you today? How does this apply to your relationship?"
        placeholderTextColor={colors.text.tertiary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Button
        title="Save Reflection"
        onPress={() => onSubmit(text)}
        loading={isLoading}
        disabled={!text.trim()}
        fullWidth
        size="sm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
    color: colors.text.secondary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    fontFamily: fonts.sans.regular,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    minHeight: 100,
    marginBottom: spacing.md,
  },
});
