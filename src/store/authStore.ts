/**
 * Sianlk - Zustand Auth Store
 */
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';

const storage = new MMKV({id: 'sianlk-auth'});

const mmkvStorage = {
  getItem:    (key: string) => storage.getString(key) ?? null,
  setItem:    (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'provider';
  avatarUrl?: string;
  mfaEnabled: boolean;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
}

interface AuthState {
  accessToken:   string | null;
  refreshToken:  string | null;
  user:          User | null;
  isLoading:     boolean;
  setTokens:     (access: string, refresh: string) => void;
  setUser:       (user: User) => void;
  bootstrapAuth: () => Promise<void>;
  logout:        () => void;
}

const API_BASE = 'https://api.sianlk.sianlk.com/api/v1';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken:  null,
      refreshToken: null,
      user:         null,
      isLoading:    false,
      setTokens: (access, refresh) => set({accessToken: access, refreshToken: refresh}),
      setUser:   (user) => set({user}),
      logout:    () => set({accessToken: null, refreshToken: null, user: null}),
      bootstrapAuth: async () => {
        set({isLoading: true});
        try {
          const {refreshToken, accessToken} = get();
          if (!refreshToken) return;
          const res = await fetch(`${API_BASE}/health`, {
            headers: {Authorization: `Bearer ${accessToken}`},
          });
          if (res.ok) return;
          const r = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({refresh_token: refreshToken}),
          });
          if (r.ok) {
            const data = await r.json();
            set({accessToken: data.access_token, refreshToken: data.refresh_token});
          } else {
            set({accessToken: null, refreshToken: null, user: null});
          }
        } catch { set({accessToken: null, refreshToken: null, user: null}); }
        finally  { set({isLoading: false}); }
      },
    }),
    {
      name:    'sianlk-auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        user:         state.user,
      }),
    }
  )
);
