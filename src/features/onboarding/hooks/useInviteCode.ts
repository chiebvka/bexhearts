import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useCoupleStore } from '@/stores/couple.store';
import { createCouple } from '@/services/supabase/database';
import { generateInviteCode } from '@/utils/invite-code';
import { track, ANALYTICS_EVENTS } from '@/services/analytics/events';
import { getErrorMessage } from '@/utils/error';

export function useInviteCode() {
  const user = useAuthStore((s) => s.user);
  const setInviteCode = useOnboardingStore((s) => s.setInviteCode);
  const inviteCode = useOnboardingStore((s) => s.inviteCode);
  const setCoupleContext = useCoupleStore((s) => s.setCoupleContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCode = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const code = generateInviteCode();
      const couple = await createCouple(user.id, code);
      setCoupleContext(couple.id, null);
      setInviteCode(code);
      track(ANALYTICS_EVENTS.INVITE_CODE_GENERATED);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { inviteCode, generateCode, isLoading, error };
}
