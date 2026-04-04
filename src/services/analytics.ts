// Analytics Service — Sianlk
import { Platform } from 'react-native';

type EventProperties = Record<string, string | number | boolean | null>;

const queue: Array<{name:string; props:EventProperties; ts:number}> = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export function track(name: string, props?: EventProperties): void {
  queue.push({ name, props: { ...props, platform: Platform.OS, app: 'Sianlk', domain: 'platform', ts: Date.now() }, ts: Date.now() });
  if (queue.length >= 30) flush();
  else if (!timer) timer = setTimeout(flush, 5000);
}

async function flush(): Promise<void> {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!queue.length) return;
  const batch = queue.splice(0);
  try {
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/analytics/batch`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ events: batch }),
    });
  } catch {}
}

export const Analytics = {
  screen: (name: string, p?: EventProperties) => track('screen_view', { screen_name: name, ...p }),
  aiQuery: (q: string, domain: string, ms?: number) => track('ai_query', { query: q.slice(0,100), domain, ms: ms??0 }),
  aiResponse: (ok: boolean, model: string, tokens?: number) => track('ai_response', { ok, model, tokens: tokens??0 }),
  agentTask: (type: string, ok: boolean, ms?: number) => track('agent_task', { type, ok, ms: ms??0 }),
  login: (method: string) => track('login', { method }),
  logout: () => track('logout'),
  featureUsed: (f: string, p?: EventProperties) => track('feature_used', { feature: f, ...p }),
  error: (code: string, msg: string, screen?: string) => track('app_error', { code, msg: msg.slice(0,200), screen: screen??'' }),
};

export default Analytics;
