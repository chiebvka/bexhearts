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
  onArchive?: () => void;
  onEdit?: () => void; // author only — the screen gates this
  onPress?: () => void;
}

export function PrayerItem({
  prayer,
  authorName,
  onMarkAnswered,
  onArchive,
  onEdit,
  onPress,
}: PrayerItemProps) {
  return (
    <Pressable onPress={onPress}>
      <Card variant="outlined" padding="md" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.meta}>
            <Avatar name={authorName} size="sm" />
            <Text variant="labelMedium" color={colors.text.tertiary} style={styles.date}>
              {prayer.created_at ? formatRelativeDate(prayer.created_at) : ''}
            </Text>
          </View>
          <View style={styles.badges}>
            {prayer.is_private ? <Badge label="Personal" variant="default" /> : null}
            {prayer.is_answered && <Badge label="Answered" variant="success" />}
          </View>
        </View>

        <Text variant="headlineSmall" style={styles.title}>
          {prayer.title}
        </Text>

        {prayer.body && (
          <Text variant="bodyMedium" color={colors.text.secondary} numberOfLines={2}>
            {prayer.body}
          </Text>
        )}

        <View style={styles.actions}>
          {!prayer.is_answered && onMarkAnswered && (
            <Pressable onPress={onMarkAnswered} style={styles.actionButton} hitSlop={8}>
              <Text variant="labelMedium" color={colors.accent[500]}>
                Answered 🙌
              </Text>
            </Pressable>
          )}
          {onEdit && (
            <Pressable onPress={onEdit} style={styles.actionButton} hitSlop={8}>
              <Text variant="labelMedium" color={colors.primary[500]}>
                Edit
              </Text>
            </Pressable>
          )}
          {onArchive && (
            <Pressable onPress={onArchive} style={styles.actionButton} hitSlop={8}>
              <Text variant="labelMedium" color={colors.text.tertiary}>
                Archive
              </Text>
            </Pressable>
          )}
        </View>
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
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  date: {
    marginLeft: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.xs,
  },
});
