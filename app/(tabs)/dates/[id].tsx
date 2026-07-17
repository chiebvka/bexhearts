import { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Badge, Button, EmptyState } from '@/components/ui';
import { SchedulePicker } from '@/features/dates';
import { useDateIdeaById, useSaveDateIdea } from '@/api/dates';
import { successHaptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// discussion_questions is JSONB (Json) — narrow to a string list defensively.
function toQuestions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((q): q is string => typeof q === 'string');
}

export default function DateIdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: idea, isLoading } = useDateIdeaById(id);
  const saveDateIdea = useSaveDateIdea();
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!idea) return <EmptyState title="Date idea not found" />;

  const questions = toQuestions(idea.discussion_questions);

  const handleSave = async () => {
    successHaptic();
    await saveDateIdea.mutateAsync({ dateIdeaId: idea.id, scheduledFor });
    router.back();
  };

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

      {questions.length > 0 && (
        <View style={styles.section}>
          <Text variant="labelLarge" color={colors.primary[500]}>
            Talk about it
          </Text>
          {questions.map((q, i) => (
            <Text key={i} variant="bodyMedium" color={colors.text.secondary} style={styles.question}>
              {`•  ${q}`}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <SchedulePicker value={scheduledFor} onChange={setScheduledFor} />
      </View>

      <Button
        title={scheduledFor ? 'Plan This Date' : 'Save This Date'}
        onPress={handleSave}
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
  question: {
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});
