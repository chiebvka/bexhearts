import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

export type NotificationType =
  | 'devotional_reminder'
  | 'partner_linked'
  | 'prayer_update'
  | 'check_in_reminder'
  | 'date_reminder';

interface NotificationData {
  type?: NotificationType;
  id?: string;
  // G1: send-notification puts the in-app path here — the modern way.
  route?: string;
}

export function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data as unknown as NotificationData;

  // G1 pushes carry an explicit route; the legacy type switch stays as a
  // fallback for anything older.
  if (typeof data.route === 'string' && data.route.startsWith('/')) {
    router.push(data.route as never);
    return;
  }

  switch (data.type) {
    case 'devotional_reminder':
      router.push('/(tabs)/devotional');
      break;
    case 'partner_linked':
      router.replace('/(tabs)');
      break;
    case 'prayer_update':
      router.push('/(tabs)/connect/prayers');
      break;
    case 'check_in_reminder':
      router.push('/modal/check-in-form');
      break;
    case 'date_reminder':
      router.push('/dates');
      break;
  }
}

export function setupNotificationListeners() {
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    handleNotificationResponse
  );

  return () => {
    responseSubscription.remove();
  };
}
