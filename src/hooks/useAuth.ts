/**
 * Sianlk - useAuth Hook
 */
import {useState, useCallback} from 'react';
import {useAuthStore} from '../store/authStore';

const API_BASE = `https://api.sianlk.sianlk.com/api/v1`;

interface LoginPayload    { email: string; password: string; }
interface RegisterPayload { email: string; password: string; name: string; }
interface AuthResult      { success: boolean; error?: string; requiresMFA?: boolean; }

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const {setTokens, setUser, logout, accessToken} = useAuthStore();

  const fetchCurrentUser = async (token: string) => {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    if (res.ok) setUser(await res.json());
  };

  const login = useCallback(async (p: LoginPayload): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({username: p.email, password: p.password}).toString(),
      });
      const data = await res.json();
      if (!res.ok) return {success: false, error: data.detail ?? 'Login failed'};
      if (data.mfa_required) return {success: false, requiresMFA: true};
      setTokens(data.access_token, data.refresh_token);
      await fetchCurrentUser(data.access_token);
      return {success: true};
    } catch (e: any) { return {success: false, error: e.message}; }
    finally { setIsLoading(false); }
  }, [setTokens]);

  const register = useCallback(async (p: RegisterPayload): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (!res.ok) return {success: false, error: data.detail ?? 'Registration failed'};
      setTokens(data.access_token, data.refresh_token);
      await fetchCurrentUser(data.access_token);
      return {success: true};
    } catch (e: any) { return {success: false, error: e.message}; }
    finally { setIsLoading(false); }
  }, [setTokens]);

  const verifyMFA = useCallback(async (token: string, tempToken: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/verify`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token, temp_token: tempToken}),
      });
      const data = await res.json();
      if (!res.ok) return {success: false, error: data.detail ?? 'MFA verification failed'};
      setTokens(data.access_token, data.refresh_token);
      await fetchCurrentUser(data.access_token);
      return {success: true};
    } catch (e: any) { return {success: false, error: e.message}; }
    finally { setIsLoading(false); }
  }, [setTokens]);

  return {login, register, verifyMFA, logout, isLoading, accessToken};
}
