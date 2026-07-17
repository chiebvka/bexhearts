import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { Input } from '@/components/ui/Input';
import { Button, Text, ModalHeader, LoadingScreen } from '@/components/ui';
import { getDateTitle } from '@/features/dates';
import {
  useCoupleDateById,
  useUpdateDateReflection,
  useRateDateIdea,
} from '@/api/dates';
import { useCreateMemory } from '@/api/journal';
import { formatDate } from '@/lib/dates';
import { successHaptic, selectionHaptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// D6 (owner locked 2026-07-10) — a completed date on the journal wall opens
// here: the memory it captured, editable stars + note (it's THEIR memory), and
// a "Save as a Moment" bridge into the full memory flow (photos live there).
export default function DateViewModal() {
  const insets = useSafeAreaInsets();
  const { dateId } = useLocalSearchParams<{ dateId: string }>();
  const { data: coupleDate, isLoading } = useCoupleDateById(dateId);
  const updateReflection = useUpdateDateReflection();
  const rateIdea = useRateDateIdea();
  const createMemory = useCreateMemory();

  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (coupleDate && !dirty) {
      setRating(coupleDate.rating ?? 0);
      setNotes(coupleDate.notes ?? '');
    }
  }, [coupleDate, dirty]);

  if (isLoading || !coupleDate) return <LoadingScreen />;

  const title = getDateTitle(coupleDate);

  const handleSave = async () => {
    successHaptic();
    await updateReflection.mutateAsync({
      id: coupleDate.id,
      rating: rating || null,
      notes: notes.trim() || null,
    });
    // Library ideas: edited stars also refresh the couple's global rating
    // (best-effort; upsert is unique per idea+user so no double counting).
    if (coupleDate.date_idea_id && rating > 0) {
      await rateIdea
        .mutateAsync({ dateIdeaId: coupleDate.date_idea_id, rating })
        .catch(() => undefined);
    }
    setDirty(false);
    router.back();
  };

  const handleSaveAsMoment = async () => {
    const memory = await createMemory.mutateAsync({
      title,
      description: notes.trim() || null,
      memory_date: (coupleDate.completed_at ?? new Date().toISOString()).slice(0, 10),
    });
    successHaptic();
    // Land on the memory detail, where photos can be added right away.
    router.replace(`/(tabs)/journal/${memory.id}`);
  };

  return (
    <KeyboardAvoid>
      <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
        <ModalHeader title={title} />
        {coupleDate.completed_at && (
          <Text variant="labelMedium" color={colors.text.tertiary} style={styles.when}>
            Completed {formatDate(coupleDate.completed_at)}
          </Text>
        )}

        <Text variant="labelMedium" color={colors.text.tertiary} style={styles.ratingLabel}>
          Your stars
        </Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => {
                selectionHaptic();
                setDirty(true);
                setRating(n === rating ? 0 : n);
              }}
              hitSlop={6}
            >
              <Text
                variant="displayMedium"
                color={n <= rating ? colors.accent[500] : colors.neutral[300]}
              >
                ★
              </Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="The moment you kept"
          placeholder="What made this one special?"
          value={notes}
          onChangeText={(v) => {
            setDirty(true);
            setNotes(v);
          }}
          multiline
          numberOfLines={3}
          containerStyle={styles.field}
        />

        <Button
          title="Save changes"
          onPress={handleSave}
          loading={updateReflection.isPending}
          disabled={!dirty}
          fullWidth
        />
        <Button
          title="Save as a Moment (add photos)"
          variant="secondary"
          onPress={handleSaveAsMoment}
          loading={createMemory.isPending}
          fullWidth
          style={styles.momentButton}
        />
      </ScreenContainer>
    </KeyboardAvoid>
  );
}

const styles = StyleSheet.create({
  when: {
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
  field: {
    marginBottom: spacing.lg,
  },
  momentButton: {
    marginTop: spacing.sm,
  },
});
