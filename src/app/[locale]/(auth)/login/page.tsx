'use client';

import { Receipt } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const isKo = t('app.name') === '영수증';

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-ink-700">
          <Receipt className="h-5 w-5 text-brand-500" />
          <span className="font-semibold">{isKo ? '영수증' : 'Yeongsujeung'}</span>
        </Link>

        <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-xl font-bold text-ink-900">
            {isKo ? '다시 오셨군요' : 'Welcome back'}
          </h1>
          <p className="mb-6 text-sm text-ink-500">
            {isKo ? '이메일과 비밀번호를 입력해주세요' : 'Sign in to your account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-ink-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder={isKo ? 'you@example.com' : 'you@example.com'}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-ink-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={loading}>
              {t('auth.loginCta')}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-ink-500">
          {t('auth.loginPrompt')}{' '}
          <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
            {t('auth.signup')}
          </Link>
        </p>
      </div>
    </main>
  );
}
