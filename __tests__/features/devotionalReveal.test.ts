// D1·M3 — partner-reflection reveal gating.
import {
  getReflectionRevealState,
  hasReflection,
} from '@/features/devotional/reflectionReveal';

describe('hasReflection', () => {
  it('is false for missing / empty / whitespace reflections', () => {
    expect(hasReflection(null)).toBe(false);
    expect(hasReflection(undefined)).toBe(false);
    expect(hasReflection({ reflection_response: '' })).toBe(false);
    expect(hasReflection({ reflection_response: '   ' })).toBe(false);
    expect(hasReflection({ reflection_response: null })).toBe(false);
  });

  it('is true once a non-empty reflection exists', () => {
    expect(hasReflection({ reflection_response: 'Grateful' })).toBe(true);
  });
});

describe('getReflectionRevealState', () => {
  const reflected = { reflection_response: 'I felt seen' };
  const empty = { reflection_response: '' };

  it('is locked when no partner is linked', () => {
    expect(
      getReflectionRevealState({ isLinked: false, mine: reflected, partner: reflected })
    ).toBe('locked');
  });

  it('awaits self when the user has not reflected yet', () => {
    expect(
      getReflectionRevealState({ isLinked: true, mine: empty, partner: reflected })
    ).toBe('await-self');
  });

  it('awaits partner when only the user has reflected', () => {
    expect(
      getReflectionRevealState({ isLinked: true, mine: reflected, partner: empty })
    ).toBe('await-partner');
  });

  it('reveals once both have reflected', () => {
    expect(
      getReflectionRevealState({ isLinked: true, mine: reflected, partner: reflected })
    ).toBe('revealed');
  });
});
