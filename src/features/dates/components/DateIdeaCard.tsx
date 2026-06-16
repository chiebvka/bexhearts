import { Pressable, View, StyleSheet } from 'react-native';
import { Card, Text, Badge } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { DateIdea } from '@/types/api';

interface DateIdeaCardProps {
  idea: DateIdea;
  onPress?: () => void;
}

export function DateIdeaCard({ idea, onPress }: DateIdeaCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card variant="elevated" padding="md" style={styles.card}>
        <View style={styles.header}>
          <Badge label={idea.category} />
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
  title: {
    marginBottom: spacing.xs,
  },
  challengeBadge: {
    marginTop: spacing.sm,
  },
});
