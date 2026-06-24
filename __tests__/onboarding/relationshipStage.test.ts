import {
  relationshipStageSchema,
  RELATIONSHIP_STAGES,
  growthFocusSchema,
} from '@/features/onboarding/schemas';
import { useOnboardingStore } from '@/stores/onboarding.store';

describe('relationshipStageSchema', () => {
  it('accepts each valid stage', () => {
    for (const stage of RELATIONSHIP_STAGES) {
      expect(relationshipStageSchema.safeParse(stage).success).toBe(true);
    }
  });

  it('rejects unknown values', () => {
    expect(relationshipStageSchema.safeParse('single').success).toBe(false);
    expect(relationshipStageSchema.safeParse('').success).toBe(false);
    expect(relationshipStageSchema.safeParse(undefined).success).toBe(false);
  });
});

describe('growthFocusSchema (C1b personalization)', () => {
  it('accepts a non-empty set of valid focus areas', () => {
    expect(growthFocusSchema.safeParse(['prayer']).success).toBe(true);
    expect(
      growthFocusSchema.safeParse(['communication', 'intimacy']).success
    ).toBe(true);
  });

  it('requires at least one selection', () => {
    expect(growthFocusSchema.safeParse([]).success).toBe(false);
  });

  it('rejects unknown focus areas', () => {
    expect(growthFocusSchema.safeParse(['finances']).success).toBe(false);
  });
});

describe('onboarding store — relationship stage + growth focus', () => {
  beforeEach(() => useOnboardingStore.getState().reset());

  it('defaults to null / empty', () => {
    expect(useOnboardingStore.getState().relationshipStage).toBeNull();
    expect(useOnboardingStore.getState().growthFocus).toEqual([]);
  });

  it('stores the selected stage and focus areas', () => {
    useOnboardingStore.getState().setRelationshipStage('engaged');
    useOnboardingStore.getState().setGrowthFocus(['prayer', 'communication']);
    expect(useOnboardingStore.getState().relationshipStage).toBe('engaged');
    expect(useOnboardingStore.getState().growthFocus).toEqual([
      'prayer',
      'communication',
    ]);
  });

  it('reset() clears stage and focus', () => {
    useOnboardingStore.getState().setRelationshipStage('married');
    useOnboardingStore.getState().setGrowthFocus(['intimacy']);
    useOnboardingStore.getState().reset();
    expect(useOnboardingStore.getState().relationshipStage).toBeNull();
    expect(useOnboardingStore.getState().growthFocus).toEqual([]);
  });
});
