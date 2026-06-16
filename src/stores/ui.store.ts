import { create } from 'zustand';

interface UIState {
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toastMessage: null,
  toastType: 'info',

  showToast: (message, type = 'info') =>
    set({ toastMessage: message, toastType: type }),

  dismissToast: () => set({ toastMessage: null }),
}));
