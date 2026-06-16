export const queryKeys = {
  profile: {
    all: ['profile'] as const,
    mine: () => [...queryKeys.profile.all, 'mine'] as const,
    byId: (id: string) => [...queryKeys.profile.all, id] as const,
  },
  couple: {
    all: ['couple'] as const,
    mine: () => [...queryKeys.couple.all, 'mine'] as const,
    partner: () => [...queryKeys.couple.all, 'partner'] as const,
  },
  devotionals: {
    all: ['devotionals'] as const,
    today: () => [...queryKeys.devotionals.all, 'today'] as const,
    byId: (id: string) => [...queryKeys.devotionals.all, id] as const,
    progress: (devotionalId: string) =>
      [...queryKeys.devotionals.all, devotionalId, 'progress'] as const,
    history: () => [...queryKeys.devotionals.all, 'history'] as const,
  },
  prayers: {
    all: ['prayers'] as const,
    byCoupleId: (coupleId: string) =>
      [...queryKeys.prayers.all, coupleId] as const,
  },
  checkIns: {
    all: ['check-ins'] as const,
    byCoupleId: (coupleId: string) =>
      [...queryKeys.checkIns.all, coupleId] as const,
    byWeek: (coupleId: string, weekOf: string) =>
      [...queryKeys.checkIns.all, coupleId, weekOf] as const,
  },
  boundaries: {
    all: ['boundaries'] as const,
    byCoupleId: (coupleId: string) =>
      [...queryKeys.boundaries.all, coupleId] as const,
  },
  dateIdeas: {
    all: ['date-ideas'] as const,
    byCategory: (category: string) =>
      [...queryKeys.dateIdeas.all, category] as const,
  },
  coupleDates: {
    all: ['couple-dates'] as const,
    byCoupleId: (coupleId: string) =>
      [...queryKeys.coupleDates.all, coupleId] as const,
  },
  entitlement: {
    all: ['entitlement'] as const,
    premium: () => [...queryKeys.entitlement.all, 'premium'] as const,
  },
} as const;
