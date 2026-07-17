// D1·M1 — Bug #2 regression guard.
// `useCompleteDevotional` must upsert with onConflict matching
// UNIQUE(devotional_id, user_id); otherwise re-completing a devotional throws a
// unique-constraint violation instead of updating the existing row.

const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockUpsert = jest.fn(() => ({ select: mockSelect }));
const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));

jest.mock('@/services/supabase/client', () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCompleteDevotional } from '@/api/devotionals';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCompleteDevotional (Bug #2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle.mockResolvedValue({ data: { id: 'progress-1' }, error: null });
    useAuthStore.setState({ user: { id: 'user-1' } as never });
    useCoupleStore.setState({ coupleId: 'couple-1', partnerId: 'user-2', isLinked: true });
  });

  it('upserts with onConflict devotional_id,user_id so re-completion updates', async () => {
    const { result } = renderHook(() => useCompleteDevotional(), { wrapper });

    await act(async () => {
      result.current.mutate({
        devotional_id: 'dev-1',
        reflection_response: 'Grateful today',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFrom).toHaveBeenCalledWith('devotional_progress');
    const [payload, options] = mockUpsert.mock.calls[0];
    expect(options).toEqual({ onConflict: 'devotional_id,user_id' });
    expect(payload).toMatchObject({
      devotional_id: 'dev-1',
      reflection_response: 'Grateful today',
      user_id: 'user-1',
      couple_id: 'couple-1',
    });
    expect(payload).toHaveProperty('completed_at');
  });
});
