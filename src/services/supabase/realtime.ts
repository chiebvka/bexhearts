import { supabase } from './client';

type RealtimeCallback = () => void;

export function subscribeToPrayers(coupleId: string, onUpdate: RealtimeCallback) {
  return supabase
    .channel(`prayers-${coupleId}`)
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

export function subscribeToDevotionalProgress(coupleId: string, onUpdate: RealtimeCallback) {
  return supabase
    .channel(`devotional-progress-${coupleId}`)
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
  return supabase
    .channel(`couple-${coupleId}`)
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

export function unsubscribeAll() {
  supabase.removeAllChannels();
}
