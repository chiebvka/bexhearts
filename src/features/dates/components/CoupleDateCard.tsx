import { View, Pressable, StyleSheet } from 'react-native';
import { Card, Text, Badge } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatDate } from '@/lib/dates';
import { getDateStatus, getDateTitle } from '../dateHelpers';

// Loose shape — useCoupleDates joins date_ideas(*), which the generated Row
// type doesn't model.
export interface CoupleDateLike {
  id: string;
  custom_title?: string | null;
  custom_description?: string | null;
  scheduled_for?: string | null;
  completed_at?: string | null;
  rating?: number | null;
  notes?: string | null;
  date_ideas?: { title?: string | null; category?: string | null } | null;
}

interface CoupleDateCardProps {
  coupleDate: CoupleDateLike;
  onComplete?: () => void;
  onRemove?: () => void;
}

const STATUS_META = {
  planned: { label: 'Planned', variant: 'default' as const },
  saved: { label: 'Saved', variant: 'default' as const },
  completed: { label: 'Completed', variant: 'success' as const },
};

export function CoupleDateCard({ coupleDate, onComplete, onRemove }: CoupleDateCardProps) {
  const status = getDateStatus(coupleDate);
  const title = getDateTitle(coupleDate);
  const meta = STATUS_META[status];

  return (
    <Card variant="outlined" padding="md" style={styles.card}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          {title}
        </Text>
        <Badge label={meta.label} variant={meta.variant} />
      </View>

      {status === 'planned' && coupleDate.scheduled_for && (
        <Text variant="bodySmall" color={colors.primary[500]}>
          {formatDate(coupleDate.scheduled_for)}
        </Text>
      )}

      {status === 'completed' && (
        <View style={styles.completedMeta}>
          {coupleDate.rating != null && (
            <Text variant="bodyMedium" color={colors.accent[600]}>
              {'★'.repeat(coupleDate.rating)}
              <Text variant="bodyMedium" color={colors.neutral[300]}>
                {'★'.repeat(Math.max(0, 5 - coupleDate.rating))}
              </Text>
            </Text>
          )}
          {coupleDate.notes ? (
            <Text variant="bodySmall" color={colors.text.secondary} style={styles.notes}>
              &ldquo;{coupleDate.notes}&rdquo;
            </Text>
          ) : null}
        </View>
      )}

      {(onComplete || onRemove) && status !== 'completed' && (
        <View style={styles.actions}>
          {onComplete && (
            <Pressable onPress={onComplete} style={styles.actionButton} hitSlop={8}>
              <Text variant="labelMedium" color={colors.accent[500]}>
                Mark done
              </Text>
            </Pressable>
          )}
          {onRemove && (
            <Pressable onPress={onRemove} style={styles.actionButton} hitSlop={8}>
              <Text variant="labelMedium" color={colors.text.tertiary}>
                Remove
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Card>
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
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
  },
  completedMeta: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  notes: {
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.xs,
  },
});
