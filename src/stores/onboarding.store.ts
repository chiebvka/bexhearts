import { create } from 'zustand';

interface ProfileSetupData {
  fullName: string;
  denomination: string;
  avatarUrl: string | null;
}

interface OnboardingState {
  currentStep: number;
  profileData: Partial<ProfileSetupData>;
  inviteCode: string | null;
  setStep: (step: number) => void;
  setProfileData: (data: Partial<ProfileSetupData>) => void;
  setInviteCode: (code: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 0,
  profileData: {},
  inviteCode: null,

  setStep: (currentStep) => set({ currentStep }),

  setProfileData: (data) =>
    set((state) => ({
      profileData: { ...state.profileData, ...data },
    })),

  setInviteCode: (inviteCode) => set({ inviteCode }),

  reset: () =>
    set({
      currentStep: 0,
      profileData: {},
      inviteCode: null,
    }),
}));
