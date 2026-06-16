import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Badge, Button, EmptyState } from '@/components/ui';
import { useDateIdeaById, useSaveDateIdea } from '@/api/dates';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function DateIdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: idea, isLoading } = useDateIdeaById(id);
  const saveDateIdea = useSaveDateIdea();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!idea) return <EmptyState title="Date idea not found" />;

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <View style={styles.badges}>
        <Badge label={idea.category} />
        {idea.estimated_cost && <Badge label={idea.estimated_cost} variant="default" />}
        {idea.is_challenge && <Badge label="Challenge" variant="warning" />}
      </View>

      <Text variant="displayMedium" style={styles.title}>
        {idea.title}
      </Text>

      <Text variant="bodyLarge" style={styles.description}>
        {idea.description}
      </Text>

      {idea.scripture_tie && (
        <View style={styles.section}>
          <Text variant="labelLarge" color={colors.primary[500]}>
            Scripture Connection
          </Text>
          <Text variant="scripture" style={styles.scripture}>
            {idea.scripture_tie}
          </Text>
        </View>
      )}

      <Button
        title="Save This Date"
        onPress={() => saveDateIdea.mutate(idea.id)}
        loading={saveDateIdea.isPending}
        fullWidth
        style={styles.saveButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.md,
  },
  description: {
    color: colors.text.secondary,
    lineHeight: 26,
  },
  section: {
    marginTop: spacing.xl,
  },
  scripture: {
    marginTop: spacing.sm,
    color: colors.text.primary,
  },
  saveButton: {
    marginTop: spacing.xl,
  },
});
