import { type PropsWithChildren } from 'react';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { queryClient } from '@/api/client';
import { QUERY_CACHE_KEY } from '@/lib/persistedStorage';
import { shouldPersistQuery } from '@/features/cache/persistPolicy';

// H2·M3 — persist the query cache (AsyncStorage: works in Expo Go AND the
// dev build) so a cold start on a bad network renders last-known-good
// content (devotional, prayers, journal, streaks) instantly instead of a
// blank app. Privacy note: this is a device-local cache on the owner's own
// phone (documented in PRIVACY_POLICY.md); it is wiped with the app and
// busted on version upgrades.
const persister = createAsyncStoragePersister({
  key: QUERY_CACHE_KEY,
  storage: AsyncStorage,
});

const MAX_AGE_MS = 1000 * 60 * 60 * 24; // matches the query client's gcTime

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: MAX_AGE_MS,
        // New app version = fresh cache (shapes may have changed).
        buster: Constants.expoConfig?.version ?? 'dev',
        dehydrateOptions: {
          // Never write live entitlement/pricing state, and never write a
          // value that would come back as a different shape — see
          // features/cache/persistPolicy.ts for why both matter.
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success' &&
            shouldPersistQuery(query.queryKey, query.state.data),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
