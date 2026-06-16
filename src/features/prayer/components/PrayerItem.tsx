import { View, Pressable, StyleSheet } from 'react-native';
import { Card, Text, Badge, Avatar } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatRelativeDate } from '@/lib/dates';
import type { Prayer } from '@/types/api';

interface PrayerItemProps {
  prayer: Prayer;
  authorName?: string;
  onMarkAnswered?: () => void;
  onPress?: () => void;
}

export function PrayerItem({ prayer, authorName, onMarkAnswered, onPress }: PrayerItemProps) {
  return (
    <Pressable onPress={onPress}>
      <Card variant="outlined" padding="md" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.meta}>
            <Avatar name={authorName} size="sm" />
            <Text variant="labelMedium" color={colors.text.tertiary} style={styles.date}>
              {formatRelativeDate(prayer.created_at)}
            </Text>
          </View>
          {prayer.is_answered && <Badge label="Answered" variant="success" />}
        </View>

        <Text variant="headlineSmall" style={styles.title}>
          {prayer.title}
        </Text>

        {prayer.body && (
          <Text variant="bodyMedium" color={colors.text.secondary} numberOfLines={2}>
            {prayer.body}
          </Text>
        )}

        {!prayer.is_answered && onMarkAnswered && (
          <Pressable onPress={onMarkAnswered} style={styles.answerButton}>
            <Text variant="labelMedium" color={colors.accent[500]}>
              Mark as Answered
            </Text>
          </Pressable>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  date: {
    marginLeft: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  answerButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
