import { MMKV } from 'react-native-mmkv';

// ⚠️ MMKV is a NATIVE module that does not exist in Expo Go — `new MMKV()`
// throws there, and because this runs at import time it used to take down
// every module that merely imported STORAGE_KEYS (found the hard way in
// H2, 2026-07-25). Guarded with an in-memory fallback so importing this
// file is always safe; real persistence needs the dev build. Anything that
// must persist in Expo Go should use AsyncStorage instead (the upload
// outbox and query cache do).
let mmkv: MMKV | null = null;
try {
  mmkv = new MMKV({ id: 'bexhearts-storage' });
} catch {
  mmkv = null;
}

const memory = new Map<string, boolean | string | number>();

// Typed helpers for common storage operations
export const appStorage = {
  getBoolean(key: string): boolean {
    if (mmkv) return mmkv.getBoolean(key) ?? false;
    const value = memory.get(key);
    return typeof value === 'boolean' ? value : false;
  },

  getString(key: string): string | undefined {
    if (mmkv) return mmkv.getString(key);
    const value = memory.get(key);
    return typeof value === 'string' ? value : undefined;
  },

  getNumber(key: string): number | undefined {
    if (mmkv) return mmkv.getNumber(key);
    const value = memory.get(key);
    return typeof value === 'number' ? value : undefined;
  },

  set(key: string, value: boolean | string | number): void {
    if (mmkv) mmkv.set(key, value);
    else memory.set(key, value);
  },

  delete(key: string): void {
    if (mmkv) mmkv.delete(key);
    else memory.delete(key);
  },

  clearAll(): void {
    if (mmkv) mmkv.clearAll();
    else memory.clear();
  },
};

// Storage keys
export const STORAGE_KEYS = {
  HAS_ONBOARDED: 'has_onboarded',
  COLOR_SCHEME: 'color_scheme',
  NOTIFICATION_PERMISSION_ASKED: 'notification_permission_asked',
  LAST_DEVOTIONAL_DATE: 'last_devotional_date',
  UPLOAD_OUTBOX: 'upload_outbox',
  QUERY_CACHE: 'query_cache',
} as const;
