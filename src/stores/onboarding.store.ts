import { create } from 'zustand';
import type {
  RelationshipStage,
  GrowthFocus,
} from '@/features/onboarding/schemas';

interface ProfileSetupData {
  fullName: string;
  denomination: string;
  avatarUrl: string | null;
}

interface OnboardingState {
  currentStep: number;
  profileData: Partial<ProfileSetupData>;
  inviteCode: string | null;
  // Captured on the relationship-stage screen (C1); persisted onto the couple
  // when it is created at the partner-invite step.
  relationshipStage: RelationshipStage | null;
  // Captured on the personalization screen (C1b); written to the profile and
  // kept here so the plan-summary screen can render without a refetch.
  growthFocus: GrowthFocus[];
  // E11 — captured with the relationship stage; written onto the couple at
  // creation (Profile toggle changes it later).
  isLongDistance: boolean;
  setStep: (step: number) => void;
  setProfileData: (data: Partial<ProfileSetupData>) => void;
  setInviteCode: (code: string) => void;
  setRelationshipStage: (stage: RelationshipStage) => void;
  setGrowthFocus: (focus: GrowthFocus[]) => void;
  setIsLongDistance: (isLongDistance: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 0,
  profileData: {},
  inviteCode: null,
  relationshipStage: null,
  growthFocus: [],
  isLongDistance: false,

  setStep: (currentStep) => set({ currentStep }),

  setProfileData: (data) =>
    set((state) => ({
      profileData: { ...state.profileData, ...data },
    })),

  setInviteCode: (inviteCode) => set({ inviteCode }),

  setRelationshipStage: (relationshipStage) => set({ relationshipStage }),

  setGrowthFocus: (growthFocus) => set({ growthFocus }),

  setIsLongDistance: (isLongDistance) => set({ isLongDistance }),

  reset: () =>
    set({
      currentStep: 0,
      profileData: {},
      inviteCode: null,
      relationshipStage: null,
      growthFocus: [],
      isLongDistance: false,
    }),
}));
