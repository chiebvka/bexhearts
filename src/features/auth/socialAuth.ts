import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

// Native social-auth wrappers. These return a provider ID token (or null on a
// user cancellation) for `supabase.auth.signInWithIdToken`. The Jest runtime
// mocks both native SDKs (see __tests__/setup/jest.setup.ts).
//
// Apple is a static import — `expo-apple-authentication` is in every build. The
// Google SDK is loaded lazily (see `loadGoogleSignin`) because its native spec
// calls `TurboModuleRegistry.getEnforcing` at import, which throws on a dev build
// produced before the dep was added; deferring to call-time keeps the app booting
// until the next native rebuild (Google can't run before that rebuild anyway).
//
// Graceful degradation (CLAUDE.md rule): Google only activates when its client
// IDs are configured; until then `isGoogleSignInConfigured()` is false and the
// UI hides the button. Apple is iOS-only and needs no env config.

function loadGoogleSignin() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
}

function isPlaceholder(value: string | undefined): boolean {
  return !value || value.startsWith('your-') || value.includes('xxxx');
}

/**
 * True once the Google Web client ID is set to a real value (not a placeholder).
 * Read at call time so the value reflects the loaded env, and so it's testable.
 */
export function isGoogleSignInConfigured(): boolean {
  return !isPlaceholder(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
}

let googleConfigured = false;

function configureGoogleSignIn(): void {
  if (googleConfigured) return;
  const { GoogleSignin } = loadGoogleSignin();
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  googleConfigured = true;
}

/**
 * Launches the native Google sign-in sheet and returns the ID token.
 * Returns null if the user cancels. Throws on any real failure.
 */
export async function getGoogleIdToken(): Promise<string | null> {
  configureGoogleSignIn();
  const { GoogleSignin } = loadGoogleSignin();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = (await GoogleSignin.signIn()) as unknown as {
    type?: string;
    data?: { idToken?: string | null };
    idToken?: string | null;
  };

  // v13+ returns a discriminated union: { type: 'cancelled' } on cancel.
  if (response?.type === 'cancelled') return null;

  const idToken = response?.data?.idToken ?? response?.idToken ?? null;
  if (!idToken) throw new Error('Google sign-in did not return an ID token.');
  return idToken;
}

export interface AppleCredential {
  /** Passed to Supabase's signInWithIdToken. */
  identityToken: string;
  /**
   * Short-lived (~5 minute) code that can be exchanged server-side for an Apple
   * REFRESH token. We need that refresh token months later, at account
   * deletion, to satisfy App Store Guideline 5.1.1(v) — so this has to be
   * handed to the `apple-revoke` edge function immediately after sign-in or
   * it's gone. It is useless to a client on its own and is never stored on the
   * device.
   */
  authorizationCode: string | null;
}

/**
 * Launches the native Apple sign-in sheet.
 * Returns null if the user cancels. iOS only. Throws on any real failure.
 */
export async function getAppleCredential(): Promise<AppleCredential | null> {
  if (Platform.OS !== 'ios') return null;

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) return null;
    return {
      identityToken: credential.identityToken,
      authorizationCode: credential.authorizationCode ?? null,
    };
  } catch (err) {
    // The user dismissing the Apple sheet is not an error worth surfacing.
    if ((err as { code?: string })?.code === 'ERR_REQUEST_CANCELED') {
      return null;
    }
    throw err;
  }
}

/**
 * Identity token only — kept so existing callers and tests keep working.
 * Prefer `getAppleCredential`, which also yields the authorization code the
 * revocation flow depends on.
 */
export async function getAppleIdentityToken(): Promise<string | null> {
  const credential = await getAppleCredential();
  return credential?.identityToken ?? null;
}
