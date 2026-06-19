// CONVENTION (owner preference, 2026-06-18): form controls — Button and Input —
// use `none` (square corners) by default. Do NOT add radius to buttons or inputs
// unless explicitly requested. Cards/avatars/badges may keep their radius.
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
