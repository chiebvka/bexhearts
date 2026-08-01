import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

const mockRpc = jest.fn();
jest.mock('@/services/supabase/client', () => ({
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));

const mockCheckPremium = jest.fn();
jest.mock('@/services/revenuecat/client', () => ({
  checkPremium: () => mockCheckPremium(),
}));

const mockAuthState = { isAuthenticated: true };
jest.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: mockAuthState.isAuthenticated }),
}));

import { checkCompAccess } from '@/api/comp';
import { useEntitlementAccess } from '@/features/subscription/hooks/useEntitlement';
import { NON_PERSISTED_KEY_ROOTS } from '@/features/cache/persistPolicy';
import { queryKeys } from '@/api/keys';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthState.isAuthenticated = true;
  mockCheckPremium.mockResolvedValue(false);
  mockRpc.mockResolvedValue({ data: false, error: null });
});

describe('comp access — the server check', () => {
  it('grants when the RPC says true', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    await expect(checkCompAccess()).resolves.toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('has_comp_access');
  });

  it('fails CLOSED when the RPC errors', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(checkCompAccess()).resolves.toBe(false);
  });

  it('fails CLOSED before 00036 is applied (function does not exist)', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'function public.has_comp_access() does not exist' },
    });
    await expect(checkCompAccess()).resolves.toBe(false);
  });

  it('fails CLOSED when the call throws outright (offline)', async () => {
    mockRpc.mockRejectedValue(new Error('Network request failed'));
    await expect(checkCompAccess()).resolves.toBe(false);
  });

  it('never coerces a truthy non-boolean into a grant', async () => {
    mockRpc.mockResolvedValue({ data: 'yes', error: null });
    await expect(checkCompAccess()).resolves.toBe(false);
  });
});

describe('useEntitlementAccess — RevenueCat OR comp', () => {
  it('entitles a store subscriber with no comp', async () => {
    mockCheckPremium.mockResolvedValue(true);
    const { result } = renderHook(() => useEntitlementAccess(), { wrapper });

    await waitFor(() => expect(result.current.isEntitled).toBe(true));
    expect(result.current.reason).toBe('revenuecat');
  });

  it('entitles a comped user with no store subscription', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    const { result } = renderHook(() => useEntitlementAccess(), { wrapper });

    await waitFor(() => expect(result.current.isEntitled).toBe(true));
    expect(result.current.reason).toBe('comp');
  });

  it('locks out someone with neither', async () => {
    const { result } = renderHook(() => useEntitlementAccess(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isEntitled).toBe(false);
    expect(result.current.reason).toBe(null);
  });

  it('prefers revenuecat as the reason when both apply', async () => {
    // A comped person who later subscribes anyway: the paid relationship is
    // the one that matters for support and for revenue reporting.
    mockCheckPremium.mockResolvedValue(true);
    mockRpc.mockResolvedValue({ data: true, error: null });
    const { result } = renderHook(() => useEntitlementAccess(), { wrapper });

    await waitFor(() => expect(result.current.isEntitled).toBe(true));
    expect(result.current.reason).toBe('revenuecat');
  });

  it('does not report loading once one source has said yes', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    const { result } = renderHook(() => useEntitlementAccess(), { wrapper });

    await waitFor(() => expect(result.current.isEntitled).toBe(true));
    expect(result.current.isLoading).toBe(false);
  });

  it('resolves rather than hanging when signed out', async () => {
    // A disabled query reports isLoading forever in TanStack v5; if that leaked
    // through, the access gate would sit on the loading screen for good.
    mockAuthState.isAuthenticated = false;
    const { result } = renderHook(() => useEntitlementAccess(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isEntitled).toBe(false);
    expect(mockRpc).not.toHaveBeenCalled();
  });
});

describe('comp access — persistence safety', () => {
  it('lives under a query root that is never written to disk', () => {
    // A revoked comp restored from a day-old disk cache would keep unlocking
    // the app. Same reasoning as the entitlement key (H2, 2026-07-25).
    expect(NON_PERSISTED_KEY_ROOTS).toContain(queryKeys.entitlement.comp()[0]);
  });
});
