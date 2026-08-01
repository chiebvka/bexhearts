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
    weekComparison: (coupleId: string, weekOf: string) =>
      [...queryKeys.checkIns.all, coupleId, weekOf, 'comparison'] as const,
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
    aggregates: () => [...queryKeys.dateIdeas.all, 'aggregates'] as const,
  },
  coupleDates: {
    all: ['couple-dates'] as const,
    byCoupleId: (coupleId: string) =>
      [...queryKeys.coupleDates.all, coupleId] as const,
    byId: (id: string) => [...queryKeys.coupleDates.all, 'one', id] as const,
  },
  entitlement: {
    all: ['entitlement'] as const,
    premium: () => [...queryKeys.entitlement.all, 'premium'] as const,
    // Under the `entitlement` root on purpose: that root is on the
    // NON_PERSISTED_KEY_ROOTS list (H2), so a revoked comp can never be
    // restored from disk as still-granted after a cold start.
    comp: () => [...queryKeys.entitlement.all, 'comp'] as const,
  },
  activity: {
    all: ['activity'] as const,
    byCoupleId: (coupleId: string) =>
      [...queryKeys.activity.all, coupleId] as const,
    stats: (coupleId: string) =>
      [...queryKeys.activity.all, coupleId, 'stats'] as const,
    dailyCounts: (coupleId: string) =>
      [...queryKeys.activity.all, coupleId, 'daily-counts'] as const,
  },
  points: {
    all: ['points'] as const,
    total: (coupleId: string) => [...queryKeys.points.all, coupleId, 'total'] as const,
    history: (coupleId: string) => [...queryKeys.points.all, coupleId, 'history'] as const,
    leaderboard: () => [...queryKeys.points.all, 'leaderboard'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    inbox: (userId: string) => [...queryKeys.notifications.all, userId] as const,
  },
  journal: {
    all: ['journal'] as const,
    timeline: (coupleId: string) => [...queryKeys.journal.all, coupleId, 'timeline'] as const,
    milestones: (coupleId: string) => [...queryKeys.journal.all, coupleId, 'milestones'] as const,
    memory: (memoryId: string) => [...queryKeys.journal.all, 'memory', memoryId] as const,
  },
} as const;
