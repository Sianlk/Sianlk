// Sentry Configuration — Sianlk
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const IS_PROD = process.env.NODE_ENV === 'production';

export function initSentry(): void {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
    environment: IS_PROD ? 'production' : 'development',
    release: `sianlk@${Constants.expoConfig?.version ?? '1.1.0'}`,
    dist: Constants.expoConfig?.android?.versionCode?.toString() ?? '2',

    // Performance monitoring
    tracesSampleRate: IS_PROD ? 0.2 : 1.0,
    profilesSampleRate: IS_PROD ? 0.1 : 1.0,

    // Session replay (mobile)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Integrations
    integrations: [
      Sentry.mobileReplayIntegration({
        maskAllImages: false,
        maskAllVectors: false,
      }),
    ],

    // Filtering
    beforeSend(event) {
      // Strip PII
      if (event.user) {
        delete event.user.ip_address;
        if (event.user.email) {
          event.user.email = event.user.email.replace(/(?<=.).(?=[^@]*?@)/g, '*');
        }
      }
      return event;
    },

    // AI-specific breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'fetch' && breadcrumb.data?.url?.includes('/api/ai/')) {
        breadcrumb.data.ai_request = true;
      }
      return breadcrumb;
    },
  });
}

export function captureAIError(error: Error, context: Record<string, string> = {}): void {
  Sentry.withScope((scope) => {
    scope.setTag('ai_error', 'true');
    scope.setTag('domain', 'platform');
    scope.setContext('ai', context);
    Sentry.captureException(error);
  });
}

export { Sentry };
