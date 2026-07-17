import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// Persisted theme preference (Settings → Appearance). The full dark theme is
// Phase 8; the preference is captured now so it applies the moment it ships.
export type AppearancePreference = 'system' | 'light' | 'dark';

const APPEARANCE_KEY = 'bexhearts.appearance';

interface UIState {
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  appearance: AppearancePreference;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: () => void;
  setAppearance: (appearance: AppearancePreference) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toastMessage: null,
  toastType: 'info',
  appearance: 'system',

  // BUG FIX (2026-07-11): this only ever set store state that nothing
  // rendered — every toast in the app was silent. The actual toast UI is
  // react-native-toast-message's <Toast /> host in app/_layout.tsx, so bridge
  // to it here (state kept for tests/inspection).
  showToast: (message, type = 'info') => {
    set({ toastMessage: message, toastType: type });
    Toast.show({ type, text1: message });
  },

  dismissToast: () => set({ toastMessage: null }),

  setAppearance: (appearance) => {
    set({ appearance });
    void AsyncStorage.setItem(APPEARANCE_KEY, appearance);
  },
}));

// Rehydrate the stored preference on app start (best-effort).
void AsyncStorage.getItem(APPEARANCE_KEY).then((stored) => {
  if (stored === 'system' || stored === 'light' || stored === 'dark') {
    useUIStore.setState({ appearance: stored });
  }
});
