import { StyleSheet } from 'react-native';
import { getActiveThemeMode, type ThemeMode } from './colors';

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

// Drop-in replacement for module-scope `StyleSheet.create` in files whose
// styles reference theme tokens. `StyleSheet.create` freezes color values at
// import time (always light, since the app boots before any theme resolves);
// this wrapper defers creation to first PROPERTY ACCESS — which happens
// during render — and caches one StyleSheet per mode. Style bodies stay
// unchanged because the live `colors` export resolves per-mode when the
// factory runs.
//
// The mode can only change via useThemeMode() in the root layout, which also
// re-mounts the UI subtree — so every mounted component re-renders and
// re-reads its styles through the proxy.
export function themedStyles<T extends NamedStyles<T>>(factory: () => T): T {
  const cache: Partial<Record<ThemeMode, T>> = {};

  const resolve = (): T => {
    const mode = getActiveThemeMode();
    let styles = cache[mode];
    if (!styles) {
      styles = StyleSheet.create(factory());
      cache[mode] = styles;
    }
    return styles;
  };

  return new Proxy({} as T, {
    get: (_target, prop) => resolve()[prop as keyof T],
    ownKeys: () => Reflect.ownKeys(resolve()),
    getOwnPropertyDescriptor: (_target, prop) =>
      Reflect.getOwnPropertyDescriptor(resolve(), prop),
  }) as T;
}
