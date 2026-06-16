import { useAuthStore } from '@/stores/auth.store';

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      session: null,
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });
  });

  it('starts in a loading state', () => {
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(true);
    expect(state.isAuthenticated).toBe(false);
    expect(state.session).toBeNull();
  });

  it('sets session and marks authenticated', () => {
    const mockSession = {
      access_token: 'token',
      refresh_token: 'refresh',
      user: { id: 'user-1', email: 'test@example.com' },
    } as any;

    useAuthStore.getState().setSession(mockSession);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.user?.id).toBe('user-1');
  });

  it('sets null session and marks unauthenticated', () => {
    // First set a session
    useAuthStore.getState().setSession({ user: { id: '1' } } as any);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Then clear it
    useAuthStore.getState().setSession(null);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('clears all state', () => {
    useAuthStore.getState().setSession({ user: { id: '1' } } as any);
    useAuthStore.getState().clear();

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });
});
