import { z } from 'zod';

export const checkInSchema = z.object({
  emotional_connection: z.number().min(1).max(5),
  spiritual_connection: z.number().min(1).max(5),
  communication_quality: z.number().min(1).max(5),
  gratitude_note: z.string().optional(),
  growth_area: z.string().optional(),
  prayer_request: z.string().optional(),
});

export type CheckInFormData = z.infer<typeof checkInSchema>;
