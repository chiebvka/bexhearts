import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUIStore } from '@/stores/ui.store';

describe('ui.store appearance preference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUIStore.setState({ appearance: 'system' });
  });

  it('defaults to system', () => {
    expect(useUIStore.getState().appearance).toBe('system');
  });

  it('persists the chosen appearance', () => {
    useUIStore.getState().setAppearance('dark');

    expect(useUIStore.getState().appearance).toBe('dark');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('bexhearts.appearance', 'dark');
  });

  it('toasts still work alongside appearance state', () => {
    useUIStore.getState().showToast('hello', 'success');
    expect(useUIStore.getState().toastMessage).toBe('hello');
    useUIStore.getState().dismissToast();
    expect(useUIStore.getState().toastMessage).toBeNull();
  });
});
