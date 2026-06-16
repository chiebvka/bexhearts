import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'bexhearts-storage',
});

// Typed helpers for common storage operations
export const appStorage = {
  getBoolean(key: string): boolean {
    return storage.getBoolean(key) ?? false;
  },

  getString(key: string): string | undefined {
    return storage.getString(key);
  },

  getNumber(key: string): number | undefined {
    return storage.getNumber(key);
  },

  set(key: string, value: boolean | string | number): void {
    storage.set(key, value);
  },

  delete(key: string): void {
    storage.delete(key);
  },

  clearAll(): void {
    storage.clearAll();
  },
};

// Storage keys
export const STORAGE_KEYS = {
  HAS_ONBOARDED: 'has_onboarded',
  COLOR_SCHEME: 'color_scheme',
  NOTIFICATION_PERMISSION_ASKED: 'notification_permission_asked',
  LAST_DEVOTIONAL_DATE: 'last_devotional_date',
} as const;
