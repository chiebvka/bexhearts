import { Platform } from 'react-native';
import type { PurchasesOffering } from 'react-native-purchases';
import { ENTITLEMENTS } from '@/constants/entitlements';
import { isExpoGo } from '@/lib/runtime';

export async function initRevenueCat(userId?: string) {
  const apiKey = Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!;

  if (isExpoGo || !apiKey || apiKey.includes('xxxxxxxx')) {
    if (__DEV__) {
      console.warn('RevenueCat key is not configured; skipping RevenueCat initialization.');
    }
    return;
  }

  const { default: Purchases, LOG_LEVEL } = await import('react-native-purchases');
  Purchases.configure({ apiKey, appUserID: userId });

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
}

// F2 — the subscription is billed PER COUPLE ("one plan, two hearts"), so the
// RevenueCat app-user id is the COUPLE id, not the user id: both partners'
// devices resolve to the same RevenueCat customer, and a purchase by either
// one entitles both. Solo users (pre-link) fall back to their own id, and
// `identifyCouple` is called again on linking so the entitlement follows them
// into the couple.
export function revenueCatAppUserId(userId: string, coupleId: string | null): string {
  return coupleId ? `couple_${coupleId}` : userId;
}

export async function identifyUser(userId: string, coupleId: string | null = null) {
  try {
    const { default: Purchases } = await import('react-native-purchases');
    await Purchases.logIn(revenueCatAppUserId(userId, coupleId));
  } catch {
    // RevenueCat may be intentionally unconfigured in local development.
  }
}

// Detach the current user from RevenueCat (sign-out / account deletion). Resets
// to an anonymous app user so the next user on the device doesn't inherit
// entitlements. Best-effort: no-ops when RevenueCat isn't configured.
export async function logOutRevenueCat() {
  try {
    const { default: Purchases } = await import('react-native-purchases');
    await Purchases.logOut();
  } catch {
    // Not configured (dev) or already anonymous — nothing to do.
  }
}

// Whether RevenueCat has a real API key (i.e. monetization is live). When it's
// not configured (local dev), the paywall/gating no-op so testing isn't blocked.
export function isRevenueCatConfigured(): boolean {
  // Expo Go can't load the native module, so even with a real key the app
  // must behave as unconfigured there (dev-unlocked gating, paywall passes
  // through). The dev build is where purchases are real.
  if (isExpoGo) return false;
  const apiKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  return !!apiKey && !apiKey.includes('xxxxxxxx');
}

export async function checkPremium(): Promise<boolean> {
  // Unconfigured = local dev: treat as entitled so premium features are testable
  // (in production the key is real and this reflects the true subscription).
  if (!isRevenueCatConfigured()) return __DEV__;
  try {
    const { default: Purchases } = await import('react-native-purchases');
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !== undefined;
  } catch {
    return false;
  }
}

// Start the trial by purchasing the selected plan's package from the current
// offering. The store sheet commits the user to the subscription NOW (payment
// method on their Apple/Google account is required and on file), charges $0
// today via the 3-day free-trial intro offer, then auto-bills at trial end
// unless cancelled — the "card up front, billed after the window" mechanism
// (owner-confirmed 2026-07-11; it's also the only mechanism the stores allow).
// Returns false on cancel/error. No-ops (false) when unconfigured — callers
// should check isRevenueCatConfigured() to decide whether to proceed.
export async function purchaseTrial(
  planId: 'annual' | 'monthly' | 'weekly'
): Promise<boolean> {
  if (!isRevenueCatConfigured()) return false;
  try {
    const { default: Purchases } = await import('react-native-purchases');
    const offering = (await Purchases.getOfferings()).current;
    if (!offering) return false;
    const pkg =
      planId === 'annual'
        ? offering.annual
        : planId === 'monthly'
          ? offering.monthly
          : offering.weekly;
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !== undefined;
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const { default: Purchases } = await import('react-native-purchases');
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const { default: Purchases } = await import('react-native-purchases');
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !== undefined;
  } catch {
    return false;
  }
}
