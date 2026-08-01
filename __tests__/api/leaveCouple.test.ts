// E14 — leaving a couple. The RPC does the destructive part server-side; what
// these tests pin is the CLIENT-side cleanup, because getting it wrong leaks
// an ex-partner's data or strands a paying subscriber on a couple they left.
const mockRpc = jest.fn();
const mockIdentifyUser = jest.fn();
const mockPurgeCache = jest.fn();
const mockClearOutbox = jest.fn();

jest.mock('@/services/supabase/client', () => ({
  supabase: { rpc: (...a: unknown[]) => mockRpc(...a) },
}));
jest.mock('@/services/supabase/database', () => ({ refreshInviteCode: jest.fn() }));
jest.mock('@/services/supabase/realtime', () => ({
  subscribeToDevotionalProgress: jest.fn(),
  subscribeToCoupleUpdates: jest.fn(),
}));
jest.mock('@/services/revenuecat/client', () => ({
  identifyUser: (...a: unknown[]) => mockIdentifyUser(...a),
}));
jest.mock('@/lib/persistedStorage', () => ({
  purgePersistedQueryCache: () => mockPurgeCache(),
  QUERY_CACHE_KEY: 'bexhearts.queryCache',
  UPLOAD_OUTBOX_KEY: 'bexhearts.uploadOutbox',
}));
jest.mock('@/stores/uploads.store', () => ({ clearOutbox: () => mockClearOutbox() }));

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLeaveCouple } from '@/api/couples';
import { useCoupleStore } from '@/stores/couple.store';
import { useAuthStore } from '@/stores/auth.store';

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useLeaveCouple', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ error: null });
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    useCoupleStore.getState().setCoupleContext('couple-1', 'partner-1');
    useAuthStore.setState({ user: { id: 'user-1' } as never });
  });

  it('calls the server RPC — the detach is never done client-side', async () => {
    const { result } = renderHook(() => useLeaveCouple(), {
      wrapper: makeWrapper(queryClient),
    });
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockRpc).toHaveBeenCalledWith('leave_couple');
  });

  it('re-identifies RevenueCat to the INDIVIDUAL so the payer keeps their subscription', async () => {
    const { result } = renderHook(() => useLeaveCouple(), {
      wrapper: makeWrapper(queryClient),
    });
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // null coupleId => the app-user id falls back to the user's own id.
    expect(mockIdentifyUser).toHaveBeenCalledWith('user-1', null);
  });

  it('purges the PERSISTED cache and the upload outbox', async () => {
    // Without this the ex-partner's prayers/journal restore from disk on the
    // next cold start, and queued photos would upload into their space.
    const { result } = renderHook(() => useLeaveCouple(), {
      wrapper: makeWrapper(queryClient),
    });
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPurgeCache).toHaveBeenCalled();
    expect(mockClearOutbox).toHaveBeenCalled();
  });

  it('clears couple context so the app treats them as solo again', async () => {
    const { result } = renderHook(() => useLeaveCouple(), {
      wrapper: makeWrapper(queryClient),
    });
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useCoupleStore.getState().coupleId).toBeNull();
    expect(useCoupleStore.getState().isLinked).toBe(false);
  });

  it('does NOT clean up when the server rejects — no half-left state', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'nope' } });
    const { result } = renderHook(() => useLeaveCouple(), {
      wrapper: makeWrapper(queryClient),
    });
    result.current.mutate();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockIdentifyUser).not.toHaveBeenCalled();
    expect(mockPurgeCache).not.toHaveBeenCalled();
    expect(useCoupleStore.getState().coupleId).toBe('couple-1');
  });
});
