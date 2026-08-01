import React from 'react';
import { render } from '@testing-library/react-native';

// FIRST-RUN / EMPTY-STATE PASS — the zero-data couple.
//
// This is exactly what App Review sees when they sign in with the demo
// account: streak 0, an empty heatmap, no badges earned, no best-streak line,
// 0 points. It had never been verified (HANDOFF 2026-07-26), because the only
// way to reach it was to hand-create an account and simulator text injection
// kept dropping characters.
//
// So it's pinned here instead: deterministic, runs on every gate, and catches
// the specific failure mode that matters — a screen that renders a bare "0",
// a broken date, or a crash when every collection is empty.

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/components/layout/ScreenContainer', () => {
  const { View: MockView } = jest.requireActual('react-native');
  return {
    ScreenContainer: ({ children }: { children: React.ReactNode }) => (
      <MockView>{children}</MockView>
    ),
  };
});
jest.mock('@/components/ui', () => {
  const { View: MockView, Text: MockText } = jest.requireActual('react-native');
  return {
    Text: ({ children }: { children?: React.ReactNode }) => <MockText>{children}</MockText>,
    Card: ({ children }: { children?: React.ReactNode }) => <MockView>{children}</MockView>,
    ModalHeader: () => null,
  };
});

// A couple created moments ago: every counter at its floor, every nullable
// column still null (00030's longest_streak has never been written).
jest.mock('@/api/couples', () => ({
  useMyCouple: () => ({
    data: {
      streak_count: 0,
      created_at: '2026-07-04T09:00:00Z',
      longest_streak: 0,
      longest_streak_started_on: null,
      longest_streak_ended_on: null,
      grace_days_remaining: 1,
    },
  }),
  usePartnerProfile: () => ({ data: { full_name: 'Bexoni Doe' } }),
}));
jest.mock('@/api/profiles', () => ({
  useMyProfile: () => ({ data: { full_name: 'AJ Doe' } }),
}));
jest.mock('@/api/points', () => ({ usePointsTotal: () => ({ data: 0 }) }));
jest.mock('@/api/dates', () => ({ useCoupleDates: () => ({ data: [] }) }));
jest.mock('@/api/activity', () => ({
  useActivityLog: () => ({ data: [] }),
  useActivityStats: () => ({ data: [] }),
  useActivityDailyCounts: () => ({ data: [] }),
}));

import UsHubModal from '../../app/modal/us-hub';

describe('first run — Us hub with a zero-data couple', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 4, 12));
  });
  afterAll(() => jest.useRealTimers());

  it('renders without crashing when every collection is empty', () => {
    // The H2 Map/cache crash proved that an empty/odd shape takes down the
    // whole tree via the root ErrorBoundary — an empty couple must not.
    expect(() => render(<UsHubModal />)).not.toThrow();
  });

  it('shows a 0 streak that NAMES its anchor, not a bare zero', () => {
    const { getByText } = render(<UsHubModal />);
    expect(getByText('0')).toBeTruthy();
    // Without this label a 0 reads as "the app forgot us" (owner feedback,
    // 2026-07-05) rather than "you haven't done today's devotional yet".
    expect(getByText('day devotional streak')).toBeTruthy();
  });

  it('hides the best-streak line entirely rather than showing "Best streak: 0"', () => {
    const { queryByText } = render(<UsHubModal />);
    expect(queryByText(/Best streak/)).toBeNull();
  });

  it('shows 0 points without breaking the rewards copy', () => {
    const { getByText } = render(<UsHubModal />);
    expect(getByText('0 points')).toBeTruthy();
    expect(getByText('Earned together — exciting rewards are on the way')).toBeTruthy();
  });

  it('renders an empty heatmap with its prompt, no NaN or Invalid Date', () => {
    const { getByText, queryByText } = render(<UsHubModal />);
    expect(getByText('last 30 days — darker means more together')).toBeTruthy();
    expect(getByText('tap a day for details')).toBeTruthy();
    expect(queryByText(/NaN|Invalid Date/)).toBeNull();
  });

  it('shows every per-activity streak as "0 days" — pluralised correctly', () => {
    const { getAllByText, queryByText } = render(<UsHubModal />);
    expect(getAllByText('0 days')).toHaveLength(3);
    // No stats rows yet, so no "best N · last …" labels should appear.
    expect(queryByText(/best \d/)).toBeNull();
  });

  it('says "together since today" on day one, never "0 days"', () => {
    const { getByText } = render(<UsHubModal />);
    expect(getByText('AJ & Bexoni · together since today')).toBeTruthy();
  });

  it('shows the badges locked rather than omitting the section', () => {
    // Locked badges are the point: they tell a new couple what's ahead. An
    // empty space would just look unfinished.
    const { getByText } = render(<UsHubModal />);
    expect(getByText('7-day streak')).toBeTruthy();
    expect(getByText('30-day streak')).toBeTruthy();
    expect(getByText('First prayer session')).toBeTruthy();
  });
});
