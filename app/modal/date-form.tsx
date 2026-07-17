import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { Input } from '@/components/ui/Input';
import { Button, ModalHeader } from '@/components/ui';
import { SchedulePicker } from '@/features/dates';
import { useCreateCustomDate } from '@/api/dates';
import { spacing } from '@/theme/spacing';

// Log a couple's own date idea (not from the curated library) — max flexibility.
export default function DateFormModal() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const createCustomDate = useCreateCustomDate();

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createCustomDate.mutateAsync({
      title: title.trim(),
      description: description.trim() || null,
      scheduledFor,
    });
    router.back();
  };

  return (
    <KeyboardAvoid>
      <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
        <ModalHeader title="Create your own date" />

        <Input
          label="What's the date?"
          placeholder="e.g. Sunset drive to the lake"
          value={title}
          onChangeText={setTitle}
          containerStyle={styles.field}
        />
        <Input
          label="Details (optional)"
          placeholder="Anything you want to remember about the plan..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          containerStyle={styles.field}
        />

        <SchedulePicker value={scheduledFor} onChange={setScheduledFor} />

        <Button
          title="Add to Our Dates"
          onPress={handleCreate}
          loading={createCustomDate.isPending}
          disabled={!title.trim()}
          fullWidth
        />
      </ScreenContainer>
    </KeyboardAvoid>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
});
