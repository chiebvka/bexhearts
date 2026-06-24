import { z } from 'zod';
import { nameSchema, inviteCodeSchema } from '@/utils/validation';

export const profileSetupSchema = z.object({
  fullName: nameSchema,
  denomination: z.string().optional(),
});

export type ProfileSetupFormData = z.infer<typeof profileSetupSchema>;

export const partnerCodeSchema = z.object({
  code: inviteCodeSchema,
});

export type PartnerCodeFormData = z.infer<typeof partnerCodeSchema>;

// Relationship stage (C1) — one value per couple, drives stage-relevant content
// + paywall targeting. Mirrors the CHECK constraint in 00004_relationship_stage.
export const RELATIONSHIP_STAGES = ['dating', 'engaged', 'married'] as const;
export const relationshipStageSchema = z.enum(RELATIONSHIP_STAGES);
export type RelationshipStage = z.infer<typeof relationshipStageSchema>;

// Personalization (C1b) — "what do you want to grow in?" Multi-select, ≥1.
// Stored on the profile as growth_focus (00006). The label set is UI-only; the
// schema validates the value keys.
const GROWTH_FOCUS_VALUES = [
  'prayer',
  'communication',
  'intimacy',
  'spiritual_growth',
  'conflict',
  'quality_time',
] as const;

export type GrowthFocus = (typeof GROWTH_FOCUS_VALUES)[number];

export const GROWTH_FOCUS_OPTIONS: { value: GrowthFocus; label: string }[] = [
  { value: 'prayer', label: 'Prayer life' },
  { value: 'communication', label: 'Communication' },
  { value: 'intimacy', label: 'Intimacy & connection' },
  { value: 'spiritual_growth', label: 'Spiritual growth' },
  { value: 'conflict', label: 'Handling conflict' },
  { value: 'quality_time', label: 'Quality time' },
];

export const growthFocusSchema = z
  .array(z.enum(GROWTH_FOCUS_VALUES))
  .min(1, 'Pick at least one');
