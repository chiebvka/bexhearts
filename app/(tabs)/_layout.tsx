import { type ComponentProps } from 'react';
import { View, Text as RNText } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs, Redirect, useSegments } from 'expo-router';
import { useEntitlementAccess } from '@/features/subscription/hooks/useEntitlement';
import { useIsRestoring } from '@tanstack/react-query';
import { useMyProfile } from '@/api/profiles';
import { useCoupleStore } from '@/stores/couple.store';
import { resolveLandingRoute } from '@/features/auth/routeGate';
import { resolveAccess } from '@/features/subscription/access';
import { isRevenueCatConfigured } from '@/services/revenuecat/client';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleRealtime } from '@/api/couples';
import { useStampTimezone } from '@/hooks/useStampTimezone';
import { usePartnerLinkedAnalytics } from '@/hooks/usePartnerLinkedAnalytics';
import { LoadingScreen } from '@/components/ui';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { fonts } from '@/theme/typography';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const INACTIVE = colors.neutral[400];
// Active (filled) tab color — primary purple (chosen 2026-06-26).
const ACTIVE = colors.primary[500];

// Active tab = solid brand-purple filled icon dominating a snug light-purple
// chip (owner design 2026-07-04 — dark fill inside a soft halo, not a wide pill).
function tabBarIcon(active: IoniconName, inactive: IoniconName, activeColor: string) {
  const Icon = ({ focused }: { focused: boolean }) =>
    focused ? (
      <View style={styles.pill}>
        <Ionicons name={active} size={26} color={activeColor} />
      </View>
    ) : (
      <Ionicons name={inactive} size={24} color={INACTIVE} />
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
  const insets = useSafeAreaInsets();

  // Couple-wide realtime (devotional progress + couple/streak updates). No-ops
  // until a couple is in context; cleans up on sign-out.
  useCoupleRealtime();
  // E11 — keep profiles.timezone matched to the device (their-time clock).
  useStampTimezone();
  // Phase 7 — the inviter's partner_linked funnel step (once per install).
  usePartnerLinkedAnalytics();

  // Same decision the root gate makes, applied to every tab entry point.
  const isRestoring = useIsRestoring();
  const { data: profile, isLoading: profileLoading, isError } = useMyProfile();
  const coupleId = useCoupleStore((s) => s.coupleId);
  const landing = resolveLandingRoute({
    authLoading: isLoading,
    isAuthenticated,
    isRestoring,
    profileLoading,
    profileError: isError,
    profile,
    coupleId,
  });

  // F2 — app-wide entitlement gate. Segments let the Profile tab stay open
  // (restore / delete account) while the rest of the app requires the trial.
  const segments = useSegments();
  // RevenueCat OR the comp allowlist (00036) — see useEntitlementAccess.
  const { isEntitled, isLoading: entitlementLoading } = useEntitlementAccess();
  const access = resolveAccess({
    entitlementLoading,
    isEntitled,
    monetizationConfigured: isRevenueCatConfigured(),
    segments: segments as string[],
  });

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;
  // Onboarding is enforced HERE as well as at app/index.tsx (bug found
  // 2026-07-26): the root gate only runs when you land on "/", so a deep
  // link, a notification tap or a restored navigation state dropped a
  // brand-new account straight into the tabs with no name and no couple.
  if (landing === 'loading') return <LoadingScreen />;
  if (landing === 'onboarding') return <Redirect href="/(onboarding)/welcome" />;
  if (landing === 'partner-invite') {
    return <Redirect href="/(onboarding)/partner-invite" />;
  }
  // F2 — everything behind the trial (owner 2026-07-26). Profile stays open
  // below so Restore Purchases and account deletion remain reachable.
  if (access === 'loading') return <LoadingScreen />;
  if (access === 'paywall') {
    // placement=gate distinguishes "trial lapsed, blocked mid-app" from the
    // onboarding price reveal in the funnel — same screen, different story.
    return <Redirect href="/(onboarding)/paywall?placement=gate" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.neutral[200],
          // The default bar allots a ~25px icon slot, which CLIPS the active
          // pill (icon 26 + padding = 34 tall) to a sliver. Give the bar and
          // the icon slot explicit room instead.
          height: 62 + insets.bottom,
          paddingTop: 6,
        },
        tabBarIconStyle: {
          width: 56,
          height: 34,
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
          title: 'Grow',
          tabBarIcon: tabBarIcon('leaf', 'leaf-outline', ACTIVE),
          tabBarLabel: tabBarLabel('Grow', ACTIVE),
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
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: tabBarIcon('journal', 'journal-outline', ACTIVE),
          tabBarLabel: tabBarLabel('Journal', ACTIVE),
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
      {/* Dates is reachable from Home quick actions, not a bottom tab (IA restructure 2026-06-29). */}
    </Tabs>
  );
}

const styles = themedStyles(() => ({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: colors.primary[100],
  },
}));
