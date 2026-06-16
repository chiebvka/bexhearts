import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { spacing } from '@/theme/spacing';
import { useCreateBoundary } from '@/api/boundaries';
import type { BoundaryType } from '@/types/common';

const boundarySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  action_plan: z.string().optional(),
});

type BoundaryFormData = z.infer<typeof boundarySchema>;

interface BoundaryFormProps {
  type: BoundaryType;
  onSuccess?: () => void;
}

export function BoundaryForm({ type, onSuccess }: BoundaryFormProps) {
  const createBoundary = useCreateBoundary();
  const { control, handleSubmit, reset } = useForm<BoundaryFormData>({
    resolver: zodResolver(boundarySchema),
    defaultValues: { title: '', description: '', action_plan: '' },
  });

  const isBoundary = type === 'boundary';
  const title = isBoundary ? 'New Boundary' : 'Temptation Plan';

  const onSubmit = async (data: BoundaryFormData) => {
    await createBoundary.mutateAsync({
      type,
      title: data.title,
      description: data.description || null,
      action_plan: data.action_plan || null,
    });
    reset();
    onSuccess?.();
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {title}
      </Text>

      <FormInput
        control={control}
        name="title"
        label={isBoundary ? 'What boundary do you want to set?' : 'What temptation do you face?'}
        placeholder={isBoundary ? 'e.g. No phones during dinner' : 'e.g. Late night texting with others'}
        containerStyle={styles.field}
      />

      <FormInput
        control={control}
        name="description"
        label="Why is this important?"
        placeholder="Describe why this matters to your relationship..."
        multiline
        numberOfLines={2}
        containerStyle={styles.field}
      />

      <FormInput
        control={control}
        name="action_plan"
        label="Action plan"
        placeholder="What steps will you take?"
        multiline
        numberOfLines={2}
        containerStyle={styles.field}
      />

      <Button
        title={`Create ${isBoundary ? 'Boundary' : 'Plan'}`}
        onPress={handleSubmit(onSubmit)}
        loading={createBoundary.isPending}
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
