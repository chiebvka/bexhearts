// Boundary/temptation starter templates (owner approved 2026-07-10) — the
// blank-form fix. Client-side constants like categories.ts: the DB category
// column is freeform TEXT, so this library grows without a migration. Each
// BOUNDARY template also doubles as a marketing content seed (MARKETING §2.2 —
// boundaries are the UGC/acquisition engine; temptation plans are never ads).
import type { BoundaryType } from '@/types/common';

export type TemplateStage = 'dating' | 'engaged' | 'married';

export interface BoundaryTemplate {
  id: string;
  type: BoundaryType;
  category: string;
  /** Prefills the title field. Statement voice, editable. */
  title: string;
  /** Prefills "Why is this important?" — one warm sentence, never preachy. */
  description: string;
  /** Temptation plans only — prefills "Your plan when it hits". */
  actionPlan?: string;
  /** Omitted = fits every relationship stage. */
  stages?: TemplateStage[];
}

export const BOUNDARY_TEMPLATES: BoundaryTemplate[] = [
  // ——— Boundaries: proactive shared covenants ———
  {
    id: 'b-purity-overnights',
    type: 'boundary',
    category: 'purity',
    title: 'Overnights are off the table for now',
    description: 'We want to protect what we’re building before marriage — together, on purpose.',
    stages: ['dating', 'engaged'],
  },
  {
    id: 'b-purity-alone-time',
    type: 'boundary',
    category: 'purity',
    title: 'We’re honest about the situations that test us',
    description: 'Naming the hard settings ahead of time beats negotiating in the moment.',
    stages: ['dating', 'engaged'],
  },
  {
    id: 'b-purity-private',
    type: 'boundary',
    category: 'purity',
    title: 'What’s intimate stays between us',
    description: 'Our closeness isn’t content for friends or group chats — it belongs to us.',
  },
  {
    id: 'b-digital-meals',
    type: 'boundary',
    category: 'digital',
    title: 'No phones during meals together',
    description: 'Twenty minutes of full attention does more for us than an hour of half-presence.',
  },
  {
    id: 'b-digital-exes',
    type: 'boundary',
    category: 'digital',
    title: 'We don’t message exes without the other knowing',
    description: 'Openness here costs us little and protects a lot of trust.',
  },
  {
    id: 'b-digital-posting',
    type: 'boundary',
    category: 'digital',
    title: 'We post about each other only with a yes',
    description: 'Our story gets shared at a pace we’re both comfortable with.',
    stages: ['dating', 'engaged'],
  },
  {
    id: 'b-friendships-heads-up',
    type: 'boundary',
    category: 'friendships',
    title: 'One-on-ones with the opposite sex come with a heads-up',
    description: 'Not permission — just openness. Secrecy is the thing we’re guarding against.',
  },
  {
    id: 'b-friendships-introduce',
    type: 'boundary',
    category: 'friendships',
    title: 'New close friends get introduced',
    description: 'We want our people to know each other — our worlds shouldn’t run in parallel.',
  },
  {
    id: 'b-time-tech-free',
    type: 'boundary',
    category: 'time',
    title: 'One tech-free evening together each week',
    description: 'A standing pocket of undivided time keeps us from drifting into roommates.',
  },
  {
    id: 'b-time-date-night',
    type: 'boundary',
    category: 'time',
    title: 'Date night doesn’t get bumped for work',
    description: 'If it’s always the first thing sacrificed, it quietly stops existing.',
  },
  {
    id: 'b-finances-check',
    type: 'boundary',
    category: 'finances',
    title: 'Purchases over $100 get a quick chat first',
    description: 'Not control — partnership. Money surprises are where resentment grows.',
    stages: ['engaged', 'married'],
  },
  {
    id: 'b-finances-honest',
    type: 'boundary',
    category: 'finances',
    title: 'We’re honest about what we can actually afford',
    description: 'No pretending on dates or gifts — real numbers, no shame either way.',
    stages: ['dating'],
  },
  {
    id: 'b-finances-review',
    type: 'boundary',
    category: 'finances',
    title: 'We look at the budget together monthly',
    description: 'Ten minutes a month so neither of us carries the money stress alone.',
    stages: ['married'],
  },
  {
    id: 'b-family-united',
    type: 'boundary',
    category: 'family',
    title: 'We present a united front with both families',
    description: 'Disagreements get settled between us first — never litigated through parents.',
    stages: ['engaged', 'married'],
  },
  {
    id: 'b-family-holidays',
    type: 'boundary',
    category: 'family',
    title: 'Holiday plans are decided by us first',
    description: 'We love our families — and our little family decides its calendar together.',
    stages: ['engaged', 'married'],
  },
  {
    id: 'b-comm-pause',
    type: 'boundary',
    category: 'communication',
    title: 'We don’t go to bed mid-fight — we pause with a plan',
    description: 'Some fights need sleep first. We park them on purpose, with a time to return.',
  },
  {
    id: 'b-comm-no-names',
    type: 'boundary',
    category: 'communication',
    title: 'No name-calling — even in the big ones',
    description: 'We can disagree hard without leaving marks that outlast the argument.',
  },
  {
    id: 'b-comm-face',
    type: 'boundary',
    category: 'communication',
    title: 'Hard conversations happen face to face, not over text',
    description: 'Tone dies in a text thread. The big stuff deserves our whole faces.',
  },

  // ——— Temptation plans: grace-framed, "tap one that fits" ———
  {
    id: 't-lust-scrolling',
    type: 'temptation',
    category: 'lust',
    title: 'Late-night scrolling that goes places it shouldn’t',
    description: 'It leaves me feeling far from you and further from God.',
    actionPlan: 'Phone charges outside the bedroom. When it’s hard, I tell you instead of hiding it.',
  },
  {
    id: 't-affair-close',
    type: 'temptation',
    category: 'emotional-affair',
    title: 'A friendship that’s getting too close',
    description: 'I’d rather name it early than explain it late.',
    actionPlan: 'I’ll keep the messages open to you, widen the circle, and pull back from one-on-ones.',
  },
  {
    id: 't-substances-stress',
    type: 'temptation',
    category: 'substances',
    title: 'Reaching for a drink when I’m stressed',
    description: 'It numbs the day but steals the evening from us.',
    actionPlan: 'I’ll name the stress out loud first — and we’ll walk or pray before I pour anything.',
  },
  {
    id: 't-anger-tired',
    type: 'temptation',
    category: 'anger',
    title: 'Harsh words when I’m running on empty',
    description: 'You get the worst version of me at the exact moment you deserve better.',
    actionPlan: 'I’ll ask for ten minutes before we talk it out — pause first, words after.',
  },
  {
    id: 't-comparison-online',
    type: 'temptation',
    category: 'comparison',
    title: 'Comparing us to couples online',
    description: 'Their highlight reel makes me grade our real life unfairly.',
    actionPlan: 'Unfollow what stirs it, and say one true thing I’m grateful for about us instead.',
  },
  {
    id: 't-secrecy-purchases',
    type: 'temptation',
    category: 'secrecy',
    title: 'Hiding small purchases',
    description: 'It’s never about the money — it’s the hiding that hurts us.',
    actionPlan: 'I’ll share it the same day, even when it’s embarrassing.',
  },
];

/**
 * Templates for the form rail: filtered by register, then by the couple's
 * relationship stage (untagged templates fit everyone; unknown/missing stage
 * shows everything), then by the selected category chip if any.
 */
export function getTemplatesFor(
  type: BoundaryType | string,
  stage?: string | null,
  category?: string | null
): BoundaryTemplate[] {
  return BOUNDARY_TEMPLATES.filter(
    (t) =>
      t.type === type &&
      (!category || t.category === category) &&
      (!t.stages || !stage || t.stages.includes(stage as TemplateStage))
  );
}
