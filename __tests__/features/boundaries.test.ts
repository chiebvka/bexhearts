// D4 — boundaries partitioning + category taxonomy + starter templates.
import { partitionBoundaries } from '@/features/boundaries/partition';
import {
  getCategoriesForType,
  getCategoryLabel,
  getTitlePlaceholder,
  BOUNDARY_CATEGORIES,
  TEMPTATION_CATEGORIES,
} from '@/features/boundaries/categories';
import { getTemplatesFor, BOUNDARY_TEMPLATES } from '@/features/boundaries/templates';
import { partitionBoundaryHistory, canDeactivate } from '@/features/boundaries/partition';

describe('partitionBoundaries', () => {
  it('returns empty groups for missing input', () => {
    expect(partitionBoundaries(null)).toEqual({ boundaries: [], temptations: [] });
    expect(partitionBoundaries(undefined)).toEqual({ boundaries: [], temptations: [] });
  });

  it('splits boundaries from temptation plans, preserving order', () => {
    const { boundaries, temptations } = partitionBoundaries([
      { id: '1', type: 'boundary' },
      { id: '2', type: 'temptation' },
      { id: '3', type: 'boundary' },
    ]);
    expect(boundaries.map((b) => b.id)).toEqual(['1', '3']);
    expect(temptations.map((t) => t.id)).toEqual(['2']);
  });
});

describe('boundary categories', () => {
  it('serves a distinct set per type', () => {
    expect(getCategoriesForType('boundary')).toBe(BOUNDARY_CATEGORIES);
    expect(getCategoriesForType('temptation')).toBe(TEMPTATION_CATEGORIES);
    // the two registers must not share their taxonomy
    const boundaryValues = BOUNDARY_CATEGORIES.map((c) => c.value);
    const temptationValues = TEMPTATION_CATEGORIES.map((c) => c.value);
    expect(boundaryValues).not.toEqual(temptationValues);
  });

  it('resolves a known value to its human label', () => {
    expect(getCategoryLabel('boundary', 'purity')).toBe('Physical & purity');
    expect(getCategoryLabel('temptation', 'lust')).toBe('Lust & purity');
  });

  it('falls back to the raw value for unknown categories and null for empty', () => {
    expect(getCategoryLabel('boundary', 'custom-thing')).toBe('custom-thing');
    expect(getCategoryLabel('boundary', null)).toBeNull();
    expect(getCategoryLabel('boundary', undefined)).toBeNull();
  });
});

describe('title placeholders', () => {
  it('follows the selected category', () => {
    expect(getTitlePlaceholder('boundary', 'finances')).toContain('$100');
    expect(getTitlePlaceholder('temptation', 'comparison')).toContain('Comparing');
  });

  it('falls back per register when no category is picked (or unknown)', () => {
    expect(getTitlePlaceholder('boundary', null)).toBe('e.g. No phones during dinner');
    expect(getTitlePlaceholder('boundary', 'not-a-category')).toBe('e.g. No phones during dinner');
    expect(getTitlePlaceholder('temptation', undefined)).toBe(
      'e.g. Late night texting with others'
    );
  });
});

describe('starter templates', () => {
  it('every template is internally valid', () => {
    const ids = new Set<string>();
    for (const t of BOUNDARY_TEMPLATES) {
      expect(ids.has(t.id)).toBe(false); // unique ids
      ids.add(t.id);
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
      // category must exist in the register's taxonomy
      const taxonomy = getCategoriesForType(t.type).map((c) => c.value);
      expect(taxonomy).toContain(t.category);
      // action plans belong to temptation plans only (boundaries dropped the field)
      if (t.type === 'boundary') expect(t.actionPlan).toBeUndefined();
      if (t.type === 'temptation') expect(t.actionPlan?.length).toBeGreaterThan(0);
      for (const s of t.stages ?? []) {
        expect(['dating', 'engaged', 'married']).toContain(s);
      }
    }
  });

  it('both registers have templates, and every boundary category is covered', () => {
    const boundary = getTemplatesFor('boundary');
    const temptation = getTemplatesFor('temptation');
    expect(boundary.length).toBeGreaterThan(0);
    expect(temptation.length).toBeGreaterThan(0);
    const covered = new Set(boundary.map((t) => t.category));
    for (const c of BOUNDARY_CATEGORIES) expect(covered.has(c.value)).toBe(true);
  });

  it('filters by register + stage + category', () => {
    // stage filter: dating never sees married-only templates (e.g. budget review)
    const dating = getTemplatesFor('boundary', 'dating');
    expect(dating.some((t) => t.id === 'b-finances-review')).toBe(false);
    const married = getTemplatesFor('boundary', 'married');
    expect(married.some((t) => t.id === 'b-finances-review')).toBe(true);
    // untagged templates fit every stage
    expect(dating.some((t) => t.id === 'b-digital-meals')).toBe(true);
    // unknown/missing stage shows everything for that register
    expect(getTemplatesFor('boundary', null)).toHaveLength(
      BOUNDARY_TEMPLATES.filter((t) => t.type === 'boundary').length
    );
    // category chip narrows the rail
    const finances = getTemplatesFor('boundary', 'married', 'finances');
    expect(finances.length).toBeGreaterThan(0);
    expect(finances.every((t) => t.category === 'finances')).toBe(true);
    // stage + category filters compose
    expect(getTemplatesFor('boundary', 'dating', 'family')).toHaveLength(0);
  });
});

describe('partitionBoundaryHistory (D5)', () => {
  const rows = [
    { id: '1', type: 'boundary', is_active: true },
    { id: '2', type: 'boundary', is_active: false },
    { id: '3', type: 'temptation', is_active: true },
    { id: '4', type: 'temptation', is_active: false },
    { id: '5', type: 'boundary' }, // undefined is_active = active
  ];

  it('routes active/inactive rows into the four groups', () => {
    const g = partitionBoundaryHistory(rows);
    expect(g.boundaries.map((b) => b.id)).toEqual(['1', '5']);
    expect(g.pastCovenants.map((b) => b.id)).toEqual(['2']);
    expect(g.temptations.map((b) => b.id)).toEqual(['3']);
    expect(g.victories.map((b) => b.id)).toEqual(['4']);
  });

  it('handles empty input', () => {
    const g = partitionBoundaryHistory(null);
    expect(g).toEqual({ boundaries: [], temptations: [], victories: [], pastCovenants: [] });
  });
});

describe('canDeactivate (D5 — author-only resolve for temptation plans)', () => {
  it('boundaries can be retired by either partner', () => {
    expect(canDeactivate({ type: 'boundary', author_id: 'a' }, 'b')).toBe(true);
  });

  it('temptation plans can only be resolved by their author', () => {
    expect(canDeactivate({ type: 'temptation', author_id: 'a' }, 'a')).toBe(true);
    expect(canDeactivate({ type: 'temptation', author_id: 'a' }, 'b')).toBe(false);
    expect(canDeactivate({ type: 'temptation', author_id: 'a' }, null)).toBe(false);
  });
});
