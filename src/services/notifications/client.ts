import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/services/supabase/client';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    return false; // Push notifications don't work on simulators
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// G1 push-token hygiene: without this, a shared or handed-down device keeps
// receiving the PREVIOUS user's pushes after sign-out/deletion. Best-effort —
// never blocks the sign-out itself.
export async function clearPushToken(userId: string): Promise<void> {
  try {
    await supabase
      .from('profiles')
      .update({ push_token: null })
      .eq('id', userId);
  } catch {
    // Offline sign-out etc. — the dead token gets pruned server-side on the
    // next send anyway (DeviceNotRegistered handling in send-notification).
  }
}

export async function registerPushToken(userId: string): Promise<string | null> {
  if (!Device.isDevice) return null;

  const granted = await requestNotificationPermission();
  if (!granted) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
  });

  // Store the push token on the user's profile
  await supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', userId);

  return token;
}
