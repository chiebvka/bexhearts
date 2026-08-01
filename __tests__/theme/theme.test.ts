import {
  lightColors,
  darkColors,
  colors,
  getActiveThemeMode,
  setActiveThemeMode,
  getThemeColors,
} from '@/theme/colors';
import { resolveThemeMode } from '@/theme/useTheme';
import { themedStyles } from '@/theme/themedStyles';

afterEach(() => setActiveThemeMode('light'));

describe('resolveThemeMode (Settings → Appearance decides)', () => {
  it('explicit light wins regardless of the OS scheme', () => {
    expect(resolveThemeMode('light', 'dark')).toBe('light');
    expect(resolveThemeMode('light', 'light')).toBe('light');
  });

  it('explicit dark wins regardless of the OS scheme', () => {
    expect(resolveThemeMode('dark', 'light')).toBe('dark');
    expect(resolveThemeMode('dark', 'dark')).toBe('dark');
  });

  it('system follows the OS, defaulting to light when unknown', () => {
    expect(resolveThemeMode('system', 'dark')).toBe('dark');
    expect(resolveThemeMode('system', 'light')).toBe('light');
    expect(resolveThemeMode('system', null)).toBe('light');
    expect(resolveThemeMode('system', undefined)).toBe('light');
  });
});

describe('token sets', () => {
  function shapeOf(obj: object): unknown {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        typeof v === 'object' && v !== null ? shapeOf(v) : typeof v,
      ])
    );
  }

  it('light and dark expose the exact same token shape', () => {
    expect(shapeOf(darkColors)).toEqual(shapeOf(lightColors));
  });

  it('anchors the brand purple #9747FF at primary[500] in BOTH modes', () => {
    expect(lightColors.primary[500]).toBe('#9747FF');
    expect(darkColors.primary[500]).toBe('#9747FF');
  });

  it('uses the locked dark surfaces (bg #13161A, card #171B20, elevated #1F2329)', () => {
    expect(darkColors.background).toBe('#13161A');
    expect(darkColors.surface).toBe('#171B20');
    expect(darkColors.surfaceElevated).toBe('#1F2329');
    expect(darkColors.text.primary).toBe('#FAFAFA');
  });

  it('keeps text.inverse near-white in both modes (it sits on brand surfaces)', () => {
    expect(lightColors.text.inverse).toBe(darkColors.text.inverse);
  });
});

describe('live colors export + themedStyles', () => {
  it('colors resolves against the active mode at access time', () => {
    expect(getActiveThemeMode()).toBe('light');
    expect(colors.background).toBe(lightColors.background);
    setActiveThemeMode('dark');
    expect(colors.background).toBe(darkColors.background);
    expect(colors.text.primary).toBe(darkColors.text.primary);
  });

  it('themedStyles returns per-mode styles from the SAME object reference', () => {
    const styles = themedStyles(() => ({
      box: { backgroundColor: colors.surface },
    }));
    expect(styles.box.backgroundColor).toBe(lightColors.surface);
    setActiveThemeMode('dark');
    expect(styles.box.backgroundColor).toBe(darkColors.surface);
    setActiveThemeMode('light');
    expect(styles.box.backgroundColor).toBe(lightColors.surface);
  });

  it('getThemeColors defaults to the active mode', () => {
    setActiveThemeMode('dark');
    expect(getThemeColors()).toBe(darkColors);
    expect(getThemeColors('light')).toBe(lightColors);
  });
});
