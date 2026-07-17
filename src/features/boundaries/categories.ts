// D4 — boundary/temptation category taxonomy (app-side; DB column is freeform
// TEXT so this can grow with the template library without a migration).
import type { BoundaryType } from '@/types/common';

export interface CategoryOption {
  value: string;
  label: string;
}

// Proactive, shared commitments — the aspirational, shareable "covenant" set.
export const BOUNDARY_CATEGORIES: CategoryOption[] = [
  { value: 'purity', label: 'Physical & purity' },
  { value: 'digital', label: 'Digital & social' },
  { value: 'friendships', label: 'Friendships' },
  { value: 'time', label: 'Time & attention' },
  { value: 'finances', label: 'Finances' },
  { value: 'family', label: 'Family & in-laws' },
  { value: 'communication', label: 'Communication & conflict' },
];

// Personal struggles + a plan — the confessional, grace-framed set.
export const TEMPTATION_CATEGORIES: CategoryOption[] = [
  { value: 'lust', label: 'Lust & purity' },
  { value: 'emotional-affair', label: 'Emotional affair' },
  { value: 'substances', label: 'Substances' },
  { value: 'anger', label: 'Anger & harsh words' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'secrecy', label: 'Secrecy & honesty' },
];

export function getCategoriesForType(type: BoundaryType | string): CategoryOption[] {
  return type === 'boundary' ? BOUNDARY_CATEGORIES : TEMPTATION_CATEGORIES;
}

export function getCategoryLabel(
  type: BoundaryType | string,
  value?: string | null
): string | null {
  if (!value) return null;
  const match = getCategoriesForType(type).find((c) => c.value === value);
  return match?.label ?? value;
}

// Category-aware title placeholders — the example follows the selected chip so
// the categories feel functional, not decorative.
const BOUNDARY_PLACEHOLDERS: Record<string, string> = {
  purity: 'e.g. Overnights are off the table for now',
  digital: 'e.g. No phones during meals together',
  friendships: 'e.g. One-on-ones come with a heads-up',
  time: 'e.g. One tech-free evening a week',
  finances: 'e.g. Purchases over $100 get a quick chat',
  family: 'e.g. Holiday plans are decided by us first',
  communication: 'e.g. No name-calling, even in the big ones',
};

const TEMPTATION_PLACEHOLDERS: Record<string, string> = {
  lust: 'e.g. Late-night scrolling',
  'emotional-affair': 'e.g. A friendship getting too close',
  substances: 'e.g. Drinking more when stressed',
  anger: 'e.g. Harsh words when I’m exhausted',
  comparison: 'e.g. Comparing us to couples online',
  secrecy: 'e.g. Hiding small purchases',
};

export function getTitlePlaceholder(
  type: BoundaryType | string,
  category?: string | null
): string {
  const isBoundary = type === 'boundary';
  const map = isBoundary ? BOUNDARY_PLACEHOLDERS : TEMPTATION_PLACEHOLDERS;
  const fallback = isBoundary ? 'e.g. No phones during dinner' : 'e.g. Late night texting with others';
  return (category && map[category]) || fallback;
}
