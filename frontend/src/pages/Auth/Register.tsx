import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Tuca } from '@/components/mascot/Tuca';
import { Button } from '@/components/ui/Button';
import { LangBadge } from '@/components/ui/LangBadge';
import { cn } from '@/lib/cn';
import { AGE_GROUPS, DAILY_GOALS, type AgeGroup, type Language, type LanguageCode } from '@/types';

export function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ username: '', email: '', password: '', display_name: '' });
  const [goal, setGoal] = useState<number>(30);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [age, setAge] = useState<AgeGroup>('adult');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: languages } = useQuery({
    queryKey: ['languages'],
    queryFn: () => api.get<Language[]>('/languages', false),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        display_name: form.display_name.trim() || undefined,
        daily_goal_xp: goal,
        first_language: lang,
        age_group: age,
      });
      navigate(`/app/course/${lang}`);
    } catch (err) {
      setError((err as Error).message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-8 text-ink">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Tuca state="happy" size={96} />
          <h1 className="mt-2 font-display text-2xl font-extrabold">Crie sua conta</h1>
          <p className="text-sm text-muted">Comece sua jornada poliglota dev</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input className="input" placeholder="Nome de usuário" required value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="input" type="email" placeholder="Email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Senha (mín. 6)" required minLength={6} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <div>
            <p className="mb-2 text-sm font-bold text-muted">Meta diária de XP</p>
            <div className="grid grid-cols-4 gap-2">
              {DAILY_GOALS.map((g) => (
                <button key={g} type="button" onClick={() => setGoal(g)}
                  className={cn('rounded-2xl border-2 py-2 font-bold', goal === g ? 'border-brand bg-brand/10 text-brand' : 'border-edge')}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-muted">Para quem é o curso?</p>
            <div className="grid grid-cols-3 gap-2">
              {AGE_GROUPS.map((g) => (
                <button key={g.value} type="button" onClick={() => setAge(g.value)}
                  className={cn('rounded-2xl border-2 px-2 py-2 text-center', age === g.value ? 'border-brand bg-brand/10 text-brand' : 'border-edge')}
                  title={g.hint}>
                  <div className="text-sm font-extrabold">{g.label}</div>
                  <div className="text-[10px] leading-tight text-muted">{g.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-muted">Primeiro idioma</p>
            <div className="grid grid-cols-5 gap-2">
              {(languages ?? []).map((l) => (
                <button key={l.id} type="button" onClick={() => setLang(l.code)}
                  className={cn('flex items-center justify-center rounded-2xl border-2 py-2', lang === l.code ? 'border-brand bg-brand/10' : 'border-edge')}
                  title={l.name}>
                  <LangBadge code={l.code} color={l.color_primary} size={30} />
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm font-bold text-wrong">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>{loading ? 'Criando…' : 'Criar conta'}</Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Já tem conta? <Link to="/login" className="font-bold text-brand">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
