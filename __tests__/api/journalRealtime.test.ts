// Journal realtime — the hook subscribes for the couple, always refreshes the
// timeline, and additionally refreshes the one open memory when the event row
// carries a memory_id (reactions / images), so partner activity appears live.

const journalChannel = { topic: 'realtime:journal-couple-1' };
const mockSubscribeToJournal = jest.fn();

jest.mock('@/services/supabase/realtime', () => ({
  subscribeToJournal: (...args: unknown[]) => mockSubscribeToJournal(...args),
}));

const mockRemoveChannel = jest.fn();
jest.mock('@/services/supabase/client', () => ({
  supabase: { removeChannel: (...a: unknown[]) => mockRemoveChannel(...a) },
}));

import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useJournalRealtime } from '@/api/journal';
import { queryKeys } from '@/api/keys';
import { useCoupleStore } from '@/stores/couple.store';

type JournalCallback = (payload: {
  new?: Record<string, unknown> | null;
  old?: Record<string, unknown> | null;
}) => void;

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useJournalRealtime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscribeToJournal.mockReturnValue(journalChannel);
    useCoupleStore.setState({ coupleId: 'couple-1', partnerId: 'user-2', isLinked: true });
  });

  it('subscribes for the couple and invalidates the timeline on any event', () => {
    const queryClient = new QueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useJournalRealtime(), { wrapper: makeWrapper(queryClient) });
    expect(mockSubscribeToJournal).toHaveBeenCalledWith('couple-1', expect.any(Function));

    const onUpdate = mockSubscribeToJournal.mock.calls[0][1] as JournalCallback;
    onUpdate({ new: { id: 'mem-1', title: 'Beach day' } });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.journal.timeline('couple-1'),
    });
  });

  it('also refreshes the specific memory for reaction/image events', () => {
    const queryClient = new QueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useJournalRealtime(), { wrapper: makeWrapper(queryClient) });
    const onUpdate = mockSubscribeToJournal.mock.calls[0][1] as JournalCallback;

    onUpdate({ new: { id: 'r1', memory_id: 'mem-9', reaction: 'heart' } });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.journal.memory('mem-9'),
    });

    // DELETE events only carry `old`.
    invalidateSpy.mockClear();
    onUpdate({ old: { id: 'r1', memory_id: 'mem-9' } });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.journal.memory('mem-9'),
    });
  });

  it('tears the channel down on unmount', () => {
    const queryClient = new QueryClient();
    const { unmount } = renderHook(() => useJournalRealtime(), {
      wrapper: makeWrapper(queryClient),
    });

    unmount();
    expect(mockRemoveChannel).toHaveBeenCalledWith(journalChannel);
  });
});
