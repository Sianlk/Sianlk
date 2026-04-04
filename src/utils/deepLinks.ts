// Deep Link Configuration — Sianlk
// Universal Links (iOS) + App Links (Android)

import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import Analytics from '../services/analytics';

const BASE_URL = 'https://sianlk.sianlk.com';

export const LINK_SCHEMES = [
  `${BASE_URL}`,
  `sianlk://sianlk`,
];

export interface DeepLinkRoute {
  pattern: string;
  screen: string;
  params?: Record<string, string>;
}

export const DEEP_LINK_ROUTES: DeepLinkRoute[] = [
  { pattern: '/',                    screen: '/(tabs)/' },
  { pattern: '/login',               screen: '/(auth)/login' },
  { pattern: '/ai',                  screen: '/(tabs)/ai' },
  { pattern: '/profile',             screen: '/(tabs)/profile' },
  { pattern: '/explore',             screen: '/(tabs)/explore' },
  { pattern: '/onboarding',          screen: '/onboarding' },
  { pattern: '/reset-password',      screen: '/(auth)/reset-password' },
  { pattern: '/upgrade',             screen: '/paywall' },
  { pattern: '/share/:id',           screen: '/(tabs)/ai' },
];

export function createShareLink(type: string, id: string): string {
  return `${BASE_URL}/share/${id}?type=${type}&app=sianlk`;
}

export function createDeepLink(path: string): string {
  return Linking.createURL(path);
}

export function handleDeepLink(url: string): void {
  const parsed = Linking.parse(url);
  Analytics.track('deep_link_opened', {
    url: url.substring(0, 100),
    path: parsed.path ?? '',
    scheme: parsed.scheme ?? '',
  });

  const path = parsed.path ?? '/';
  const matchedRoute = DEEP_LINK_ROUTES.find(r =>
    path === r.pattern || path.startsWith(r.pattern.split(':')[0])
  );

  if (matchedRoute) {
    router.push(matchedRoute.screen as any);
  } else {
    router.push('/(tabs)/');
  }
}

export function useDeepLinks() {
  return {
    subscribe: () => Linking.addEventListener('url', ({ url }) => handleDeepLink(url)),
    getInitialURL: () => Linking.getInitialURL(),
  };
}

export default { createShareLink, createDeepLink, handleDeepLink, useDeepLinks };
