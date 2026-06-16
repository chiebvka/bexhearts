import { Platform } from 'react-native';

let isConfigured = false;

export async function initSuperwall() {
  const apiKey = Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY!
    : process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_KEY!;

  if (!apiKey || apiKey.startsWith('your-')) {
    if (__DEV__) {
      console.warn('Superwall key is not configured; skipping Superwall initialization.');
    }
    return;
  }

  const { default: Superwall } = await import('@superwall/react-native-superwall');
  await Superwall.configure(apiKey);
  isConfigured = true;
}

export async function triggerPaywall(
  event: string,
  params?: Record<string, string>
): Promise<void> {
  if (!isConfigured) return;

  const { default: Superwall } = await import('@superwall/react-native-superwall');
  await Superwall.shared.register(
    event,
    params ? new Map(Object.entries(params)) : undefined
  );
}

export async function identifySuperwallUser(userId: string) {
  if (!isConfigured) return;

  const { default: Superwall } = await import('@superwall/react-native-superwall');
  await Superwall.shared.identify(userId);
}

export async function resetSuperwallUser() {
  if (!isConfigured) return;

  const { default: Superwall } = await import('@superwall/react-native-superwall');
  Superwall.shared.reset();
}
