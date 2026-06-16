import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

let isConnected = true;

// Subscribe to network changes at module level
NetInfo.addEventListener((state: NetInfoState) => {
  isConnected = state.isConnected ?? true;
});

export function getIsConnected(): boolean {
  return isConnected;
}

export async function checkConnection(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? true;
}
