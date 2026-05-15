'use client';

import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils/cn';
import { type Period, PERIOD_LABELS, PERIODS } from '@/lib/utils/period';
import type { Locale } from '@/types';

interface Props {
  current: Period;
  locale: Locale;
}

export function PeriodSelector({ current, locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-ink-200 bg-ink-50 p-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => router.push(`${pathname}?period=${p}`)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            current === p
              ? 'bg-white text-ink-900 shadow-sm'
              : 'text-ink-500 hover:text-ink-700',
          )}
        >
          {PERIOD_LABELS[p][locale]}
        </button>
      ))}
    </div>
  );
}
