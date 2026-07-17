import { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';
import { useCreateBoundary } from '@/api/boundaries';
import { useMyCouple } from '@/api/couples';
import { getCategoriesForType, getCategoryLabel, getTitlePlaceholder } from '../categories';
import { getTemplatesFor, type BoundaryTemplate } from '../templates';
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
  const { data: couple } = useMyCouple();
  const [category, setCategory] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const { control, handleSubmit, reset, setValue } = useForm<BoundaryFormData>({
    resolver: zodResolver(boundarySchema),
    defaultValues: { title: '', description: '', action_plan: '' },
  });

  const isBoundary = type === 'boundary';
  const title = isBoundary ? 'New Boundary' : 'A plan for the hard moments';
  const categories = getCategoriesForType(type);
  const templates = getTemplatesFor(type, couple?.relationship_stage, category);

  const applyTemplate = (t: BoundaryTemplate) => {
    setTemplateId(t.id);
    setCategory(t.category);
    setValue('title', t.title, { shouldValidate: true });
    setValue('description', t.description);
    setValue('action_plan', t.actionPlan ?? '');
  };

  const onSubmit = async (data: BoundaryFormData) => {
    await createBoundary.mutateAsync({
      type,
      title: data.title,
      description: data.description || null,
      // Action plans are temptation-plan machinery; boundaries are a
      // statement + why (form decision, owner 2026-07-10).
      action_plan: (isBoundary ? null : data.action_plan) || null,
      category,
    });
    reset();
    setCategory(null);
    setTemplateId(null);
    onSuccess?.();
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {title}
      </Text>

      {/* Grace-framed intro for temptation plans — this is an act of courage,
          never a confession to be scored. */}
      {!isBoundary && (
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.intro}>
          You&apos;re not alone in this. Name the struggle and the step you&apos;ll take —
          so your partner can stand with you, not keep score.
        </Text>
      )}

      <Text variant="labelMedium" color={colors.text.tertiary} style={styles.categoryLabel}>
        Category
      </Text>
      <View style={styles.chips}>
        {categories.map((c) => {
          const selected = category === c.value;
          return (
            <Pressable
              key={c.value}
              onPress={() => setCategory(selected ? null : c.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text
                variant="labelMedium"
                color={selected ? colors.text.inverse : colors.text.secondary}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {templates.length > 0 && (
        <>
          <Text variant="labelMedium" color={colors.text.tertiary} style={styles.categoryLabel}>
            {isBoundary ? 'Start from a template' : 'Common struggles — tap one that fits'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.templateRail}
            contentContainerStyle={styles.templateRailContent}
          >
            {templates.map((t) => {
              const selected = templateId === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => applyTemplate(t)}
                  style={[styles.templateCard, selected && styles.templateCardSelected]}
                >
                  <Text
                    variant="labelMedium"
                    color={selected ? colors.primary[600] : colors.text.primary}
                    numberOfLines={3}
                  >
                    {t.title}
                  </Text>
                  <Text variant="labelMedium" color={colors.text.tertiary} style={styles.templateCategory}>
                    {getCategoryLabel(type, t.category)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}

      <FormInput
        control={control}
        name="title"
        label={isBoundary ? 'What boundary do you want to set?' : 'What are you facing?'}
        placeholder={getTitlePlaceholder(type, category)}
        containerStyle={styles.field}
      />

      <FormInput
        control={control}
        name="description"
        label={
          isBoundary ? 'Why is this important? (optional)' : 'Why does this matter to you? (optional)'
        }
        placeholder="Describe why this matters to your relationship..."
        multiline
        numberOfLines={2}
        containerStyle={styles.field}
      />

      {!isBoundary && (
        <FormInput
          control={control}
          name="action_plan"
          label="Your plan when it hits"
          placeholder="e.g. Step away and text my partner"
          multiline
          numberOfLines={2}
          containerStyle={styles.field}
        />
      )}

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
    marginBottom: spacing.md,
  },
  intro: {
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  categoryLabel: {
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
  },
  chipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  templateRail: {
    flexGrow: 0,
    marginBottom: spacing.lg,
  },
  templateRailContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  templateCard: {
    width: 200,
    padding: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
  },
  templateCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  templateCategory: {
    marginTop: spacing.xs,
  },
  field: {
    marginBottom: spacing.md,
  },
});
