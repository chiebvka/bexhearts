// D3·M3 — weekly check-in comparison gating.
// Each partner submits their own weekly check-in privately; you only see your
// partner's ratings once BOTH of you have submitted for the week. Solo couples
// (no linked partner) see a locked-until-partner state, not a paywall
// (PROGRESS: "one wall, one carrot").

export type CheckInComparisonState =
  | 'locked' // no partner linked yet
  | 'await-self' // you haven't submitted this week
  | 'await-partner' // you submitted; waiting on your partner
  | 'revealed'; // both submitted — show the comparison

// A submitted check-in is simply a row that exists for the week (the form
// requires all three ratings before it can be saved).
export function hasSubmitted(checkIn?: unknown | null): boolean {
  return checkIn != null;
}

export function getCheckInComparisonState(args: {
  isLinked: boolean;
  mine?: unknown | null;
  partner?: unknown | null;
}): CheckInComparisonState {
  if (!args.isLinked) return 'locked';
  if (!hasSubmitted(args.mine)) return 'await-self';
  if (!hasSubmitted(args.partner)) return 'await-partner';
  return 'revealed';
}

// D3 sharing (owner locked 2026-07-10): once BOTH have submitted, the partner's
// gratitude note is ALWAYS revealed (it's written to be given away); the growth
// note and prayer request appear only if the author flipped that field's share
// toggle. Never call this before the state is 'revealed'.
export interface PartnerCheckInNotes {
  gratitude: string | null;
  growth: string | null;
  prayer: string | null;
}

export function getVisiblePartnerNotes(
  partner?: {
    gratitude_note?: string | null;
    growth_area?: string | null;
    prayer_request?: string | null;
    share_growth_note?: boolean | null;
    share_prayer_request?: boolean | null;
  } | null
): PartnerCheckInNotes {
  if (!partner) return { gratitude: null, growth: null, prayer: null };
  const text = (v?: string | null) => (v && v.trim().length > 0 ? v.trim() : null);
  return {
    gratitude: text(partner.gratitude_note),
    growth: partner.share_growth_note ? text(partner.growth_area) : null,
    prayer: partner.share_prayer_request ? text(partner.prayer_request) : null,
  };
}
