import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatRelativeDate } from '@/lib/dates';
import { getEntryMeta } from '../entryMeta';
import { getCountdown } from '../countdown';
import { FannedPolaroids } from './FannedPolaroids';
import type { TimelineEntry } from '../timeline';

interface TimelineEntryCardProps {
  entry: TimelineEntry;
  onPress?: () => void;
}

// B+C hybrid: a purple glyph badge on the rail (spine), then a card whose weight
// depends on the entry — milestones get a tinted highlight, memories a fuller
// card, auto-entries (prayer/date) a compact row.
export function TimelineEntryCard({ entry, onPress }: TimelineEntryCardProps) {
  const meta = getEntryMeta(entry.type);
  const isMilestone = entry.type === 'milestone';

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={styles.badge}>
          <Ionicons name={meta.icon} size={15} color={colors.primary[600]} />
        </View>
      </View>

      <Pressable style={styles.cardWrap} onPress={onPress} disabled={!onPress}>
        <Card variant={isMilestone ? 'filled' : 'outlined'} padding="md" style={isMilestone ? styles.milestoneCard : undefined}>
          <View style={styles.head}>
            <Text variant="labelSmall" color={colors.primary[600]}>
              {meta.label}
            </Text>
            <Text variant="labelSmall" color={colors.text.tertiary}>
              {isMilestone ? getCountdown(entry.date).label : formatRelativeDate(entry.date)}
            </Text>
          </View>

          <Text variant="headlineSmall" style={styles.title}>
            {entry.title}
          </Text>

          {entry.subtitle ? (
            <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={2}>
              {entry.subtitle}
            </Text>
          ) : null}

          {entry.imageUrls && entry.imageUrls.length > 0 ? (
            <FannedPolaroids imageUrls={entry.imageUrls} />
          ) : null}
        </Card>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rail: {
    width: 32,
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrap: {
    flex: 1,
    marginBottom: spacing.md,
  },
  milestoneCard: {
    backgroundColor: colors.primary[50],
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
});
