import { Platform } from 'react-native';

const sansFamily = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif',
  default: undefined,
});

const serifFamily = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

export const fonts = {
  sans: {
    regular: sansFamily,
    medium: sansFamily,
    semiBold: sansFamily,
    bold: sansFamily,
  },
  serif: {
    regular: serifFamily,
    medium: serifFamily,
    semiBold: serifFamily,
    bold: serifFamily,
    italic: serifFamily,
  },
} as const;

export const textStyles = {
  displayLarge: { fontFamily: fonts.serif.bold, fontSize: 32, lineHeight: 40, fontWeight: '700' },
  displayMedium: { fontFamily: fonts.serif.bold, fontSize: 28, lineHeight: 36, fontWeight: '700' },

  headlineLarge: { fontFamily: fonts.sans.bold, fontSize: 24, lineHeight: 32, fontWeight: '700' },
  headlineMedium: { fontFamily: fonts.sans.semiBold, fontSize: 20, lineHeight: 28, fontWeight: '600' },
  headlineSmall: { fontFamily: fonts.sans.semiBold, fontSize: 18, lineHeight: 24, fontWeight: '600' },

  bodyLarge: { fontFamily: fonts.sans.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fonts.sans.regular, fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: fonts.sans.regular, fontSize: 12, lineHeight: 16 },

  scripture: { fontFamily: fonts.serif.italic, fontSize: 18, lineHeight: 28, fontStyle: 'italic' },

  labelLarge: { fontFamily: fonts.sans.medium, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  labelMedium: { fontFamily: fonts.sans.medium, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  labelSmall: { fontFamily: fonts.sans.medium, fontSize: 10, lineHeight: 14, fontWeight: '500' },

  button: { fontFamily: fonts.sans.semiBold, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  buttonSmall: { fontFamily: fonts.sans.semiBold, fontSize: 14, lineHeight: 20, fontWeight: '600' },
} as const;

export type TextVariant = keyof typeof textStyles;
