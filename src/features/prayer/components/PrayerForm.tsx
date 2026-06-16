import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { spacing } from '@/theme/spacing';
import { useCreatePrayer } from '@/api/prayers';

const prayerSchema = z.object({
  title: z.string().min(1, 'Prayer title is required'),
  body: z.string().optional(),
});

type PrayerFormData = z.infer<typeof prayerSchema>;

interface PrayerFormProps {
  onSuccess?: () => void;
}

export function PrayerForm({ onSuccess }: PrayerFormProps) {
  const createPrayer = useCreatePrayer();
  const { control, handleSubmit, reset } = useForm<PrayerFormData>({
    resolver: zodResolver(prayerSchema),
    defaultValues: { title: '', body: '' },
  });

  const onSubmit = async (data: PrayerFormData) => {
    await createPrayer.mutateAsync({
      title: data.title,
      body: data.body || null,
    });
    reset();
    onSuccess?.();
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        New Prayer Request
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

      <Button
        title="Add Prayer"
        onPress={handleSubmit(onSubmit)}
        loading={createPrayer.isPending}
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
});
