// app/_layout.tsx — Root layout
// Sianlk
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { registerForPushNotifications, syncPushToken } from '../src/services/notifications';
import Analytics from '../src/services/analytics';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    Analytics.screen('App Launch');

    // Register push notifications
    registerForPushNotifications().then((token) => {
      if (token) syncPushToken(token);
    });
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
