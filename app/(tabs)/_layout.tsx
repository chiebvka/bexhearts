import { type ComponentProps } from 'react';
import { Text as RNText } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingScreen } from '@/components/ui';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const INACTIVE = colors.neutral[400];
// Active (filled) tab color — primary purple (chosen 2026-06-26).
const ACTIVE = colors.primary[500];

function tabBarIcon(active: IoniconName, inactive: IoniconName, activeColor: string) {
  const Icon = ({ focused }: { focused: boolean }) => (
    <Ionicons
      name={focused ? active : inactive}
      size={24}
      color={focused ? activeColor : INACTIVE}
    />
  );
  Icon.displayName = 'TabBarIcon';
  return Icon;
}

function tabBarLabel(label: string, activeColor: string) {
  const Label = ({ focused }: { focused: boolean }) => (
    <RNText
      style={{
        fontFamily: fonts.sans.medium,
        fontSize: 11,
        color: focused ? activeColor : INACTIVE,
      }}
    >
      {label}
    </RNText>
  );
  Label.displayName = 'TabBarLabel';
  return Label;
}

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.neutral[200],
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: tabBarIcon('home', 'home-outline', ACTIVE),
          tabBarLabel: tabBarLabel('Home', ACTIVE),
        }}
      />
      <Tabs.Screen
        name="devotional"
        options={{
          title: 'Devotional',
          tabBarIcon: tabBarIcon('book', 'book-outline', ACTIVE),
          tabBarLabel: tabBarLabel('Devotional', ACTIVE),
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: 'Connect',
          tabBarIcon: tabBarIcon('heart', 'heart-outline', ACTIVE),
          tabBarLabel: tabBarLabel('Connect', ACTIVE),
        }}
      />
      <Tabs.Screen
        name="dates"
        options={{
          title: 'Dates',
          tabBarIcon: tabBarIcon('calendar', 'calendar-outline', ACTIVE),
          tabBarLabel: tabBarLabel('Dates', ACTIVE),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: tabBarIcon('person', 'person-outline', ACTIVE),
          tabBarLabel: tabBarLabel('Profile', ACTIVE),
        }}
      />
    </Tabs>
  );
}
