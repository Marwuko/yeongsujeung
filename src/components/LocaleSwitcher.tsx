'use client';

import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { defaultLocale, locales, type AppLocale } from '@/i18n/config';

const LOCALE_LABELS: Record<AppLocale, { short: string; full: string }> = {
  en: { short: 'EN', full: 'English' },
  ko: { short: '한국어', full: '한국어' },
  de: { short: 'DE', full: 'Deutsch' },
};

export function LocaleSwitcher() {
  const currentLocale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchLocale = (next: AppLocale) => {
    setOpen(false);
    // Strip current locale prefix (if any) from pathname
    let bare = pathname;
    for (const loc of locales) {
      if (pathname.startsWith(`/${loc}/`)) { bare = pathname.slice(loc.length + 1); break; }
      if (pathname === `/${loc}`) { bare = '/'; break; }
    }
    // Tell next-intl which locale to use on the next request.
    // Without this, the middleware reads its own NEXT_LOCALE cookie and may
    // redirect back to the previous locale when the URL has no prefix (en).
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    const target = next === defaultLocale ? bare || '/' : `/${next}${bare}`;
    // Hard navigation so the middleware runs fresh with the updated cookie.
    window.location.href = target;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:bg-ink-50"
        aria-label="Change language"
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        {LOCALE_LABELS[currentLocale].short}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[7rem] rounded-xl border border-ink-200 bg-white py-1 shadow-lg">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-ink-50 ${
                loc === currentLocale ? 'text-brand-600' : 'text-ink-700'
              }`}
            >
              {LOCALE_LABELS[loc].full}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
