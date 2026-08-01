import { QueryClient, MutationCache } from '@tanstack/react-query';
import { useUIStore } from '@/stores/ui.store';
import { friendlyMutationError } from '@/lib/errors';

export const queryClient = new QueryClient({
  // H2·M4 — consistent mutation-error surfacing: any mutation that doesn't
  // handle its own errors gets the warm global toast instead of failing
  // silently. Screens with richer handling keep it (their onError wins);
  // meta: { suppressGlobalError: true } opts out entirely.
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.onError || mutation.meta?.suppressGlobalError) return;
      useUIStore.getState().showToast(friendlyMutationError(error), 'error');
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      // H2·M3 — 24h (was 30min) so the persisted cache survives long enough
      // to render a cold offline start; must be >= the persister's maxAge.
      gcTime: 1000 * 60 * 60 * 24,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
