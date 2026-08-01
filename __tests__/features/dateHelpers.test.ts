// D5 — couple-date lifecycle + scheduling helpers.
import {
  canRespondToSuggestion,
  getDateStatus,
  getDateTitle,
  partitionCoupleDates,
} from '@/features/dates/dateHelpers';
import { getSchedulePresets } from '@/features/dates/schedulePresets';

describe('getDateStatus', () => {
  it('is completed when completed_at is set (even if also scheduled)', () => {
    expect(
      getDateStatus({ completed_at: '2026-06-01T00:00:00Z', scheduled_for: '2026-05-30' })
    ).toBe('completed');
  });
  it('is planned when scheduled but not completed', () => {
    expect(getDateStatus({ scheduled_for: '2026-07-10' })).toBe('planned');
  });
  it('is saved when neither scheduled nor completed', () => {
    expect(getDateStatus({})).toBe('saved');
  });
});

describe('getDateTitle', () => {
  it('prefers the linked library idea title', () => {
    expect(getDateTitle({ date_ideas: { title: 'Stargazing' }, custom_title: 'x' })).toBe(
      'Stargazing'
    );
  });
  it('falls back to the custom title for own-idea dates', () => {
    expect(getDateTitle({ date_ideas: null, custom_title: 'Lake drive' })).toBe('Lake drive');
  });
  it('has a safe fallback', () => {
    expect(getDateTitle({})).toBe('Untitled date');
  });
});

describe('partitionCoupleDates', () => {
  it('groups by derived status', () => {
    const { planned, saved, completed } = partitionCoupleDates([
      { id: '1', completed_at: '2026-06-01T00:00:00Z' },
      { id: '2', scheduled_for: '2026-07-10' },
      { id: '3' },
    ] as { id: string; completed_at?: string | null; scheduled_for?: string | null }[]);
    expect(completed.map((d) => d.id)).toEqual(['1']);
    expect(planned.map((d) => d.id)).toEqual(['2']);
    expect(saved.map((d) => d.id)).toEqual(['3']);
  });
  it('handles empty input', () => {
    expect(partitionCoupleDates(null)).toEqual({ suggested: [], planned: [], saved: [], completed: [] });
  });
});

describe('getSchedulePresets', () => {
  it('returns future-dated presets relative to now', () => {
    // Wed 2026-07-01
    const presets = getSchedulePresets(new Date('2026-07-01T12:00:00Z'));
    const byKey = Object.fromEntries(presets.map((p) => [p.key, p.date]));
    expect(byKey.tomorrow).toBe('2026-07-02');
    expect(byKey['this-weekend']).toBe('2026-07-04'); // next Saturday
    expect(byKey['next-friday']).toBe('2026-07-03');
    expect(byKey['in-two-weeks']).toBe('2026-07-15');
    // every preset is strictly after "now"
    presets.forEach((p) => expect(p.date > '2026-07-01').toBe(true));
  });
});

describe('Dates v2 suggestions (G2, 2026-07-19)', () => {
  const suggested = { suggested_by: 'user-a', accepted_at: null, completed_at: null, scheduled_for: null };

  it('derives the suggested status until accepted', () => {
    expect(getDateStatus(suggested)).toBe('suggested');
    expect(getDateStatus({ ...suggested, accepted_at: '2026-07-19' })).toBe('saved');
    expect(getDateStatus({ ...suggested, accepted_at: '2026-07-19', scheduled_for: '2026-07-20' })).toBe('planned');
    // Completion always wins
    expect(getDateStatus({ ...suggested, completed_at: '2026-07-19' })).toBe('completed');
  });

  it('legacy rows without suggested_by behave exactly as before', () => {
    expect(getDateStatus({ suggested_by: null, scheduled_for: '2026-07-20' })).toBe('planned');
    expect(getDateStatus({})).toBe('saved');
  });

  it('partitions suggestions into their own bucket', () => {
    const { suggested: sug, saved } = partitionCoupleDates([
      { id: '1', ...suggested },
      { id: '2', suggested_by: null },
    ] as never[]);
    expect(sug.map((d: { id: string }) => d.id)).toEqual(['1']);
    expect(saved.map((d: { id: string }) => d.id)).toEqual(['2']);
  });

  it('only the NON-suggesting partner can respond', () => {
    expect(canRespondToSuggestion(suggested, 'user-b')).toBe(true);
    expect(canRespondToSuggestion(suggested, 'user-a')).toBe(false);
    expect(canRespondToSuggestion(suggested, undefined)).toBe(false);
    expect(canRespondToSuggestion({ ...suggested, accepted_at: '2026-07-19' }, 'user-b')).toBe(false);
  });
});
