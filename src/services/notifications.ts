// Push Notifications — Sianlk
import * as N from 'expo-notifications';
import { Platform } from 'react-native';

N.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert:true, shouldPlaySound:true, shouldSetBadge:true }),
});

export async function registerForPush(): Promise<string|null> {
  const { status: existing } = await N.getPermissionsAsync();
  const { status } = existing !== 'granted' ? await N.requestPermissionsAsync() : { status: existing };
  if (status !== 'granted') return null;

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('default', {
      name: 'Sianlk', importance: N.AndroidImportance.MAX,
      vibrationPattern: [0,250,250,250], lightColor: '#1D4ED8',
    });
  }

  const token = await N.getExpoPushTokenAsync();
  return token.data;
}

export async function syncToken(token: string): Promise<void> {
  try {
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/push-token`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ token, type: 'expo', app: 'Sianlk' }),
    });
  } catch (e) { console.warn('Push token sync failed:', e); }
}

export async function scheduleNotification(title: string, body: string, data?: Record<string,string>): Promise<string> {
  return N.scheduleNotificationAsync({ content: { title, body, data:data??{}, sound:true }, trigger: null });
}

export async function notifyAIResult(headline: string, summary: string): Promise<string> {
  return scheduleNotification(headline, summary, { type: 'ai', app: 'Sianlk' });
}

export function addListeners(
  onReceive: (n: N.Notification) => void,
  onResponse: (r: N.NotificationResponse) => void
) {
  const a = N.addNotificationReceivedListener(onReceive);
  const b = N.addNotificationResponseReceivedListener(onResponse);
  return () => { a.remove(); b.remove(); };
}

export default { registerForPush, syncToken, scheduleNotification, notifyAIResult, addListeners };
