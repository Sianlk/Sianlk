// app/_layout.tsx — Root layout
// Sianlk
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Splash from 'expo-splash-screen';
import { registerForPush, syncToken } from '../src/services/notifications';
import Analytics from '../src/services/analytics';

Splash.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    Splash.hideAsync();
    Analytics.screen('App Launch');
    registerForPush().then((t) => { if (t) syncToken(t); });
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
