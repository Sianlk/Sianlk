import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppUser {
  id: string;
  email: string;
  role: string;
  subscription_tier: string;
}

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      isLoading:   false,
      isHydrated:  false,
      setUser:     (user) => set({ user }),
      setLoading:  (v)    => set({ isLoading: v }),
      setHydrated: (v)    => set({ isHydrated: v }),
      logout:      ()     => set({ user: null }),
    }),
    {
      name:    'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
