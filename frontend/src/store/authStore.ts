import { create } from 'zustand';
import { api, setToken, clearToken, getToken } from '@/lib/api';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

type Status = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: Status;
  error: string | null;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  loadSession: () => Promise<void>;
  setUser: (user: User) => void;
  logout: () => void;
}

function applyAuth(res: AuthResponse): void {
  setToken(res.token);
  useProgressStore.getState().setProfile(res.profile);
  useSettingsStore.getState().hydrate({
    theme: res.profile.theme,
    soundEnabled: res.profile.sound_enabled,
    notificationsEnabled: res.profile.notifications_enabled,
  });
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,

  login: async (body) => {
    set({ status: 'loading', error: null });
    try {
      const res = await api.post<AuthResponse>('/auth/login', body, false);
      applyAuth(res);
      set({ user: res.user, status: 'authenticated' });
    } catch (e) {
      set({ status: 'unauthenticated', error: (e as Error).message });
      throw e;
    }
  },

  register: async (body) => {
    set({ status: 'loading', error: null });
    try {
      const res = await api.post<AuthResponse>('/auth/register', body, false);
      applyAuth(res);
      set({ user: res.user, status: 'authenticated' });
    } catch (e) {
      set({ status: 'unauthenticated', error: (e as Error).message });
      throw e;
    }
  },

  loadSession: async () => {
    if (!getToken()) {
      set({ status: 'unauthenticated' });
      return;
    }
    set({ status: 'loading' });
    try {
      const res = await api.get<{ user: User; profile: AuthResponse['profile'] }>('/auth/me');
      useProgressStore.getState().setProfile(res.profile);
      useSettingsStore.getState().hydrate({
        theme: res.profile.theme,
        soundEnabled: res.profile.sound_enabled,
        notificationsEnabled: res.profile.notifications_enabled,
      });
      set({ user: res.user, status: 'authenticated' });
    } catch {
      clearToken();
      set({ user: null, status: 'unauthenticated' });
    }
  },

  setUser: (user) => set({ user }),

  logout: () => {
    clearToken();
    useProgressStore.getState().clear();
    set({ user: null, status: 'unauthenticated' });
  },
}));
