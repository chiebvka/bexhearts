// Brand colors sourced from bexoni.com (locked 2026-06-18). Primary = purple #9849FA.
// This file is LIGHT-ONLY for now; the dark-mode token split (black #13161A bg, etc.)
// is specified in detail in docs/PROGRESS.md Phase 8.
export const colors = {
  primary: {
    50: '#F6F3FE',
    100: '#EEE7FF',
    200: '#DCCCFF',
    300: '#CAADFF',
    400: '#B07EFF',
    500: '#9849FA', // bexoni brand purple
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
    link: '#9849FA',
  },
} as const;
