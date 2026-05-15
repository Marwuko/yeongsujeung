import { TrendingDown, TrendingUp } from 'lucide-react';

import { formatCurrency } from '@/lib/utils/format';
import type { Locale } from '@/types';

interface BaseProps {
  label: string;
  locale: Locale;
  deltaPercent?: number | null;
}

interface ValueProps extends BaseProps {
  value: number;
  currency?: string;
  isHero?: boolean;
  category?: never;
}

interface CategoryProps extends BaseProps {
  category: { icon: string | null; name: string; amount: number } | null;
  isHero?: never;
  value?: never;
  currency?: never;
}

type Props = ValueProps | CategoryProps;

export function StatCard(props: Props) {
  const { deltaPercent } = props;
  const hasDelta = deltaPercent !== null && deltaPercent !== undefined;
  const isUp = hasDelta && deltaPercent > 0;
  const isDown = hasDelta && deltaPercent < 0;

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-wide text-ink-500">{props.label}</div>
        {hasDelta && Math.abs(deltaPercent) >= 1 && (
          <div
            className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold ${
              isUp ? 'bg-red-50 text-red-600' : isDown ? 'bg-green-50 text-green-600' : 'bg-ink-100 text-ink-500'
            }`}
          >
            {isUp ? <TrendingUp className="h-3 w-3" /> : isDown ? <TrendingDown className="h-3 w-3" /> : null}
            {isUp ? '+' : ''}{Math.round(deltaPercent)}%
          </div>
        )}
      </div>

      {'category' in props && props.category !== undefined ? (
        props.category ? (
          <div className="mt-2 flex items-center gap-3">
            <div className="text-3xl">{props.category.icon ?? '📦'}</div>
            <div>
              <div className="text-lg font-semibold">{props.category.name}</div>
              <div className="text-xs text-ink-500">
                {formatCurrency(props.category.amount, 'KRW', props.locale)}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-lg font-semibold text-ink-300">—</div>
        )
      ) : props.currency ? (
        <div
          className={
            props.isHero
              ? 'mt-2 text-3xl font-bold tracking-tight md:text-4xl'
              : 'mt-2 text-2xl font-bold tracking-tight'
          }
        >
          {formatCurrency(props.value, props.currency, props.locale)}
        </div>
      ) : (
        <div className="mt-2 text-3xl font-bold tracking-tight">{props.value}</div>
      )}
    </div>
  );
}
