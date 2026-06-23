import { create } from 'zustand';
import type { CompleteLessonResponse, UserProfile } from '@/types';

interface ProgressState {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  applyComplete: (r: CompleteLessonResponse) => void;
  spendGems: (amount: number) => void;
  clear: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  applyComplete: (r) => set({ profile: r.profile }),
  spendGems: (amount) =>
    set((s) => (s.profile ? { profile: { ...s.profile, gems: s.profile.gems - amount } } : s)),
  clear: () => set({ profile: null }),
}));
