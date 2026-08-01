import {
  partnerClock,
  partnerClockLabel,
  isSleepingHour,
  buildIdeaFilters,
  buildIdeaSections,
  nextVisit,
  visitCountdownLabel,
  VIRTUAL_FILTER,
  NEXT_VISIT_ICON,
} from '@/features/ldr/ldr';
import { MILESTONE_PRESETS } from '@/features/journal/presets';
import { useOnboardingStore } from '@/stores/onboarding.store';

// Fixed instant: 2026-07-04 16:00 UTC.
const NOW = new Date('2026-07-04T16:00:00Z');

describe('partnerClock (E11/E12 their-time clock)', () => {
  it('reports the partner clock when timezones differ', () => {
    // 16:00 UTC = 12:00 PM in New York (EDT) — viewer in LA.
    expect(
      partnerClock({
        partnerTimezone: 'America/New_York',
        myTimezone: 'America/Los_Angeles',
        now: NOW,
      })
    ).toEqual({ time: '12:00 PM', asleep: false });
  });

  it('is null when the clocks read the same, or the zone is unusable', () => {
    const same = { myTimezone: 'America/New_York', now: NOW };
    expect(partnerClock({ partnerTimezone: 'America/New_York', ...same })).toBeNull();
    // Different IANA names, same wall clock (Toronto == New York).
    expect(partnerClock({ partnerTimezone: 'America/Toronto', ...same })).toBeNull();
    expect(partnerClock({ partnerTimezone: null, ...same })).toBeNull();
    expect(partnerClock({ partnerTimezone: 'Not/AZone', ...same })).toBeNull();
  });

  it('flags asleep using the partner’s OWN quiet hours when they set them', () => {
    // 16:00 UTC = 1:00 AM in Tokyo (UTC+9) — inside the default window.
    const tokyo = {
      partnerTimezone: 'Asia/Tokyo',
      myTimezone: 'America/New_York',
      now: NOW,
    };
    expect(partnerClock(tokyo)?.asleep).toBe(true);

    // Their own window says they're up at 1am — respect that over the default.
    expect(partnerClock({ ...tokyo, quietHours: { start: 2, end: 6 } })?.asleep).toBe(false);
  });

  it('labels with a moon only while asleep', () => {
    expect(partnerClockLabel({ time: '1:00 AM', asleep: true })).toBe('🌙 1:00 AM their time');
    expect(partnerClockLabel({ time: '2:00 PM', asleep: false })).toBe('2:00 PM their time');
    expect(partnerClockLabel(null)).toBeNull();
  });
});

describe('isSleepingHour', () => {
  it('handles overnight windows', () => {
    expect(isSleepingHour(23, 22, 7)).toBe(true);
    expect(isSleepingHour(3, 22, 7)).toBe(true);
    expect(isSleepingHour(7, 22, 7)).toBe(false); // end is exclusive
    expect(isSleepingHour(14, 22, 7)).toBe(false);
  });

  it('handles same-day windows and treats start === end as no window', () => {
    expect(isSleepingHour(14, 13, 15)).toBe(true);
    expect(isSleepingHour(16, 13, 15)).toBe(false);
    expect(isSleepingHour(3, 9, 9)).toBe(false);
  });
});

describe('buildIdeaFilters (Virtual chip)', () => {
  const categories = [
    { key: 'adventure', label: 'Adventure' },
    { key: 'food', label: 'Food' },
  ];

  it('puts Virtual first for long-distance couples, last otherwise', () => {
    expect(buildIdeaFilters(categories, true)[0]).toEqual(VIRTUAL_FILTER);
    const off = buildIdeaFilters(categories, false);
    expect(off[off.length - 1]).toEqual(VIRTUAL_FILTER);
  });
});

describe('buildIdeaSections (E12 virtual-first split)', () => {
  const ideas = [
    { id: 'a', is_virtual: false },
    { id: 'b', is_virtual: true },
    { id: 'c', is_virtual: false },
    { id: 'd', is_virtual: true },
  ];

  it('splits apart-now from visit-planning for long-distance couples', () => {
    const sections = buildIdeaSections({ ideas, isLongDistance: true, filtered: false });
    expect(sections.map((s) => s.key)).toEqual(['apart', 'together']);
    expect(sections[0].data.map((i) => i.id)).toEqual(['b', 'd']);
    expect(sections[1].title).toBe('For your next visit');
    // Sunk, never hidden — LDR couples still need these for the visit.
    expect(sections[1].data.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('stays one flat list when not long-distance', () => {
    const sections = buildIdeaSections({ ideas, isLongDistance: false, filtered: false });
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBeNull();
    expect(sections[0].data).toHaveLength(4);
  });

  it('stays flat once a category chip is picked — a specific question gets a direct answer', () => {
    const sections = buildIdeaSections({ ideas, isLongDistance: true, filtered: true });
    expect(sections).toHaveLength(1);
    expect(sections[0].data).toHaveLength(4);
  });

  it('omits an empty half rather than showing a bare header', () => {
    const onlyVirtual = [{ id: 'b', is_virtual: true }];
    const sections = buildIdeaSections({
      ideas: onlyVirtual,
      isLongDistance: true,
      filtered: false,
    });
    expect(sections.map((s) => s.key)).toEqual(['apart']);
    expect(buildIdeaSections({ ideas: [], isLongDistance: true, filtered: false })).toEqual([
      { key: 'all', title: null, data: [] },
    ]);
  });
});

describe('nextVisit + visitCountdownLabel (E12 countdown)', () => {
  const milestones = [
    { icon: '💜', event_date: '2026-07-10' },
    { icon: NEXT_VISIT_ICON, event_date: '2026-08-01' },
    { icon: NEXT_VISIT_ICON, event_date: '2026-07-13' },
    { icon: NEXT_VISIT_ICON, event_date: '2026-06-01' }, // past
  ];

  it('picks the soonest upcoming visit, ignoring past ones and other icons', () => {
    expect(nextVisit(milestones, '2026-07-04')?.event_date).toBe('2026-07-13');
  });

  it('counts today as upcoming, and is null when nothing is set', () => {
    expect(nextVisit(milestones, '2026-08-01')?.event_date).toBe('2026-08-01');
    expect(nextVisit(milestones, '2026-09-01')).toBeNull();
    expect(nextVisit(undefined, '2026-07-04')).toBeNull();
  });

  it('reads warmly at every distance', () => {
    expect(visitCountdownLabel(9)).toBe('9 days until you’re together 💜');
    expect(visitCountdownLabel(1)).toBe('Tomorrow you’re together 💜');
    expect(visitCountdownLabel(0)).toBe('You’re together 💜');
  });

  it('the ✈️ preset the countdown keys on still exists', () => {
    expect(MILESTONE_PRESETS.some((p) => p.icon === NEXT_VISIT_ICON)).toBe(true);
  });
});

describe('onboarding capture', () => {
  it('stashes and resets isLongDistance', () => {
    expect(useOnboardingStore.getState().isLongDistance).toBe(false);
    useOnboardingStore.getState().setIsLongDistance(true);
    expect(useOnboardingStore.getState().isLongDistance).toBe(true);
    useOnboardingStore.getState().reset();
    expect(useOnboardingStore.getState().isLongDistance).toBe(false);
  });
});
