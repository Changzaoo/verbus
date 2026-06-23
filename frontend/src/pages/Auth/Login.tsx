import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Byte } from '@/components/mascot/Byte';
import { Button } from '@/components/ui/Button';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form);
      navigate('/app');
    } catch (err) {
      setError((err as Error).message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <Byte state="idle" size={96} />
          <h1 className="mt-2 font-display text-2xl font-extrabold">Bem-vindo de volta!</h1>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input className="input" type="email" placeholder="Email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Senha" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm font-bold text-wrong">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Não tem conta? <Link to="/register" className="font-bold text-brand">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
