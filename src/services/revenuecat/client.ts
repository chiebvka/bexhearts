import { Platform } from 'react-native';
import type { PurchasesOffering } from 'react-native-purchases';
import { ENTITLEMENTS } from '@/constants/entitlements';

export async function initRevenueCat(userId?: string) {
  const apiKey = Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!;

  if (!apiKey || apiKey.includes('xxxxxxxx')) {
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

export async function identifyUser(userId: string) {
  try {
    const { default: Purchases } = await import('react-native-purchases');
    await Purchases.logIn(userId);
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

export async function checkPremium(): Promise<boolean> {
  try {
    const { default: Purchases } = await import('react-native-purchases');
    const customerInfo = await Purchases.getCustomerInfo();
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
