import Constants, { ExecutionEnvironment } from 'expo-constants';

// True when running inside the Expo Go store client. Native paid SDKs
// (react-native-purchases, Superwall) don't exist there, so with REAL API keys
// in .env (F2, 2026-07-12) the SDK wrappers must still no-op in Expo Go and
// only go live in the dev build — same guard pattern as SocialAuthButtons.
export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
