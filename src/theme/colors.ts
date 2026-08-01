// Brand colors sourced from bexoni.com (locked 2026-06-18). Primary = purple
// #9747FF, identical in both modes (Phase 8 rule). Light values are the
// original launch palette; dark values follow the locked dark spec
// (bg #13161A, card #171B20, accent surface #1F2329, text #FAFAFA,
// muted #8B9098, border #2A2E35).
//
// HOW THEMING WORKS (Phase 8, 2026-07-18):
// - `lightColors` / `darkColors` are complete, same-shaped token sets. The
//   50→900 scales INVERT lightness in dark mode (50 = deepest surface,
//   900 = lightest tint) with 500 anchored to the brand hue — so existing
//   pairings like "primary[100] chip + primary[700] text" stay readable in
//   both modes without touching call sites.
// - The exported `colors` object is LIVE: each top-level key is a getter that
//   resolves against the active mode at ACCESS time. Inline JSX usage
//   (`color={colors.text.secondary}`) is therefore theme-correct on every
//   render. Module-scope StyleSheet blocks freeze values at import time —
//   those go through `themedStyles()` (see ./themedStyles.ts) instead.
// - The active mode is set by useThemeMode() (see ./useTheme.ts) before the
//   UI subtree renders, and the subtree re-mounts on change (root layout).

export type ThemeMode = 'light' | 'dark';

const lightColors = {
  primary: {
    50: '#F6F3FE',
    100: '#EEE7FF',
    200: '#DCCCFF',
    300: '#CAADFF',
    400: '#B07EFF',
    500: '#9747FF', // bexoni brand purple
    600: '#7F34D7',
    700: '#6224A9',
    800: '#451978',
    900: '#29104A',
  },

  secondary: {
    50: '#FDF8F0',
    100: '#FAECD4',
    200: '#F5D9A9',
    300: '#F0C67E',
    400: '#EBB353',
    500: '#D4963A',
    600: '#AA782E',
    700: '#7F5A23',
    800: '#553C17',
    900: '#2A1E0C',
  },

  accent: {
    50: '#F2F7F4',
    100: '#DDE9E1',
    200: '#BBD3C3',
    300: '#99BDA5',
    400: '#77A787',
    500: '#5A8A6A',
    600: '#486E55',
    700: '#365340',
    800: '#24372A',
    900: '#121C15',
  },

  neutral: {
    50: '#FAFAF8',
    100: '#F5F5F1',
    200: '#E8E8E2',
    300: '#D4D4CC',
    400: '#A8A89E',
    500: '#7C7C72',
    600: '#5C5C54',
    700: '#3E3E38',
    800: '#2A2A26',
    900: '#1A1A17',
  },

  success: '#4A8A5A',
  warning: '#D49A3A',
  error: '#C05252',
  info: '#5A7A9A',

  background: '#F8F4EC',
  surface: '#FEFCF7',
  surfaceElevated: '#FFFFFF',
  overlay: 'rgba(26, 26, 23, 0.5)',

  text: {
    primary: '#1A1A17',
    secondary: '#5C5C54',
    tertiary: '#A8A89E',
    inverse: '#FAFAF8',
    link: '#9747FF',
  },
};

export type ThemeColors = typeof lightColors;

const darkColors: ThemeColors = {
  // Inverted scale: 50–300 are purple-tinted dark SURFACES, 600–900 are
  // light lavender TEXT tints. 400/500 stay the brand anchors.
  primary: {
    50: '#211A31',
    100: '#2C2145',
    200: '#3C2C60',
    300: '#553F85',
    400: '#B07EFF',
    500: '#9747FF',
    600: '#B583FF',
    700: '#CCA8FF',
    800: '#E2CDFF',
    900: '#F1E6FF',
  },

  secondary: {
    50: '#241D10',
    100: '#332812',
    200: '#4A3A1B',
    300: '#6B5426',
    400: '#EBB353',
    500: '#D4963A',
    600: '#E3B266',
    700: '#EECD94',
    800: '#F6E3C2',
    900: '#FCF3E2',
  },

  accent: {
    50: '#151D18',
    100: '#1D2A21',
    200: '#2B4033',
    300: '#3E5C49',
    400: '#77A787',
    500: '#5A8A6A',
    600: '#8FBF9F',
    700: '#B0D5BC',
    800: '#D0E7D8',
    900: '#EAF4EE',
  },

  neutral: {
    50: '#15181C',
    100: '#1C2026',
    200: '#262B31', // subtle borders (≈ the locked #2A2E35 border zone)
    300: '#343A42',
    400: '#6C737D',
    500: '#8B9098', // the locked dark muted text
    600: '#A7ACB5',
    700: '#C6CAD1',
    800: '#E2E4E8',
    900: '#F4F5F6',
  },

  // Slightly brighter than their light-mode selves so they read on dark.
  success: '#6FAF7F',
  warning: '#E2B25C',
  error: '#DB7A7A',
  info: '#82A6C8',

  background: '#13161A',
  surface: '#171B20',
  surfaceElevated: '#1F2329',
  overlay: 'rgba(0, 0, 0, 0.6)',

  text: {
    primary: '#FAFAFA',
    secondary: '#B9BEC7',
    tertiary: '#8B9098',
    // Every `inverse` call site is text on a BRAND-COLORED surface (purple
    // buttons, selected chips, avatar initials) — those surfaces keep their
    // hue in dark mode, so inverse stays near-white in both themes.
    inverse: '#FAFAF8',
    link: '#B07EFF', // 400 — the 500 purple sits below AA on near-black
  },
};

// ————— active-mode plumbing (module-level so non-React code can read it) —————

let activeMode: ThemeMode = 'light';

export function setActiveThemeMode(mode: ThemeMode): void {
  activeMode = mode;
}

export function getActiveThemeMode(): ThemeMode {
  return activeMode;
}

export function getThemeColors(mode: ThemeMode = activeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

// The LIVE legacy export: every existing `colors.x` read resolves against the
// active mode at access time. Only top-level getters are needed — nested
// objects (primary, text, …) are returned whole from the active set.
const liveColors = {} as ThemeColors;
for (const key of Object.keys(lightColors) as (keyof ThemeColors)[]) {
  Object.defineProperty(liveColors, key, {
    get: () => getThemeColors()[key],
    enumerable: true,
  });
}

export const colors: ThemeColors = liveColors;

export { lightColors, darkColors };
