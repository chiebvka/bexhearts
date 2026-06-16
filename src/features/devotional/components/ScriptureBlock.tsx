import { StyleSheet } from 'react-native';
import { Text, Card } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ScriptureBlockProps {
  reference: string;
  text: string;
}

export function ScriptureBlock({ reference, text }: ScriptureBlockProps) {
  return (
    <Card variant="filled" padding="lg" style={styles.container}>
      <Text variant="scripture" style={styles.text}>
        {'"'}
        {text}
        {'"'}
      </Text>
      <Text variant="labelMedium" color={colors.primary[500]} style={styles.reference}>
        — {reference}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  text: {
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  reference: {
    textAlign: 'right',
  },
});
