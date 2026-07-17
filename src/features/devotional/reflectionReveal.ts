// D1·M3 — partner-reflection reveal gating.
// Each partner reflects privately; you only see your partner's reflection once
// BOTH of you have written one. Solo couples (no linked partner) see a
// locked-until-partner state, not a paywall (PROGRESS: "one wall, one carrot").

export type ReflectionRevealState =
  | 'locked' // no partner linked yet
  | 'await-self' // partner may have reflected; you haven't
  | 'await-partner' // you reflected; waiting on your partner
  | 'revealed'; // both reflected — show partner's

interface ProgressLike {
  reflection_response?: string | null;
}

export function hasReflection(progress?: ProgressLike | null): boolean {
  return !!progress?.reflection_response?.trim();
}

export function getReflectionRevealState(args: {
  isLinked: boolean;
  mine?: ProgressLike | null;
  partner?: ProgressLike | null;
}): ReflectionRevealState {
  if (!args.isLinked) return 'locked';
  if (!hasReflection(args.mine)) return 'await-self';
  if (!hasReflection(args.partner)) return 'await-partner';
  return 'revealed';
}
