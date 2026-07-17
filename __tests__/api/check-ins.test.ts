// D3·M2 — Bug #1 regression guard.
// `useSubmitCheckIn` must upsert with onConflict matching
// UNIQUE(couple_id, user_id, week_of); otherwise resubmitting the same week's
// check-in throws a unique-constraint violation instead of updating.

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
import { useSubmitCheckIn } from '@/api/check-ins';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useSubmitCheckIn (Bug #1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle.mockResolvedValue({ data: { id: 'checkin-1' }, error: null });
    useAuthStore.setState({ user: { id: 'user-1' } as never });
    useCoupleStore.setState({ coupleId: 'couple-1', partnerId: 'user-2', isLinked: true });
  });

  it('upserts with onConflict couple_id,user_id,week_of so resubmits update', async () => {
    const { result } = renderHook(() => useSubmitCheckIn(), { wrapper });

    await act(async () => {
      result.current.mutate({
        emotional_connection: 4,
        spiritual_connection: 5,
        communication_quality: 3,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFrom).toHaveBeenCalledWith('check_ins');
    const [payload, options] = mockUpsert.mock.calls[0];
    expect(options).toEqual({ onConflict: 'couple_id,user_id,week_of' });
    expect(payload).toMatchObject({
      emotional_connection: 4,
      spiritual_connection: 5,
      communication_quality: 3,
      user_id: 'user-1',
      couple_id: 'couple-1',
    });
    expect(payload).toHaveProperty('week_of');
  });
});
