// D7 (owner locked 2026-07-10) — one-tap anniversary presets for the Special
// Day form, so dating/engagement/wedding anniversaries land on the Journal
// timeline as first-class milestones. These same dates are what the future
// recap cards key on (year-end + app anniversary + relationship anniversaries
// ONLY — owner: no weekly recap, ever; data gathering rides couple_events).

export interface MilestonePreset {
  icon: string;
  title: string;
}

export const MILESTONE_PRESETS: MilestonePreset[] = [
  { icon: '💜', title: 'Dating anniversary' },
  { icon: '💍', title: 'Engagement anniversary' },
  { icon: '💒', title: 'Wedding anniversary' },
  { icon: '☕', title: 'Our first date' },
  { icon: '❤️', title: 'First “I love you”' },
];
