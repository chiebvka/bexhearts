import { colors } from './colors';
import { fonts, textStyles, type TextVariant } from './typography';
import { spacing, type Spacing } from './spacing';
import { shadows } from './shadows';
import { borderRadius } from './borderRadius';

export { colors, fonts, textStyles, spacing, shadows, borderRadius };
export type { TextVariant, Spacing };

export const theme = {
  colors,
  fonts,
  textStyles,
  spacing,
  shadows,
  borderRadius,
} as const;
