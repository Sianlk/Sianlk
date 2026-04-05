// Unified API Client — connects to Sianlk shared backend
// All 11 apps share one $5/mo DigitalOcean instance

const API_BASE =
  __DEV__
    ? "http://localhost:8000"
    : "https://sianlk.com";

export { API_BASE };

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-App-Slug": "sianlk",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `API ${res.status}`);
  }
  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `API ${res.status}`);
  }
  return res.json();
}

// Auth helpers
export const auth = {
  register: (email: string, password: string, fullName = "", appSlug = "sianlk") =>
    apiPost<{ access_token: string; user_id: string; plan: string }>(
      "/api/auth/register", { email, password, full_name: fullName, app_slug: appSlug }
    ),
  login: (email: string, password: string) => {
    const form = new URLSearchParams({ username: email, password });
    return apiFetch('/api/auth/token', {
      method: 'POST', body: form.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(r => r.json() as Promise<{ access_token: string; plan: string }>);
  },
  me: () => apiGet<{ id: string; email: string; plan: string; app_slug: string }>("/api/auth/me"),
};

// AI helpers
export const aiApi = {
  complete: (message: string, context?: Array<{ role: string; content: string }>) =>
    apiPost<{ content: string; model: string; duration_ms: number }>(
      "/api/ai/complete", { message, app_slug: "sianlk", context }
    ),
  agent: (task: string, agentType = "analyst") =>
    apiPost<{ result: string; agent_type: string }>(
      "/api/ai/agent", { task, app_slug: "sianlk", agent_type: agentType }
    ),
};

// Analytics
export const analyticsApi = {
  batch: (events: Array<{ event_name: string; properties?: Record<string, unknown> }>) =>
    apiFetch('/api/analytics/batch', {
      method: 'POST',
      body: JSON.stringify({
        events: events.map(e => ({ ...e, app_slug: "sianlk" }))
      }),
    }),
};

// Payments
export const paymentsApi = {
  plans: () => apiGet<{ plans: Array<{ id: string; name: string; price: number }> }>('/api/payments/plans'),
  checkout: (plan: string) =>
    apiPost<{ url: string }>("/api/payments/checkout", {
      plan, success_url: "https://sianlk.com/success", cancel_url: "https://sianlk.com/pricing"
    }),
};
