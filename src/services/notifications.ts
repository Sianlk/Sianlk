// Push Notifications Service — Sianlk
// Handles Expo push notifications with permission management

import * as ExpoNotifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushToken {
  token: string;
  type: 'expo' | 'apns' | 'fcm';
}

// Register device and get push token
export async function registerForPushNotifications(): Promise<PushToken | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await ExpoNotifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission denied');
    return null;
  }

  if (Platform.OS === 'android') {
    await ExpoNotifications.setNotificationChannelAsync('default', {
      name: 'Sianlk',
      importance: ExpoNotifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1D4ED8',
    });

    await ExpoNotifications.setNotificationChannelAsync('ai-alerts', {
      name: 'AI Alerts',
      description: 'AI-generated insights and alerts',
      importance: ExpoNotifications.AndroidImportance.HIGH,
      lightColor: '#3B82F6',
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await ExpoNotifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );

  return { token: token.data, type: 'expo' };
}

// Register token with backend
export async function syncPushToken(token: PushToken): Promise<void> {
  try {
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/push-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token),
    });
  } catch (e) {
    console.warn('Failed to sync push token:', e);
  }
}

// Schedule local notification
export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger?: ExpoNotifications.NotificationTriggerInput,
  data?: Record<string, string>
): Promise<string> {
  return ExpoNotifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: true,
      badge: 1,
    },
    trigger: trigger ?? null,
  });
}

// AI notification — for background AI results
export async function notifyAIResult(
  headline: string,
  summary: string,
  data?: Record<string, string>
): Promise<string> {
  return scheduleLocalNotification(
    `${headline}`,
    summary,
    null,
    { type: 'ai_result', app: 'Sianlk', ...data }
  );
}

// Add notification listeners
export function addNotificationListeners(
  onReceive: (n: ExpoNotifications.Notification) => void,
  onResponse: (r: ExpoNotifications.NotificationResponse) => void
) {
  const recv = ExpoNotifications.addNotificationReceivedListener(onReceive);
  const resp = ExpoNotifications.addNotificationResponseReceivedListener(onResponse);
  return () => { recv.remove(); resp.remove(); };
}

export default {
  registerForPushNotifications,
  syncPushToken,
  scheduleLocalNotification,
  notifyAIResult,
  addNotificationListeners,
};
