import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text as RNText } from 'react-native';

// E10 interaction coverage: heatmap filters, tap-a-day tooltip, hero record
// line, per-activity best/last labels. The pure math lives in
// __tests__/features/activity.test.ts — this pins the wiring.

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

const mockDailyCounts = jest.fn();
jest.mock('@/api/couples', () => ({
  useMyCouple: () => ({
    data: {
      streak_count: 0,
      created_at: '2026-07-01T00:00:00Z',
      longest_streak: 12,
      longest_streak_started_on: '2026-06-03',
      longest_streak_ended_on: '2026-06-14',
    },
  }),
  usePartnerProfile: () => ({ data: { full_name: 'Bexoni Doe' } }),
}));
jest.mock('@/api/profiles', () => ({
  useMyProfile: () => ({ data: { full_name: 'AJ Doe' } }),
}));
jest.mock('@/api/points', () => ({ usePointsTotal: () => ({ data: 195 }) }));
// E13 — the hub reads completed dates for the Passport badge.
jest.mock('@/api/dates', () => ({ useCoupleDates: () => ({ data: [] }) }));
jest.mock('@/api/activity', () => ({
  useActivityLog: () => ({
    data: [
      { activity_type: 'devotional', activity_date: '2026-07-02', user_id: 'u1' },
      { activity_type: 'devotional', activity_date: '2026-07-04', user_id: 'u1' },
      { activity_type: 'prayer_session', activity_date: '2026-07-04', user_id: 'u2' },
    ],
  }),
  useActivityStats: () => ({
    data: [
      { activity_type: 'devotional', best_streak: 14, last_done: '2026-07-04' },
      { activity_type: 'prayer_session', best_streak: 4, last_done: '2026-06-12' },
    ],
  }),
  useActivityDailyCounts: (enabled: boolean) => {
    mockDailyCounts(enabled);
    return {
      data: enabled
        ? [
            { activity_date: '2026-04-01', activity_count: 2 },
            { activity_date: '2026-07-04', activity_count: 2 },
          ]
        : undefined,
    };
  },
}));

import UsHubModal from '../../app/modal/us-hub';

describe('Us hub — E10 streak breakdown v2', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 4, 12)); // Sat Jul 4 2026, noon local
  });
  afterAll(() => jest.useRealTimers());
  beforeEach(() => mockDailyCounts.mockClear());

  it('relabels the hero as the devotional streak and shows the record line', () => {
    const { getByText } = render(<UsHubModal />);
    expect(getByText('day devotional streak')).toBeTruthy();
    expect(getByText('Best streak: 12 days · Jun 3 – Jun 14')).toBeTruthy();
  });

  it('shows all-time best + last-done under each per-activity streak', () => {
    const { getByText } = render(<UsHubModal />);
    expect(getByText('best 14 · last today')).toBeTruthy();
    expect(getByText('best 4 · last Jun 12')).toBeTruthy();
  });

  it('tapping a day reveals its date + count detail', () => {
    const { getByLabelText, getByText, queryByText } = render(<UsHubModal />);
    expect(getByText('tap a day for details')).toBeTruthy();
    fireEvent.press(getByLabelText('Jul 2 · 1 activity'));
    expect(getByText('Jul 2 · 1 activity')).toBeTruthy();
    expect(queryByText('tap a day for details')).toBeNull();
  });

  it('defaults to 30d and only fetches the all-time counts on All', () => {
    const { getByText, getByLabelText } = render(<UsHubModal />);
    expect(getByText('last 30 days — darker means more together')).toBeTruthy();
    expect(mockDailyCounts).toHaveBeenLastCalledWith(false);

    fireEvent.press(getByText('All'));
    expect(getByText('since your first day — darker means more together')).toBeTruthy();
    expect(mockDailyCounts).toHaveBeenLastCalledWith(true);
    // The grid now stretches back to the server-reported earliest day.
    expect(getByLabelText('Apr 1 · 2 activities')).toBeTruthy();
  });

  it('7d shows one large row and switching filters clears the selection', () => {
    const { getByText, getByLabelText, queryByText } = render(<UsHubModal />);
    fireEvent.press(getByLabelText('Jul 2 · 1 activity'));
    expect(getByText('Jul 2 · 1 activity')).toBeTruthy();

    fireEvent.press(getByText('7d'));
    expect(getByText('last 7 days — darker means more together')).toBeTruthy();
    expect(getByText('tap a day for details')).toBeTruthy(); // selection cleared
    // Weekday letters render under the 7 large cells (Sat Jul 4 = "S").
    fireEvent.press(getByLabelText('Jul 4 · 2 activities'));
    expect(queryByText('tap a day for details')).toBeNull();
    expect(getByText('Jul 4 · 2 activities')).toBeTruthy();
  });
});
