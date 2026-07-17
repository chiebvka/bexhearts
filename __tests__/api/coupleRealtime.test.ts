// D7 — couple-wide realtime wiring (devotional progress + couple updates).
const mockRemoveChannel = jest.fn();
const progressChannel = { topic: 'realtime:devotional-progress-couple-1' };
const coupleChannel = { topic: 'realtime:couple-couple-1' };
const mockSubscribeProgress = jest.fn(() => progressChannel);
const mockSubscribeCouple = jest.fn(() => coupleChannel);

jest.mock('@/services/supabase/realtime', () => ({
  subscribeToDevotionalProgress: (...a: unknown[]) => mockSubscribeProgress(...a),
  subscribeToCoupleUpdates: (...a: unknown[]) => mockSubscribeCouple(...a),
}));

jest.mock('@/services/supabase/client', () => ({
  supabase: { removeChannel: (...a: unknown[]) => mockRemoveChannel(...a) },
}));
jest.mock('@/services/supabase/database', () => ({ refreshInviteCode: jest.fn() }));

import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCoupleRealtime } from '@/api/couples';
import { queryKeys } from '@/api/keys';
import { useCoupleStore } from '@/stores/couple.store';

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useCoupleRealtime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCoupleStore.setState({ coupleId: 'couple-1', partnerId: 'user-2', isLinked: true });
  });

  it('subscribes to both channels for the couple', () => {
    const queryClient = new QueryClient();
    renderHook(() => useCoupleRealtime(), { wrapper: makeWrapper(queryClient) });

    expect(mockSubscribeProgress).toHaveBeenCalledWith('couple-1', expect.any(Function));
    expect(mockSubscribeCouple).toHaveBeenCalledWith('couple-1', expect.any(Function));
  });

  it('a devotional-progress event refreshes devotionals + the couple row (streak)', () => {
    const queryClient = new QueryClient();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    renderHook(() => useCoupleRealtime(), { wrapper: makeWrapper(queryClient) });

    (mockSubscribeProgress.mock.calls[0][1] as () => void)();

    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.devotionals.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.couple.mine() });
  });

  it('a couple event refreshes the couple + partner queries', () => {
    const queryClient = new QueryClient();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    renderHook(() => useCoupleRealtime(), { wrapper: makeWrapper(queryClient) });

    (mockSubscribeCouple.mock.calls[0][1] as () => void)();

    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.couple.mine() });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.couple.partner() });
  });

  it('tears both channels down on unmount', () => {
    const queryClient = new QueryClient();
    const { unmount } = renderHook(() => useCoupleRealtime(), {
      wrapper: makeWrapper(queryClient),
    });
    unmount();
    expect(mockRemoveChannel).toHaveBeenCalledWith(progressChannel);
    expect(mockRemoveChannel).toHaveBeenCalledWith(coupleChannel);
  });

  it('does not subscribe without a couple', () => {
    useCoupleStore.setState({ coupleId: null, partnerId: null, isLinked: false });
    const queryClient = new QueryClient();
    renderHook(() => useCoupleRealtime(), { wrapper: makeWrapper(queryClient) });
    expect(mockSubscribeProgress).not.toHaveBeenCalled();
    expect(mockSubscribeCouple).not.toHaveBeenCalled();
  });
});
