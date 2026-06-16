import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name is too long');

export const inviteCodeSchema = z
  .string()
  .min(1, 'Invite code is required')
  .transform((val) => val.toUpperCase().replace(/[^A-Z0-9]/g, ''))
  .refine((val) => val.length === 6, 'Invite code must be 6 characters');
