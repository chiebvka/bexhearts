import { supabase } from './client';
import type { Profile, Couple, ProfileUpdate } from '@/types/api';

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

export async function createCouple(partnerAId: string, inviteCode: string): Promise<Couple> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  const { data, error } = await supabase
    .from('couples')
    .insert({
      partner_a_id: partnerAId,
      invite_code: inviteCode,
      invite_code_expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

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
