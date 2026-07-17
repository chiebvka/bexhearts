import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { Input } from '@/components/ui/Input';
import { Button, Text, ModalHeader } from '@/components/ui';
import { getDateTitle } from '@/features/dates';
import { useCoupleDates, useCompleteDate, useRateDateIdea } from '@/api/dates';
import { successHaptic, selectionHaptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// Memory-first completion: lead with "capture the memory" (note), rating
// secondary. Photo capture is a documented fast-follow — it rides on the same
// R2 + expo-image-picker pipeline as avatars (C3b), which needs the owner's R2
// secrets + a rebuild, so it's intentionally not wired here yet.
export default function DateCompleteModal() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dates } = useCoupleDates();
  const completeDate = useCompleteDate();
  const rateIdea = useRateDateIdea();
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');

  const coupleDate = dates?.find((d) => d.id === id);
  const title = coupleDate ? getDateTitle(coupleDate) : 'your date';

  const handleComplete = async () => {
    if (!id) return;
    successHaptic();
    await completeDate.mutateAsync({
      id,
      rating: rating || null,
      notes: notes.trim() || null,
    });
    // Library ideas: your stars also feed the global couple-level aggregate
    // (best-effort — the completion itself already saved).
    if (coupleDate?.date_idea_id && rating > 0) {
      await rateIdea
        .mutateAsync({ dateIdeaId: coupleDate.date_idea_id, rating })
        .catch(() => undefined);
    }
    router.back();
  };

  return (
    <KeyboardAvoid>
      <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
        <ModalHeader title="Capture this memory" />
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.subtitle}>
          How was {title}? A line now becomes part of your story later.
        </Text>

        <Input
          label="A moment to keep"
          placeholder="What made this one special?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          containerStyle={styles.field}
        />

        <Text variant="labelMedium" color={colors.text.tertiary} style={styles.ratingLabel}>
          Rate it (optional)
        </Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => {
                selectionHaptic();
                setRating(n === rating ? 0 : n);
              }}
              hitSlop={6}
            >
              <Text variant="displayMedium" color={n <= rating ? colors.accent[500] : colors.neutral[300]}>
                ★
              </Text>
            </Pressable>
          ))}
        </View>

        {coupleDate?.date_idea_id && rating > 0 ? (
          <Text variant="labelSmall" color={colors.primary[600]} style={styles.ratingHint}>
            Your stars also help other couples find this idea.
          </Text>
        ) : null}

        <Text variant="bodySmall" color={colors.text.tertiary} style={styles.photoHint}>
          📷 Photos for your memories are coming soon.
        </Text>

        <Button
          title="Save moment"
          onPress={handleComplete}
          loading={completeDate.isPending}
          fullWidth
        />
      </ScreenContainer>
    </KeyboardAvoid>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  ratingLabel: {
    marginBottom: spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  ratingHint: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  photoHint: {
    marginBottom: spacing.lg,
  },
});
