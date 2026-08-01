import { useColorScheme, type ColorSchemeName } from 'react-native';
import { useUIStore, type AppearancePreference } from '@/stores/ui.store';
import {
  getThemeColors,
  setActiveThemeMode,
  type ThemeColors,
  type ThemeMode,
} from './colors';

// The one rule (owner, 2026-07-18): the Settings → Appearance preference
// decides — explicit Light, explicit Dark, or System (follow the OS).
export function resolveThemeMode(
  preference: AppearancePreference,
  systemScheme: ColorSchemeName
): ThemeMode {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

// Resolves the active mode AND publishes it to the module-level slot the
// live `colors` export + themedStyles() read from. Must run in a component
// ABOVE the themed UI (the root layout's ThemedApp), whose `key={mode}`
// re-mounts the subtree on change so no stale styles survive.
export function useThemeMode(): ThemeMode {
  const preference = useUIStore((s) => s.appearance);
  const systemScheme = useColorScheme();
  const mode = resolveThemeMode(preference, systemScheme);
  // Idempotent assignment during render, deliberately BEFORE children render.
  setActiveThemeMode(mode);
  return mode;
}

// For components that want explicit tokens (new code should prefer this over
// the legacy live `colors` import).
export function useTheme(): { mode: ThemeMode; colors: ThemeColors } {
  const mode = useThemeMode();
  return { mode, colors: getThemeColors(mode) };
}
