import AsyncStorage from '@react-native-async-storage/async-storage';
import { LargeSecureStore } from '@/services/supabase/secureStorage';

// In-memory SecureStore (holds the per-key AES key)
jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store[k] = v;
    }),
    getItemAsync: jest.fn(async (k: string) => (k in store ? store[k] : null)),
    deleteItemAsync: jest.fn(async (k: string) => {
      delete store[k];
    }),
  };
});

// Deterministic random bytes so the test is reproducible
jest.mock('expo-crypto', () => ({
  getRandomBytes: (n: number) =>
    Uint8Array.from({ length: n }, (_, i) => (i * 37 + 7) % 256),
}));

describe('LargeSecureStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('round-trips a value: ciphertext is stored, plaintext comes back', async () => {
    const store = new LargeSecureStore();
    // > 2048 bytes to mimic a real Supabase session payload
    const value = JSON.stringify({
      access_token: 'abc.def.ghi',
      refresh_token: 'r'.repeat(3000),
    });

    await store.setItem('sb-session', value);

    // What lands in AsyncStorage must be encrypted, not the plaintext
    const raw = await AsyncStorage.getItem('sb-session');
    expect(raw).not.toBeNull();
    expect(raw).not.toContain('access_token');

    // getItem decrypts back to the exact original
    expect(await store.getItem('sb-session')).toBe(value);
  });

  it('returns null for a missing key', async () => {
    const store = new LargeSecureStore();
    expect(await store.getItem('missing')).toBeNull();
  });

  it('removeItem clears both the ciphertext and the encryption key', async () => {
    const SecureStore = require('expo-secure-store');
    const store = new LargeSecureStore();

    await store.setItem('k', 'hello');
    await store.removeItem('k');

    expect(await AsyncStorage.getItem('k')).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('k');
    expect(await store.getItem('k')).toBeNull();
  });
});
