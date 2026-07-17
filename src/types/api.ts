import { Database } from './database';

// Row types (for reading data)
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Couple = Database['public']['Tables']['couples']['Row'];
export type Devotional = Database['public']['Tables']['devotionals']['Row'];
export type DevotionalProgress = Database['public']['Tables']['devotional_progress']['Row'];
export type Prayer = Database['public']['Tables']['prayers']['Row'];
export type CheckIn = Database['public']['Tables']['check_ins']['Row'];
export type Boundary = Database['public']['Tables']['boundaries']['Row'];
export type DateIdea = Database['public']['Tables']['date_ideas']['Row'];
export type CoupleDate = Database['public']['Tables']['couple_dates']['Row'];
export type Milestone = Database['public']['Tables']['couple_milestones']['Row'];
export type Memory = Database['public']['Tables']['memories']['Row'];
export type MemoryImage = Database['public']['Tables']['memory_images']['Row'];
export type MemoryReaction = Database['public']['Tables']['memory_reactions']['Row'];

// Insert types (for creating data)
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type CoupleInsert = Database['public']['Tables']['couples']['Insert'];
export type DevotionalProgressInsert = Database['public']['Tables']['devotional_progress']['Insert'];
export type PrayerInsert = Database['public']['Tables']['prayers']['Insert'];
export type CheckInInsert = Database['public']['Tables']['check_ins']['Insert'];
export type BoundaryInsert = Database['public']['Tables']['boundaries']['Insert'];
export type CoupleDateInsert = Database['public']['Tables']['couple_dates']['Insert'];
export type MilestoneInsert = Database['public']['Tables']['couple_milestones']['Insert'];
export type MemoryInsert = Database['public']['Tables']['memories']['Insert'];

// Update types (for patching data)
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type CoupleUpdate = Database['public']['Tables']['couples']['Update'];
export type DevotionalProgressUpdate = Database['public']['Tables']['devotional_progress']['Update'];
export type PrayerUpdate = Database['public']['Tables']['prayers']['Update'];
export type CheckInUpdate = Database['public']['Tables']['check_ins']['Update'];
export type BoundaryUpdate = Database['public']['Tables']['boundaries']['Update'];
export type CoupleDateUpdate = Database['public']['Tables']['couple_dates']['Update'];
