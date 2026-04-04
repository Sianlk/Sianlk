// Analytics Service — Sianlk
// Tracks user behaviour and AI usage metrics

import { Platform } from 'react-native';

type EventProperties = Record<string, string | number | boolean | null>;

interface AnalyticsEvent {
  name: string;
  properties?: EventProperties;
  timestamp?: number;
}

// Batched event queue for efficient sending
const eventQueue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

// Core track function
export function track(eventName: string, properties?: EventProperties): void {
  const event: AnalyticsEvent = {
    name: eventName,
    properties: {
      ...properties,
      platform: Platform.OS,
      app: 'Sianlk',
      domain: 'platform',
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  };

  eventQueue.push(event);

  // Flush every 30 events or after 5 seconds
  if (eventQueue.length >= 30) {
    flush();
  } else if (!flushTimer) {
    flushTimer = setTimeout(flush, 5000);
  }
}

async function flush(): Promise<void> {
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, eventQueue.length);

  try {
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/analytics/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
    });
  } catch {
    // Silently fail — analytics must never crash the app
  }
}

// Convenience methods
export const Analytics = {
  // Screen views
  screen: (screenName: string, props?: EventProperties) =>
    track('screen_view', { screen_name: screenName, ...props }),

  // AI interactions
  aiQuery: (query: string, domain: string, responseTime?: number) =>
    track('ai_query', { query: query.slice(0, 100), domain, response_time_ms: responseTime ?? 0 }),

  aiResponse: (success: boolean, model: string, tokens?: number) =>
    track('ai_response', { success, model, tokens: tokens ?? 0 }),

  agentTask: (taskType: string, success: boolean, duration?: number) =>
    track('agent_task', { task_type: taskType, success, duration_ms: duration ?? 0 }),

  // Auth
  login: (method: string) => track('login', { method }),
  logout: () => track('logout'),
  register: (method: string) => track('register', { method }),

  // Feature usage
  featureUsed: (featureName: string, props?: EventProperties) =>
    track('feature_used', { feature: featureName, ...props }),

  // Errors
  error: (errorCode: string, message: string, screen?: string) =>
    track('app_error', { error_code: errorCode, message: message.slice(0, 200), screen: screen ?? 'unknown' }),

  // Business
  conversion: (goal: string, value?: number) =>
    track('conversion', { goal, value: value ?? 0 }),
};

export default Analytics;
