import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getLastUsedMethod,
  setLastUsedMethod,
} from '@/features/auth/lastUsedMethod';

describe('lastUsedMethod', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null when nothing has been stored', async () => {
    expect(await getLastUsedMethod()).toBeNull();
  });

  it('round-trips a method', async () => {
    await setLastUsedMethod('email');
    expect(await getLastUsedMethod()).toBe('email');

    await setLastUsedMethod('apple');
    expect(await getLastUsedMethod()).toBe('apple');
  });

  it('ignores an unrecognized stored value', async () => {
    await AsyncStorage.setItem('auth.lastUsedMethod', 'garbage');
    expect(await getLastUsedMethod()).toBeNull();
  });
});
