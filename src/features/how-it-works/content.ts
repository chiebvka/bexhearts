// Single source of truth for every "how streaks & points work" surface
// (E8, owner-locked 2026-07-18): the How-it-works modal, the onboarding
// beats, and the partner-B team moment all read from here so the copy can't
// drift between surfaces. The website mirrors this on /how-it-works.

// Mirrors the LOCKED streak engine rules (migration 00012). If the trigger
// ever changes, this copy changes in the same pass.
export const STREAK_RULES = [
  {
    icon: '🔥',
    title: 'One flame, both of you',
    body: "Your streak grows on days you both finish the daily devotional. It's one shared flame, not two separate scores.",
  },
  {
    icon: '🕊️',
    title: 'Grace covers a missed day',
    body: 'Miss a single day and one grace day per week keeps the flame lit. Miss two in a row and the streak resets — you simply start again.',
  },
  {
    icon: '🌍',
    title: 'Your day, your timezone',
    body: 'The app counts "today" in your couple\'s own timezone, so the day never flips on you at an odd hour.',
  },
  {
    icon: '🌱',
    title: 'Solo days count',
    body: 'Started before your partner joined? The days you showed up on your own carry over the moment you link.',
  },
] as const;

// Mirrors the SECURITY DEFINER points trigger (migration 00017). Values are
// tuned in the trigger; keep this table in sync in the same pass.
export const POINT_VALUES = [
  { type: 'date_completed', label: 'Complete a date', points: 25 },
  { type: 'check_in', label: 'Weekly check-in', points: 20 },
  { type: 'prayer_session', label: 'Prayer session', points: 15 },
  { type: 'devotional', label: 'Daily devotional', points: 10 },
  { type: 'journal', label: 'Journal moment', points: 10 },
  { type: 'date_rated', label: 'Rate a date idea', points: 5 },
] as const;

export const POINTS_NOTE =
  'Each counts once per person per day. Everything lands in one shared couple total.';

export const REWARDS_NOTE =
  "Points are building toward real couple rewards — we'll share details before the rewards program opens. Until then they climb the leaderboard, where couples stay masked unless you opt in to show your names.";

// Onboarding is deliberately BRIEF (owner 2026-07-18: no lecture screens —
// full breakdowns live on the How-it-works screen and the website).
export const ONBOARDING_STREAK_BEATS = [
  '🔥 Your streak grows when you both finish the day’s devotional',
  '🕊️ One grace day a week covers a miss',
  '💜 Prayers, dates & moments all earn points',
] as const;

export const PARTNER_INVITE_BEAT =
  '🔥 Solo days count — your progress carries over when they join.';

// Partner-B "you're a team" moment: the joiner skips onboarding, so this is
// the only how-it-works they ever see. Two rules max.
export const TEAM_MOMENT_RULES = [
  {
    icon: '🔥',
    body: "Finish today's devotional together to light the flame.",
  },
  {
    icon: '💜',
    body: 'Points are earned as a couple — everything you each do adds to one shared total.',
  },
] as const;
