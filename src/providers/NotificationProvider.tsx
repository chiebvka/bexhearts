import { useEffect, type PropsWithChildren } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { registerPushToken } from '@/services/notifications/client';
import { setupNotificationListeners } from '@/services/notifications/handlers';

export function NotificationProvider({ children }: PropsWithChildren) {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    // Register push token
    registerPushToken(user.id);

    // Set up notification response handlers
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, [user]);

  return <>{children}</>;
}
