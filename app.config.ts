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
      icon: './assets/icon.png',
      color: '#9849FA',
    },
  ],
  'expo-apple-authentication',
  'expo-web-browser',
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
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  scheme: 'bexhearts',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#FAFAF8',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.bexhearts.app',
    infoPlist: {
      NSCameraUsageDescription: 'Bexhearts needs camera access to update your profile photo.',
      NSPhotoLibraryUsageDescription: 'Bexhearts needs photo library access to update your profile photo.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FAFAF8',
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
