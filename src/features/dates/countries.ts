// E13 — country tags on date ideas (owner ask 2026-07-26).
//
// An idea's `country_tags` is an array of ISO 3166-1 alpha-2 codes; EMPTY
// means global, which is the honest default for most of the library (a prayer
// walk works the same everywhere). Only codes we actually tag need to be here;
// anything unknown degrades to the bare code rather than breaking the UI.

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const GLOBAL_TAG: Country = { code: 'GLOBAL', name: 'Anywhere', flag: '🌍' };

const COUNTRIES: Record<string, Country> = {
  NG: { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  GH: { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  SN: { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  KE: { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  UG: { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  TZ: { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  MX: { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  CO: { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  BR: { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  AR: { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  IN: { code: 'IN', name: 'India', flag: '🇮🇳' },
  PK: { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  BD: { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  LK: { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  PH: { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  ID: { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  VN: { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  TH: { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  MA: { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  EG: { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  JO: { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  CA: { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  US: { code: 'US', name: 'United States', flag: '🇺🇸' },
  GB: { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  NL: { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  PL: { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  UA: { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  SE: { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
};

export function getCountry(code: string): Country {
  return COUNTRIES[code.toUpperCase()] ?? { code, name: code, flag: '📍' };
}

// The chips to show on an idea. An empty tag list is a single "Anywhere 🌍"
// chip rather than nothing, so the concept is always visible and tappable.
export function ideaCountries(tags: string[] | null | undefined): Country[] {
  if (!tags || tags.length === 0) return [GLOBAL_TAG];
  return tags.map(getCountry);
}

export function isGlobal(tags: string[] | null | undefined): boolean {
  return !tags || tags.length === 0;
}

// "Loved by couples in Nigeria — ★4.6 · 12 couples", or an honest empty state.
// Ratings come from the existing per-couple ledger, so this needed no new
// rating infrastructure.
export function countryRatingLabel(
  stat: { avg_rating: number; couples_count: number } | undefined,
  countryName: string
): string {
  if (!stat || stat.couples_count === 0) {
    return `No couples in ${countryName} have rated this yet — you could be first.`;
  }
  const couples = stat.couples_count === 1 ? '1 couple' : `${stat.couples_count} couples`;
  return `★${stat.avg_rating} from ${couples} in ${countryName}`;
}

// ---------------------------------------------------------------------------
// Passport badge
//
// Deliberately a BADGE, not a prize: anything prize-shaped runs into the
// rewards-eligibility questions parked in ToS §7 for the attorney (subscription
// tenure, both-partners-active, anti-abuse, no-purchase-necessary). A badge
// motivates without promising anything.

export const PASSPORT_TARGET = 3;

export interface CompletedIdeaLike {
  completed_at?: string | null;
  date_ideas?: { country_tags?: string[] | null } | null;
}

// How many DIFFERENT countries the couple has actually tried a date from.
// Global ideas don't count toward it — the badge is about reaching outside
// your own context, which is the whole point of tagging the library.
export function passportCountries(dates: CompletedIdeaLike[] | undefined): string[] {
  const seen = new Set<string>();
  for (const date of dates ?? []) {
    if (!date.completed_at) continue;
    for (const code of date.date_ideas?.country_tags ?? []) seen.add(code);
  }
  return [...seen].sort();
}

export function passportProgress(dates: CompletedIdeaLike[] | undefined): {
  count: number;
  earned: boolean;
  label: string;
} {
  const count = passportCountries(dates).length;
  const earned = count >= PASSPORT_TARGET;
  return {
    count,
    earned,
    label: earned
      ? `Passport 🌍 — dates from ${count} countries`
      : `Passport 🌍 — ${count}/${PASSPORT_TARGET} countries`,
  };
}
