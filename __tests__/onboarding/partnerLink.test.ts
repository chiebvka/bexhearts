import { renderHook, act } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
}));

jest.mock('@/services/supabase/database', () => ({
  linkPartner: jest.fn(),
  getPartnerProfile: jest.fn(),
}));

jest.mock('@/api/notifications', () => ({
  notifyPartner: jest.fn(),
  getMyFirstName: jest.fn(() => 'Test'),
}));

jest.mock('@/services/analytics/events', () => ({
  track: jest.fn(),
  trackPartnerLinked: jest.fn(),
  ANALYTICS_EVENTS: { PARTNER_LINKED: 'partner_linked' },
}));

import { router } from 'expo-router';
import { linkPartner, getPartnerProfile } from '@/services/supabase/database';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { usePartnerLink } from '@/features/onboarding/hooks/usePartnerLink';

type MockFn = ReturnType<typeof jest.fn>;
const mockRouter = router as unknown as { replace: MockFn; push: MockFn };
const mockLinkPartner = linkPartner as unknown as MockFn;
const mockGetPartnerProfile = getPartnerProfile as unknown as MockFn;

describe('usePartnerLink → team moment (E8·M2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: { id: 'user-b' } as never });
  });

  it('lands the joiner on the "you\'re a team" screen with the partner name', async () => {
    mockLinkPartner.mockResolvedValue('couple-1');
    mockGetPartnerProfile.mockResolvedValue({ id: 'user-a', full_name: 'AJ Rivers' });

    const { result } = renderHook(() => usePartnerLink());
    await act(async () => {
      await result.current.link('ABC123');
    });

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/(onboarding)/team',
      params: { name: 'AJ Rivers' },
    });
    // Couple context is set before navigating (isLinked drives gating).
    expect(useCoupleStore.getState().coupleId).toBe('couple-1');
    expect(useCoupleStore.getState().partnerId).toBe('user-a');
  });

  it('still routes to the team screen when the partner profile fails to resolve', async () => {
    mockLinkPartner.mockResolvedValue('couple-1');
    mockGetPartnerProfile.mockResolvedValue(null);

    const { result } = renderHook(() => usePartnerLink());
    await act(async () => {
      await result.current.link('ABC123');
    });

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/(onboarding)/team',
      params: { name: '' },
    });
  });

  it('surfaces an error and does not navigate when linking fails', async () => {
    mockLinkPartner.mockRejectedValue(new Error('Invalid or expired invite code'));

    const { result } = renderHook(() => usePartnerLink());
    await act(async () => {
      await result.current.link('BADCODE');
    });

    expect(result.current.error).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
