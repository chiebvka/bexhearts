// D2·M2 — prayers realtime wiring.
// usePrayersRealtime should subscribe for the current couple, invalidate the
// prayers query when a change event fires, and tear the channel down on unmount.

const prayersChannel = { topic: 'realtime:prayers-couple-1' };
const mockSubscribeToPrayers = jest.fn();

jest.mock('@/services/supabase/realtime', () => ({
  subscribeToPrayers: (...args: unknown[]) => mockSubscribeToPrayers(...args),
}));

const mockRemoveChannel = jest.fn();
jest.mock('@/services/supabase/client', () => ({
  supabase: { removeChannel: (...a: unknown[]) => mockRemoveChannel(...a) },
}));

import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePrayersRealtime } from '@/api/prayers';
import { queryKeys } from '@/api/keys';
import { useCoupleStore } from '@/stores/couple.store';

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('usePrayersRealtime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscribeToPrayers.mockReturnValue(prayersChannel);
    useCoupleStore.setState({ coupleId: 'couple-1', partnerId: 'user-2', isLinked: true });
  });

  it('subscribes for the couple and invalidates the prayers query on an event', () => {
    const queryClient = new QueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => usePrayersRealtime(), { wrapper: makeWrapper(queryClient) });

    expect(mockSubscribeToPrayers).toHaveBeenCalledWith('couple-1', expect.any(Function));

    // Fire the change callback the hook registered.
    const onUpdate = mockSubscribeToPrayers.mock.calls[0][1] as () => void;
    onUpdate();

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.prayers.byCoupleId('couple-1'),
    });
  });

  it('tears the channel down on unmount', () => {
    const queryClient = new QueryClient();
    const { unmount } = renderHook(() => usePrayersRealtime(), {
      wrapper: makeWrapper(queryClient),
    });

    unmount();
    expect(mockRemoveChannel).toHaveBeenCalledWith(prayersChannel);
  });

  it('does not subscribe when there is no couple', () => {
    useCoupleStore.setState({ coupleId: null, partnerId: null, isLinked: false });
    const queryClient = new QueryClient();

    renderHook(() => usePrayersRealtime(), { wrapper: makeWrapper(queryClient) });

    expect(mockSubscribeToPrayers).not.toHaveBeenCalled();
  });
});
