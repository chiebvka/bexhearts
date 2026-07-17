import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useCreatePrayer, useUpdatePrayer } from '@/api/prayers';

const prayerSchema = z.object({
  title: z.string().min(1, 'Prayer title is required'),
  body: z.string().optional(),
});

type PrayerFormData = z.infer<typeof prayerSchema>;

interface PrayerFormProps {
  onSuccess?: () => void;
  // Edit mode (author only — the screen gates this): prefills and updates
  // instead of creating.
  initial?: { id: string; title: string; body: string | null; isPrivate: boolean };
}

const VISIBILITY_OPTIONS = [
  {
    key: 'shared' as const,
    icon: 'people' as const,
    label: 'Shared',
    hint: 'You pray for this together',
  },
  {
    key: 'personal' as const,
    icon: 'lock-closed' as const,
    label: 'Personal',
    hint: 'Only you can see it',
  },
];

export function PrayerForm({ onSuccess, initial }: PrayerFormProps) {
  const createPrayer = useCreatePrayer();
  const updatePrayer = useUpdatePrayer();
  const [visibility, setVisibility] = useState<'shared' | 'personal'>(
    initial?.isPrivate ? 'personal' : 'shared'
  );
  const { control, handleSubmit, reset } = useForm<PrayerFormData>({
    resolver: zodResolver(prayerSchema),
    defaultValues: { title: initial?.title ?? '', body: initial?.body ?? '' },
  });

  const onSubmit = async (data: PrayerFormData) => {
    if (initial) {
      await updatePrayer.mutateAsync({
        id: initial.id,
        title: data.title,
        body: data.body || null,
        is_private: visibility === 'personal',
      });
    } else {
      await createPrayer.mutateAsync({
        title: data.title,
        body: data.body || null,
        is_private: visibility === 'personal',
      });
    }
    reset();
    onSuccess?.();
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {initial ? 'Edit Prayer' : 'New Prayer Request'}
      </Text>

      <FormInput
        control={control}
        name="title"
        label="What would you like to pray for?"
        placeholder="e.g. Wisdom in our relationship"
        containerStyle={styles.field}
      />

      <FormInput
        control={control}
        name="body"
        label="Details (optional)"
        placeholder="Add more context to your prayer request..."
        multiline
        numberOfLines={3}
        containerStyle={styles.field}
      />

      <Text variant="labelMedium" color={colors.text.tertiary} style={styles.visibilityLabel}>
        Who is this prayer for?
      </Text>
      <View style={styles.visibilityRow}>
        {VISIBILITY_OPTIONS.map((option) => {
          const active = visibility === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setVisibility(option.key)}
              style={[styles.visibilityChip, active && styles.visibilityChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={active ? colors.primary[600] : colors.text.tertiary}
              />
              <View style={styles.visibilityText}>
                <Text
                  variant="labelLarge"
                  color={active ? colors.primary[600] : colors.text.secondary}
                >
                  {option.label}
                </Text>
                <Text variant="labelSmall" color={colors.text.tertiary}>
                  {option.hint}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Button
        title={initial ? 'Save changes' : 'Add Prayer'}
        onPress={handleSubmit(onSubmit)}
        loading={createPrayer.isPending || updatePrayer.isPending}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  visibilityLabel: {
    marginBottom: spacing.sm,
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  visibilityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  visibilityChipActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  visibilityText: {
    flex: 1,
  },
});
