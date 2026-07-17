// D2·M1 — prayer list partitioning (Praying vs. Answered).
import { partitionPrayers } from '@/features/prayer/partition';

describe('partitionPrayers', () => {
  it('returns empty groups for missing input', () => {
    expect(partitionPrayers(null)).toEqual({ active: [], answered: [] });
    expect(partitionPrayers(undefined)).toEqual({ active: [], answered: [] });
    expect(partitionPrayers([])).toEqual({ active: [], answered: [] });
  });

  it('splits answered from active and preserves order within each group', () => {
    const prayers = [
      { id: '1', is_answered: false },
      { id: '2', is_answered: true },
      { id: '3', is_answered: false },
      { id: '4', is_answered: true },
    ];

    const { active, answered } = partitionPrayers(prayers);

    expect(active.map((p) => p.id)).toEqual(['1', '3']);
    expect(answered.map((p) => p.id)).toEqual(['2', '4']);
  });

  it('treats null/undefined is_answered as active', () => {
    const { active, answered } = partitionPrayers([
      { id: '1', is_answered: null },
      { id: '2' },
    ]);
    expect(active.map((p) => p.id)).toEqual(['1', '2']);
    expect(answered).toEqual([]);
  });
});
