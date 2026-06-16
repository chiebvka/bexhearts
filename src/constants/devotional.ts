export const DEVOTIONAL_CATEGORIES = [
  'faith',
  'love',
  'communication',
  'trust',
  'patience',
  'forgiveness',
  'prayer',
  'growth',
  'purity',
  'service',
] as const;

export type DevotionalCategory = (typeof DEVOTIONAL_CATEGORIES)[number];

export const DATE_CATEGORIES = [
  { key: 'adventure', label: 'Adventure', icon: 'compass' },
  { key: 'spiritual', label: 'Spiritual', icon: 'book-open' },
  { key: 'creative', label: 'Creative', icon: 'palette' },
  { key: 'simple', label: 'Simple', icon: 'heart' },
  { key: 'at-home', label: 'At Home', icon: 'home' },
] as const;

export const BOUNDARY_CATEGORIES = [
  { key: 'physical', label: 'Physical Boundaries' },
  { key: 'digital', label: 'Digital Boundaries' },
  { key: 'emotional', label: 'Emotional Boundaries' },
  { key: 'social', label: 'Social Boundaries' },
] as const;
