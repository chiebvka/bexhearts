import { supabase } from './client';
import { withUniqueInviteCode } from '@/utils/invite-code';
import { getDeviceTimeZone } from '@/lib/dates';
import type { Profile, Couple, CoupleInsert, ProfileUpdate } from '@/types/api';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Issue a fresh invite code + 48h expiry on an existing couple. Powers re-invite
// after a partner leaves (a left couple has an expired code) and re-generating an
// expired onboarding code. RLS ("Partners can update couple") authorizes it.
export async function refreshInviteCode(coupleId: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  // Retry on the rare unique-code collision (C2·M1).
  const { code } = await withUniqueInviteCode((newCode) =>
    supabase
      .from('couples')
      .update({
        invite_code: newCode,
        invite_code_expires_at: expiresAt.toISOString(),
      })
      .eq('id', coupleId)
      .then(({ error }) => ({ data: null, error }))
  );

  return code;
}

export async function getCouple(coupleId: string): Promise<Couple | null> {
  const { data, error } = await supabase
    .from('couples')
    .select('*')
    .eq('id', coupleId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createCouple(
  partnerAId: string,
  options?: Pick<CoupleInsert, 'relationship_stage' | 'stage_started_on' | 'is_long_distance'>
): Promise<Couple> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  // Generate a unique invite code, retrying on the rare collision (C2·M1).
  const { data } = await withUniqueInviteCode<Couple>((code) =>
    supabase
      .from('couples')
      .insert({
        partner_a_id: partnerAId,
        invite_code: code,
        invite_code_expires_at: expiresAt.toISOString(),
        relationship_stage: options?.relationship_stage ?? null,
        stage_started_on: options?.stage_started_on ?? null,
        // E11 — captured with the relationship stage in onboarding.
        is_long_distance: options?.is_long_distance ?? false,
        // Anchor the streak's "day" to the creator's timezone (D6).
        timezone: getDeviceTimeZone(),
      })
      .select()
      .single()
  );

  if (!data) throw new Error('Failed to create couple');

  // Update the creator's profile with the couple_id
  await supabase
    .from('profiles')
    .update({ couple_id: data.id })
    .eq('id', partnerAId);

  return data;
}

export async function linkPartner(inviteCode: string): Promise<string> {
  const { data, error } = await supabase.rpc('link_partner', {
    p_invite_code: inviteCode.toUpperCase().trim(),
  });

  if (error) throw error;
  return data as string;
}

export async function getPartnerProfile(coupleId: string, myUserId: string): Promise<Profile | null> {
  const { data: couple } = await supabase
    .from('couples')
    .select('partner_a_id, partner_b_id')
    .eq('id', coupleId)
    .single();

  if (!couple) return null;

  const partnerId = couple.partner_a_id === myUserId
    ? couple.partner_b_id
    : couple.partner_a_id;

  if (!partnerId) return null;

  return getProfile(partnerId);
}
