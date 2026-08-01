import AsyncStorage from '@react-native-async-storage/async-storage';

// H2 — the two things this app persists to disk outside the DB. Kept in one
// tiny module (no native/provider imports) so both the writers and the
// sign-out cleanup can reach them without dragging components along.
export const QUERY_CACHE_KEY = 'bexhearts.queryCache';
export const UPLOAD_OUTBOX_KEY = 'bexhearts.uploadOutbox';

// Sign-out hygiene (same rule as G1's push-token clearing): queryClient.clear()
// only empties memory — without this the NEXT user on a shared device would
// restore the previous user's cached prayers/journal from disk on cold start.
export function purgePersistedQueryCache(): void {
  AsyncStorage.removeItem(QUERY_CACHE_KEY).catch(() => {});
}
