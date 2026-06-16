import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

export type NotificationType =
  | 'devotional_reminder'
  | 'partner_linked'
  | 'prayer_update'
  | 'check_in_reminder'
  | 'date_reminder';

interface NotificationData {
  type: NotificationType;
  id?: string;
}

export function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data as unknown as NotificationData;

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
      router.push('/(tabs)/dates');
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
