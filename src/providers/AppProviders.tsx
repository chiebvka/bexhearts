import { type PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { NotificationProvider } from './NotificationProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <AuthProvider>
          <NotificationProvider>
            <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
          </NotificationProvider>
        </AuthProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
