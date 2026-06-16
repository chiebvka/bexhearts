import { create } from 'zustand';

interface CoupleState {
  coupleId: string | null;
  partnerId: string | null;
  isLinked: boolean;
  streakCount: number;
  setCoupleContext: (coupleId: string, partnerId: string | null) => void;
  setStreak: (count: number) => void;
  clear: () => void;
}

export const useCoupleStore = create<CoupleState>((set) => ({
  coupleId: null,
  partnerId: null,
  isLinked: false,
  streakCount: 0,

  setCoupleContext: (coupleId, partnerId) =>
    set({
      coupleId,
      partnerId,
      isLinked: !!partnerId,
    }),

  setStreak: (streakCount) => set({ streakCount }),

  clear: () =>
    set({
      coupleId: null,
      partnerId: null,
      isLinked: false,
      streakCount: 0,
    }),
}));
