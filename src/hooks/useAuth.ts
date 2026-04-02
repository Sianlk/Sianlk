import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginParams   { email: string; password: string; }
export interface LoginResult   { success: boolean; requiresMFA?: boolean; error?: string; }
export interface RegisterParams { name: string; email: string; password: string; }

export function useAuth() {
  const { user, isLoading, setUser, setLoading, logout: storeLogout } = useAuthStore();

  const login = useCallback(async (params: LoginParams): Promise<LoginResult> => {
    setLoading(true);
    try {
      const form = new URLSearchParams();
      form.append('username', params.email);
      form.append('password', params.password);
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL ?? ''}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      if (res.status === 428) return { success: false, requiresMFA: true };
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        return { success: false, error: (e as any).detail ?? 'Login failed' };
      }
      const data = await res.json();
      await AsyncStorage.multiSet([
        ['access_token',  data.access_token],
        ['refresh_token', data.refresh_token],
      ]);
      const me = await api.get<{ id: string; email: string; role: string; subscription_tier: string }>('/api/v1/users/me');
      setUser(me);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser]);

  const register = useCallback(async (params: RegisterParams): Promise<LoginResult> => {
    setLoading(true);
    try {
      await api.post('/api/v1/auth/register', params, false);
      return await login({ email: params.email, password: params.password });
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message };
    }
  }, [login, setLoading]);

  const logout = useCallback(async () => {
    try { await api.post('/api/v1/auth/logout', {}); } catch {}
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    storeLogout();
  }, [storeLogout]);

  const submitMFA = useCallback(async (email: string, password: string, code: string): Promise<LoginResult> => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL ?? ''}/api/v1/auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, totp_code: code }),
      });
      if (!res.ok) return { success: false, error: 'Invalid code' };
      const data = await res.json();
      await AsyncStorage.multiSet([['access_token', data.access_token], ['refresh_token', data.refresh_token]]);
      const me = await api.get<any>('/api/v1/users/me');
      setUser(me);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser]);

  return { user, isLoading, login, register, logout, submitMFA };
}
