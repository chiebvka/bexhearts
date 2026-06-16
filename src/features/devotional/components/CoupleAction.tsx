import { Pressable, StyleSheet } from 'react-native';
import { Card, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';
import { selectionHaptic } from '@/lib/haptics';

interface CoupleActionProps {
  action: string;
  completed: boolean;
  onToggle: () => void;
}

export function CoupleAction({ action, completed, onToggle }: CoupleActionProps) {
  return (
    <Card variant="outlined" padding="md">
      <Text variant="labelLarge" color={colors.primary[500]} style={styles.label}>
        Couple Action
      </Text>
      <Text variant="bodyLarge" style={styles.action}>
        {action}
      </Text>
      <Pressable
        style={[styles.checkbox, completed && styles.checked]}
        onPress={() => {
          selectionHaptic();
          onToggle();
        }}
      >
        <Text
          variant="labelLarge"
          color={completed ? colors.text.inverse : colors.primary[500]}
        >
          {completed ? 'Completed!' : 'Mark as Done'}
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
  },
  action: {
    marginBottom: spacing.md,
  },
  checkbox: {
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  checked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
});
