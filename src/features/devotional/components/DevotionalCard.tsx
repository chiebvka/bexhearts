import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, Badge } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatRelativeDate } from '@/lib/dates';
import type { Devotional } from '@/types/api';

interface DevotionalCardProps {
  devotional: Devotional;
  isCompleted?: boolean;
  onPress?: () => void;
}

export function DevotionalCard({ devotional, isCompleted, onPress }: DevotionalCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card variant="elevated" padding="md">
        <View style={styles.header}>
          <Text variant="labelMedium" color={colors.text.tertiary}>
            {formatRelativeDate(devotional.publish_date)}
          </Text>
          {isCompleted && <Badge label="Completed" variant="success" />}
          {devotional.is_premium && !isCompleted && <Badge label="Premium" variant="premium" />}
        </View>
        <Text variant="headlineSmall" style={styles.title}>
          {devotional.title}
        </Text>
        <Text variant="bodySmall" color={colors.primary[500]}>
          {devotional.scripture_reference}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
});
