import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthMethod = 'email' | 'apple' | 'google';

const KEY = 'auth.lastUsedMethod';

// "Last used" is a non-sensitive UI hint, so AsyncStorage is the right tool
// (NOT MMKV — which doesn't run in Expo Go, and NOT SecureStore — which is for
// secrets). Surfaces a "Last used" tag on the returning sign-in screen; most
// useful once Apple/Google buttons land in B3.
export async function setLastUsedMethod(method: AuthMethod): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, method);
  } catch {
    // best-effort; a missing hint is non-critical
  }
}

export async function getLastUsedMethod(): Promise<AuthMethod | null> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return value === 'email' || value === 'apple' || value === 'google'
      ? value
      : null;
  } catch {
    return null;
  }
}
