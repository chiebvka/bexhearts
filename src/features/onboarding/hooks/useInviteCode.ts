import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useCoupleStore } from '@/stores/couple.store';
import { createCouple, refreshInviteCode } from '@/services/supabase/database';
import { identifyUser } from '@/services/revenuecat/client';
import { track, ANALYTICS_EVENTS } from '@/services/analytics/events';
import { getErrorMessage } from '@/utils/error';

export function useInviteCode() {
  const user = useAuthStore((s) => s.user);
  const setInviteCode = useOnboardingStore((s) => s.setInviteCode);
  const inviteCode = useOnboardingStore((s) => s.inviteCode);
  const relationshipStage = useOnboardingStore((s) => s.relationshipStage);
  const isLongDistance = useOnboardingStore((s) => s.isLongDistance);
  const setCoupleContext = useCoupleStore((s) => s.setCoupleContext);
  const coupleId = useCoupleStore((s) => s.coupleId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCode = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      // Persist the relationship stage captured in C1 onto the new couple;
      // createCouple generates a unique invite code (with collision retry).
      const couple = await createCouple(user.id, {
        relationship_stage: relationshipStage,
        is_long_distance: isLongDistance,
      });
      setCoupleContext(couple.id, null);
      // F2 — the couple now exists, so bill against it rather than the user.
      void identifyUser(user.id, couple.id);
      setInviteCode(couple.invite_code);
      track(ANALYTICS_EVENTS.INVITE_CODE_GENERATED);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Issue a fresh code on the existing couple (expired onboarding code, or
  // re-inviting after a partner left). Falls back to creating the couple if one
  // doesn't exist yet.
  const regenerateCode = async () => {
    if (!coupleId) return generateCode();
    setIsLoading(true);
    setError(null);

    try {
      const code = await refreshInviteCode(coupleId);
      setInviteCode(code);
      track(ANALYTICS_EVENTS.INVITE_CODE_GENERATED);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { inviteCode, generateCode, regenerateCode, isLoading, error };
}
