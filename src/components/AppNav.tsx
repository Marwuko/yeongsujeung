'use client';

import { Camera, Home, LogOut, Receipt, ScanLine, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  href: '/dashboard' | '/upload' | '/receipts' | '/settings';
  label: string;
  Icon: typeof Home;
}

export function AppNav({ userEmail }: { userEmail: string | null }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();

  const items: NavItem[] = [
    { href: '/dashboard', label: t('dashboard'), Icon: Home },
    { href: '/upload', label: t('upload'), Icon: Camera },
    { href: '/receipts', label: t('receipts'), Icon: Receipt },
    { href: '/settings', label: t('settings'), Icon: Settings },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-ink-800">
            <ScanLine className="h-5 w-5 text-brand-500" strokeWidth={2} />
            <span className="font-semibold tracking-tight">Yeongsujeung</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {items.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            {userEmail && (
              <span className="hidden text-xs text-ink-500 md:block">{userEmail}</span>
            )}
            <button
              onClick={handleLogout}
              aria-label={t('logout')}
              className="rounded-xl p-2 text-ink-600 transition-colors hover:bg-ink-100"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white md:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-4">
          {items.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                isActive(href) ? 'text-brand-600' : 'text-ink-500',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
