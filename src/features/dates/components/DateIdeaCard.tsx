import { Pressable, View, StyleSheet } from 'react-native';
import { Card, Text, Badge } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { DateIdea } from '@/types/api';

interface DateIdeaCardProps {
  idea: DateIdea;
  // Global couple-level rating ("4.6 · 12 couples"), when any exist.
  aggregate?: { avg_rating: number; couples_count: number };
  onPress?: () => void;
}

export function DateIdeaCard({ idea, aggregate, onPress }: DateIdeaCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card variant="elevated" padding="md" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Badge label={idea.category} />
            {aggregate ? (
              <Text variant="labelSmall" color={colors.primary[600]}>
                ★ {aggregate.avg_rating} · {aggregate.couples_count}{' '}
                {aggregate.couples_count === 1 ? 'couple' : 'couples'}
              </Text>
            ) : null}
          </View>
          {idea.estimated_cost && (
            <Text variant="labelMedium" color={colors.text.tertiary}>
              {idea.estimated_cost}
            </Text>
          )}
        </View>
        <Text variant="headlineSmall" style={styles.title}>
          {idea.title}
        </Text>
        <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={2}>
          {idea.description}
        </Text>
        {idea.is_challenge && (
          <Badge label="Challenge" variant="warning" style={styles.challengeBadge} />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  challengeBadge: {
    marginTop: spacing.sm,
  },
});
