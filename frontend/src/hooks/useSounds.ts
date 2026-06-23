import { useCallback } from 'react';
import { sfx, type SfxName } from '@/lib/sounds';
import { useSettingsStore } from '@/store/settingsStore';

export function useSounds() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  const play = useCallback(
    (name: SfxName) => {
      if (soundEnabled) sfx[name]();
    },
    [soundEnabled],
  );

  return { play };
}
