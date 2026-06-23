import { create } from 'zustand';
import type { Theme } from '@/types';

interface SettingsState {
  theme: Theme;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  setTheme: (t: Theme) => void;
  toggleSound: () => void;
  setSound: (v: boolean) => void;
  setNotifications: (v: boolean) => void;
  hydrate: (partial: Partial<Pick<SettingsState, 'theme' | 'soundEnabled' | 'notificationsEnabled'>>) => void;
}

const THEME_KEY = 'devlingo_theme';
const SOUND_KEY = 'devlingo_sound';
const NOTIF_KEY = 'devlingo_notif';

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark', 'theme-terminal', 'dark');
  root.classList.add(`theme-${theme}`);
  if (theme === 'dark' || theme === 'terminal') root.classList.add('dark');
}

const initialTheme = (localStorage.getItem(THEME_KEY) as Theme) || 'light';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: initialTheme,
  soundEnabled: localStorage.getItem(SOUND_KEY) !== '0',
  notificationsEnabled: localStorage.getItem(NOTIF_KEY) === '1',

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
  toggleSound: () => {
    const v = !get().soundEnabled;
    localStorage.setItem(SOUND_KEY, v ? '1' : '0');
    set({ soundEnabled: v });
  },
  setSound: (v) => {
    localStorage.setItem(SOUND_KEY, v ? '1' : '0');
    set({ soundEnabled: v });
  },
  setNotifications: (v) => {
    localStorage.setItem(NOTIF_KEY, v ? '1' : '0');
    set({ notificationsEnabled: v });
  },
  hydrate: (partial) => {
    if (partial.theme) {
      localStorage.setItem(THEME_KEY, partial.theme);
      applyTheme(partial.theme);
    }
    set(partial);
  },
}));

// Aplica o tema salvo imediatamente no carregamento.
applyTheme(initialTheme);
