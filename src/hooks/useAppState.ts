import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useAppState(onChange?: (status: AppStateStatus) => void) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      onChange?.(nextState);
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [onChange]);

  return appState;
}

export function useOnAppForeground(callback: () => void) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        callback();
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [callback]);
}
