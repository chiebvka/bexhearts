import { useCoupleStore } from '@/stores/couple.store';

describe('couple.store', () => {
  beforeEach(() => {
    useCoupleStore.setState({
      coupleId: null,
      partnerId: null,
      isLinked: false,
      streakCount: 0,
    });
  });

  it('starts with no couple', () => {
    const state = useCoupleStore.getState();
    expect(state.coupleId).toBeNull();
    expect(state.isLinked).toBe(false);
  });

  it('sets couple context with partner', () => {
    useCoupleStore.getState().setCoupleContext('couple-1', 'partner-1');

    const state = useCoupleStore.getState();
    expect(state.coupleId).toBe('couple-1');
    expect(state.partnerId).toBe('partner-1');
    expect(state.isLinked).toBe(true);
  });

  it('sets couple context without partner', () => {
    useCoupleStore.getState().setCoupleContext('couple-1', null);

    const state = useCoupleStore.getState();
    expect(state.coupleId).toBe('couple-1');
    expect(state.partnerId).toBeNull();
    expect(state.isLinked).toBe(false);
  });

  it('sets streak count', () => {
    useCoupleStore.getState().setStreak(7);
    expect(useCoupleStore.getState().streakCount).toBe(7);
  });

  it('clears all state', () => {
    useCoupleStore.getState().setCoupleContext('couple-1', 'partner-1');
    useCoupleStore.getState().setStreak(5);
    useCoupleStore.getState().clear();

    const state = useCoupleStore.getState();
    expect(state.coupleId).toBeNull();
    expect(state.partnerId).toBeNull();
    expect(state.isLinked).toBe(false);
    expect(state.streakCount).toBe(0);
  });
});
