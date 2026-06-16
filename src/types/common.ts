export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export type DateCategory = 'adventure' | 'spiritual' | 'creative' | 'simple' | 'at-home';

export type BoundaryType = 'boundary' | 'temptation';

export type SubscriptionTier = 'free' | 'premium';

export type RelationshipStatus = 'dating' | 'engaged' | 'married';

export type CheckInRating = 1 | 2 | 3 | 4 | 5;
