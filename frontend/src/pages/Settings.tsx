import { Sun, Moon, Terminal, Volume2, VolumeX, Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useSettingsStore } from '@/store/settingsStore';
import { useProgressStore } from '@/store/progressStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AGE_GROUPS, DAILY_GOALS, type AgeGroup, type Theme, type UserProfile } from '@/types';

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'terminal', label: 'Terminal', icon: Terminal },
];

export function Settings() {
  const { theme, setTheme, soundEnabled, setSound, notificationsEnabled, setNotifications } = useSettingsStore();
  const profile = useProgressStore((s) => s.profile);
  const setProfile = useProgressStore((s) => s.setProfile);

  async function save(patch: Record<string, unknown>) {
    try {
      const updated = await api.put<UserProfile>('/settings', patch);
      setProfile(updated);
    } catch { /* mantém otimista */ }
  }

  function changeTheme(t: Theme) {
    setTheme(t);
    void save({ theme: t });
  }
  function toggleSound() {
    setSound(!soundEnabled);
    void save({ sound_enabled: !soundEnabled });
  }
  async function toggleNotifications() {
    const next = !notificationsEnabled;
    if (next && 'Notification' in window) {
      await Notification.requestPermission();
    }
    setNotifications(next);
    void save({ notifications_enabled: next });
  }
  function changeGoal(g: number) {
    void save({ daily_goal_xp: g });
  }
  function changeAge(a: AgeGroup) {
    void save({ age_group: a });
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-extrabold">Ajustes</h1>

      <Card>
        <h2 className="mb-3 font-extrabold">Tema</h2>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => changeTheme(value)}
              className={cn('flex flex-col items-center gap-1 rounded-2xl border-2 py-3 font-bold', theme === value ? 'border-brand bg-brand/10 text-brand' : 'border-edge text-muted')}
            >
              <Icon size={22} /> {label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold">{soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />} Sons de feedback</span>
        <Button size="sm" variant={soundEnabled ? 'primary' : 'secondary'} onClick={toggleSound}>{soundEnabled ? 'Ligado' : 'Desligado'}</Button>
      </Card>

      <Card className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold"><Bell size={20} /> Lembretes (notificações)</span>
        <Button size="sm" variant={notificationsEnabled ? 'primary' : 'secondary'} onClick={toggleNotifications}>{notificationsEnabled ? 'Ligado' : 'Desligado'}</Button>
      </Card>

      <Card>
        <h2 className="mb-3 font-extrabold">Estilo do curso (faixa etária)</h2>
        <div className="grid grid-cols-3 gap-2">
          {AGE_GROUPS.map((g) => (
            <button
              key={g.value}
              onClick={() => changeAge(g.value)}
              title={g.hint}
              className={cn('rounded-2xl border-2 px-2 py-3 text-center', profile?.age_group === g.value ? 'border-brand bg-brand/10 text-brand' : 'border-edge')}
            >
              <div className="text-sm font-extrabold">{g.label}</div>
              <div className="text-[10px] leading-tight text-muted">{g.hint}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-extrabold">Meta diária de XP</h2>
        <div className="grid grid-cols-4 gap-2">
          {DAILY_GOALS.map((g) => (
            <button
              key={g}
              onClick={() => changeGoal(g)}
              className={cn('rounded-2xl border-2 py-2 font-bold', profile?.daily_goal_xp === g ? 'border-brand bg-brand/10 text-brand' : 'border-edge')}
            >
              {g}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
