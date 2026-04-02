import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL as string) ?? '';

interface ApiOptions {
  method?: string;
  body?: object;
  auth?: boolean;
}

async function request<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = await AsyncStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    const refresh = await AsyncStorage.getItem('refresh_token');
    if (refresh) {
      const rr = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (rr.ok) {
        const data = await rr.json();
        await AsyncStorage.setItem('access_token', data.access_token);
        headers['Authorization'] = `Bearer ${data.access_token}`;
        const retry = await fetch(`${BASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
        if (!retry.ok) throw new Error(`${retry.status}`);
        return retry.json() as Promise<T>;
      }
    }
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).detail ?? String(res.status));
  }
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string, auth = true) => request<T>(path, { auth }),
  post:   <T>(path: string, body: object, auth = true) => request<T>(path, { method: 'POST', body, auth }),
  put:    <T>(path: string, body: object, auth = true) => request<T>(path, { method: 'PUT',  body, auth }),
  delete: <T>(path: string, auth = true) => request<T>(path, { method: 'DELETE', auth }),
};
