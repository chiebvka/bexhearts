import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { hide: jest.fn(), show: jest.fn() },
}));

import Toast from 'react-native-toast-message';
import { ToastCard, toastConfig } from '@/components/ui/AppToast';

describe('AppToast (owner ask 2026-07-19: popups get an ✕)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the message and a dismiss button', () => {
    const { getByText, getByLabelText } = render(
      <ToastCard type="success" text1="Note saved ❤️" text2="Your partner can see it now." />
    );
    expect(getByText('Note saved ❤️')).toBeTruthy();
    expect(getByText('Your partner can see it now.')).toBeTruthy();
    expect(getByLabelText('Dismiss notification')).toBeTruthy();
  });

  it('tapping ✕ hides the toast immediately', () => {
    const { getByLabelText } = render(<ToastCard type="info" text1="Hello" />);
    fireEvent.press(getByLabelText('Dismiss notification'));
    expect(Toast.hide).toHaveBeenCalled();
  });

  it('provides a config entry for every toast type the app fires', () => {
    // ui.store.showToast uses these exact type keys.
    for (const type of ['success', 'error', 'info'] as const) {
      expect(typeof toastConfig[type]).toBe('function');
    }
  });
});
