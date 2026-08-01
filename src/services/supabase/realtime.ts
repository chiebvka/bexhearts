import { supabase } from './client';

type RealtimeCallback = () => void;

// supabase-js returns the EXISTING channel instance for a topic that's already
// registered — so on a fast remount (sign-out/in, error-boundary recovery,
// fast refresh) the old subscribed channel comes back and `.on()` throws
// "cannot add postgres_changes callbacks after subscribe()". Always start
// from a clean slate for the topic. (Fixes the 2026-07-11 red screen.)
function freshChannel(topic: string) {
  const existing = supabase
    .getChannels()
    .find((c) => c.topic === `realtime:${topic}`);
  if (existing) {
    void supabase.removeChannel(existing);
  }
  return supabase.channel(topic);
}

export function subscribeToPrayers(coupleId: string, onUpdate: RealtimeCallback) {
  return freshChannel(`prayers-${coupleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'prayers',
        filter: `couple_id=eq.${coupleId}`,
      },
      onUpdate
    )
    .subscribe();
}

// D5 — a partner's boundary add/retire/resolve reflects live (00025 adds
// boundaries to the realtime publication).
export function subscribeToBoundaries(coupleId: string, onUpdate: RealtimeCallback) {
  return freshChannel(`boundaries-${coupleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'boundaries',
        filter: `couple_id=eq.${coupleId}`,
      },
      onUpdate
    )
    .subscribe();
}

export function subscribeToDevotionalProgress(coupleId: string, onUpdate: RealtimeCallback) {
  return freshChannel(`devotional-progress-${coupleId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'devotional_progress',
        filter: `couple_id=eq.${coupleId}`,
      },
      onUpdate
    )
    .subscribe();
}

export function subscribeToCoupleUpdates(coupleId: string, onUpdate: RealtimeCallback) {
  return freshChannel(`couple-${coupleId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'couples',
        filter: `id=eq.${coupleId}`,
      },
      onUpdate
    )
    .subscribe();
}

// Journal events carry their row so the caller can also refresh the one open
// memory (reactions/images reference it via memory_id).
type JournalRealtimeCallback = (payload: {
  new?: Record<string, unknown> | null;
  old?: Record<string, unknown> | null;
}) => void;

export function subscribeToJournal(coupleId: string, onUpdate: JournalRealtimeCallback) {
  return freshChannel(`journal-${coupleId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'memories', filter: `couple_id=eq.${coupleId}` },
      onUpdate
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'couple_milestones', filter: `couple_id=eq.${coupleId}` },
      onUpdate
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'memory_images', filter: `couple_id=eq.${coupleId}` },
      onUpdate
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'memory_reactions', filter: `couple_id=eq.${coupleId}` },
      onUpdate
    )
    .subscribe();
}

// G1 — the Home bell goes live the moment a notification row lands.
export function subscribeToNotifications(userId: string, onUpdate: RealtimeCallback) {
  return freshChannel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`,
      },
      onUpdate
    )
    .subscribe();
}

export function unsubscribeAll() {
  supabase.removeAllChannels();
}
