import { ExpoConfig, ConfigContext } from 'expo/config';

// Google sign-in (B3) only adds its iOS URL scheme to the native build once the
// reversed client ID is supplied via env. Until then the plugin is omitted, so
// prebuild stays clean and Google degrades gracefully (the button is hidden).
const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

const plugins: NonNullable<ExpoConfig['plugins']> = [
  'expo-router',
  'expo-font',
  'expo-secure-store',
  [
    'expo-notifications',
    {
      // Android status-bar icon must be white-on-transparent (the OS tints it).
      icon: './assets/notification-icon.png',
      color: '#9747FF',
    },
  ],
  'expo-apple-authentication',
  'expo-web-browser',
  [
    // Google Sign-In's iOS SDK pulls in the Swift pod AppCheckCore, whose deps
    // GoogleUtilities + RecaptchaInterop don't define modules, so `pod install`
    // fails when integrating them as plain static libraries. Static frameworks
    // DO define modules — this is the documented react-native-google-signin +
    // Expo fix (Podfile consumes ios.useFrameworks).
    'expo-build-properties',
    {
      ios: {
        useFrameworks: 'static',
      },
    },
  ],
];

if (googleIosUrlScheme) {
  plugins.push([
    '@react-native-google-signin/google-signin',
    { iosUrlScheme: googleIosUrlScheme },
  ]);
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Bexhearts',
  slug: 'bexhearts',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic', // Phase 8: OS reports its scheme; the in-app System/Light/Dark pref decides
  newArchEnabled: true,
  scheme: 'bexhearts',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#9747FF',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.bexhearts.app',
    // Single app icon (owner decision 2026-07-25): cream mark on brand purple,
    // full-bleed — the OS applies its own squircle mask, so no baked corners.
    // Light/dark theming lives on the website, not the app icon.
    icon: './assets/icon.png',
    infoPlist: {
      // Store-compliance pass (2026-07-27). Two corrections:
      //
      // 1. NSCameraUsageDescription was REMOVED. `src/lib/imagePicker.ts` only
      //    ever calls launchImageLibraryAsync — the camera is never opened.
      //    Declaring a permission the app doesn't use is a documented App
      //    Review rejection reason, and it makes the install prompt look like
      //    the app wants more than it does.
      //
      // 2. The photo-library string said "profile photo", but photos are also
      //    attached to Journal moments. The purpose string has to describe
      //    every use, or Review flags the mismatch.
      NSPhotoLibraryUsageDescription:
        'Bexhearts needs access to your photos so you can set a profile picture and add photos to the moments in your shared journal.',
      // Export compliance: the app uses only standard HTTPS/TLS, which is
      // exempt. Declaring it here means App Store Connect stops asking the
      // encryption question on every single build upload.
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      // Foreground = mark padded into the safe zone; the OS mask + purple
      // background handle the shape. Monochrome drives Android 13 themed icons.
      foregroundImage: './assets/adaptive-icon.png',
      monochromeImage: './assets/adaptive-monochrome.png',
      backgroundColor: '#9747FF',
    },
    package: 'com.bexhearts.app',
    edgeToEdgeEnabled: true,
  },
  plugins,
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'your-eas-project-id',
    },
  },
});
