jest.mock('@/services/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

import { authService } from '@/services/supabase/auth';
import { supabase } from '@/services/supabase/client';

const mockSignIn = supabase.auth
  .signInWithPassword as unknown as ReturnType<typeof jest.fn>;

describe('authService.reauthenticate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('re-verifies the current password via signInWithPassword', async () => {
    mockSignIn.mockResolvedValue({ data: { session: {} }, error: null });

    await authService.reauthenticate('a@b.com', 'Password1');

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'Password1',
    });
  });

  it('surfaces a wrong-password error from Supabase', async () => {
    mockSignIn.mockResolvedValue({
      data: { session: null },
      error: new Error('Invalid login credentials'),
    });

    const { error } = await authService.reauthenticate('a@b.com', 'wrong');
    expect(error).toBeTruthy();
  });
});
