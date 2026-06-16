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
