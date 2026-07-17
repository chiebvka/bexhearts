import { AppState } from 'react-native';
import { createClient, processLock } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { LargeSecureStore } from './secureStorage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill local Supabase values.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Encrypted session storage (AES key in SecureStore, ciphertext in AsyncStorage)
    storage: new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // React Native has no real Web Locks API — the default browser lock can
    // DEADLOCK here (a stuck token refresh holds it and every later auth call —
    // getSession, signInWithPassword — hangs behind it forever). processLock is
    // the in-process lock supabase-js ships for non-browser environments.
    lock: processLock,
  },
});

// Supabase recommends running the token auto-refresh timer only while the app
// is in the foreground (React Native AppState). This keeps the persisted
// session fresh without burning cycles in the background.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
