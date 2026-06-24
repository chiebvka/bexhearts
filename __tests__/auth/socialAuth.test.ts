import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  isGoogleSignInConfigured,
  getGoogleIdToken,
  getAppleIdentityToken,
} from '@/features/auth/socialAuth';

type MockFn = ReturnType<typeof jest.fn>;
const mockGoogleSignIn = GoogleSignin.signIn as unknown as MockFn;
const mockAppleSignIn = AppleAuthentication.signInAsync as unknown as MockFn;

const WEB_CLIENT_KEY = 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID';

describe('isGoogleSignInConfigured', () => {
  const original = process.env[WEB_CLIENT_KEY];
  afterEach(() => {
    if (original === undefined) delete process.env[WEB_CLIENT_KEY];
    else process.env[WEB_CLIENT_KEY] = original;
  });

  it('is false when unset', () => {
    delete process.env[WEB_CLIENT_KEY];
    expect(isGoogleSignInConfigured()).toBe(false);
  });

  it('is false for a "your-" placeholder', () => {
    process.env[WEB_CLIENT_KEY] = 'your-web-client-id.apps.googleusercontent.com';
    expect(isGoogleSignInConfigured()).toBe(false);
  });

  it('is false for an "xxxx" placeholder', () => {
    process.env[WEB_CLIENT_KEY] = 'xxxx.apps.googleusercontent.com';
    expect(isGoogleSignInConfigured()).toBe(false);
  });

  it('is true for a real-looking client ID', () => {
    process.env[WEB_CLIENT_KEY] = '1234567890-abcdef.apps.googleusercontent.com';
    expect(isGoogleSignInConfigured()).toBe(true);
  });
});

describe('getGoogleIdToken', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the ID token from a successful sign-in (v13+ shape)', async () => {
    mockGoogleSignIn.mockResolvedValue({
      type: 'success',
      data: { idToken: 'google-token' },
    });
    await expect(getGoogleIdToken()).resolves.toBe('google-token');
  });

  it('returns null when the user cancels', async () => {
    mockGoogleSignIn.mockResolvedValue({ type: 'cancelled', data: null });
    await expect(getGoogleIdToken()).resolves.toBeNull();
  });

  it('throws when no ID token is returned', async () => {
    mockGoogleSignIn.mockResolvedValue({ type: 'success', data: {} });
    await expect(getGoogleIdToken()).rejects.toThrow(/ID token/i);
  });
});

describe('getAppleIdentityToken', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the identity token from a successful sign-in', async () => {
    mockAppleSignIn.mockResolvedValue({ identityToken: 'apple-token' });
    await expect(getAppleIdentityToken()).resolves.toBe('apple-token');
  });

  it('returns null when the user cancels the sheet', async () => {
    mockAppleSignIn.mockRejectedValue({ code: 'ERR_REQUEST_CANCELED' });
    await expect(getAppleIdentityToken()).resolves.toBeNull();
  });

  it('rethrows a real failure', async () => {
    mockAppleSignIn.mockRejectedValue(new Error('apple is down'));
    await expect(getAppleIdentityToken()).rejects.toThrow('apple is down');
  });
});
