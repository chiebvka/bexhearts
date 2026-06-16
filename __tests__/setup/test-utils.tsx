import React from 'react';
import { render, type RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialAuthState?: Partial<ReturnType<typeof useAuthStore.getState>>;
  initialCoupleState?: Partial<ReturnType<typeof useCoupleStore.getState>>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Pre-populate stores
  if (options?.initialAuthState) {
    useAuthStore.setState(options.initialAuthState);
  }
  if (options?.initialCoupleState) {
    useCoupleStore.setState(options.initialCoupleState);
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}
