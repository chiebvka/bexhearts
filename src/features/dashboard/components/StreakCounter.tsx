import { StyleSheet } from 'react-native';
import { Card, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getStreakMessage } from '@/lib/dates';
import { useCoupleStore } from '@/stores/couple.store';

export function StreakCounter() {
  const streakCount = useCoupleStore((s) => s.streakCount);

  return (
    <Card variant="filled" padding="md" style={styles.card}>
      <Text variant="displayLarge" style={styles.count}>
        {streakCount}
      </Text>
      <Text variant="labelMedium" color={colors.text.secondary}>
        Day Streak
      </Text>
      <Text variant="bodySmall" color={colors.text.tertiary} style={styles.message}>
        {getStreakMessage(streakCount)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  count: {
    color: colors.primary[500],
  },
  message: {
    marginTop: spacing.xs,
  },
});
