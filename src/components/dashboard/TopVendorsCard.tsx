import type { TopVendor } from '@/db/queries/stats';
import { formatCurrency } from '@/lib/utils/format';
import type { Locale } from '@/types';

interface Props {
  vendors: TopVendor[];
  locale: Locale;
}

export function TopVendorsCard({ vendors, locale }: Props) {
  const label = locale === 'ko' ? '자주 간 곳' : locale === 'de' ? 'Häufigste Händler' : 'Top vendors';
  const visitsLabel = locale === 'ko' ? '회' : locale === 'de' ? 'x' : 'x';
  const emptyLabel = locale === 'ko' ? '아직 상호 데이터 없음' : locale === 'de' ? 'Noch keine Händlerdaten' : 'No vendor data yet';

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-ink-700">{label}</h3>

      {vendors.length === 0 ? (
        <p className="mt-6 text-center text-sm text-ink-400">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {vendors.map((v, i) => (
            <li key={v.vendor} className="flex items-center gap-3">
              <span className="w-5 shrink-0 text-right text-xs font-semibold tabular-nums text-ink-400">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-ink-800">{v.vendor}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-800">
                    {formatCurrency(v.totalAmount, v.currency, locale)}
                  </span>
                </div>
                <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-brand-400"
                    style={{ width: `${Math.min((v.count / vendors[0]!.count) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-ink-500">
                {v.count}{visitsLabel}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
