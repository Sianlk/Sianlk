/**
 * Push notification registration for FCM (Android) and APNs (iOS).
 * Call initPushNotifications() on app mount after requesting permission.
 */
import {Platform, Alert} from 'react-native';

interface PushConfig {
  apiBaseUrl: string;
  accessToken: string;
}

export async function initPushNotifications(config: PushConfig): Promise<void> {
  try {
    // In a real app, use @react-native-firebase/messaging or Expo Notifications
    // This sets up the registration flow structure
    const token = await getPushToken();
    if (!token) return;

    await registerTokenWithServer(token, config);
  } catch (err) {
    console.warn("Push notification init failed:", err);
  }
}

async function getPushToken(): Promise<string | null> {
  // Placeholder: replace with @react-native-firebase/messaging or expo-notifications
  if (Platform.OS === "ios") {
    // Request APNs permission first
    // const authStatus = await messaging().requestPermission();
    // if (authStatus !== messaging.AuthorizationStatus.AUTHORIZED) return null;
    // return await messaging().getToken();
    console.log("iOS: request APNs permission and get FCM token here");
    return null;
  } else {
    // Android: FCM token available without permission
    // return await messaging().getToken();
    console.log("Android: get FCM token here");
    return null;
  }
}

async function registerTokenWithServer(token: string, config: PushConfig): Promise<void> {
  const platform = Platform.OS === "ios" ? "ios" : "android";
  await fetch(`${config.apiBaseUrl}/api/v1/notifications/push/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.accessToken}`,
    },
    body: JSON.stringify({token, platform}),
  });
}

export function formatNotificationTitle(type: string): string {
  const titles: Record<string, string> = {
    "appointment_reminder": "Appointment Reminder",
    "payment_success": "Payment Confirmed",
    "message": "New Message",
    "system": "Platform Update",
  };
  return titles[type] ?? "Notification";
}
