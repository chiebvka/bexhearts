import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { INVITE_LINK_PREFIX, APP_NAME } from '@/constants/app';
import { formatInviteCode } from '@/utils/invite-code';

export function getInviteLink(code: string): string {
  return `${INVITE_LINK_PREFIX}${code}`;
}

export async function shareInviteCode(code: string): Promise<boolean> {
  const link = getInviteLink(code);
  const formattedCode = formatInviteCode(code);

  try {
    const result = await Share.share({
      message: Platform.select({
        ios: `Join me on ${APP_NAME}! Use my invite code: ${formattedCode}\n\n${link}`,
        default: `Join me on ${APP_NAME}! Use my invite code: ${formattedCode}\n\n${link}`,
      }),
      title: `${APP_NAME} Partner Invite`,
    });

    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}
