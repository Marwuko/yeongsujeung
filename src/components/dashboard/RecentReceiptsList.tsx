import Link from 'next/link';

import type { RecentReceiptRow } from '@/db/queries/stats';
import { CategoryIcon, getCategoryLabel } from '@/lib/utils/categories';
import { formatCurrency, formatRelativeDate } from '@/lib/utils/format';
import type { Locale } from '@/types';

interface Props {
  receipts: RecentReceiptRow[];
  locale: Locale;
}

export function RecentReceiptsList({ receipts, locale }: Props) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-ink-700">
          {locale === 'ko' ? '최근 영수증' : 'Recent receipts'}
        </h3>
        <Link href="/receipts" className="text-xs font-medium text-brand-600 hover:underline">
          {locale === 'ko' ? '전체 보기 →' : 'View all →'}
        </Link>
      </div>

      <ul className="divide-y divide-ink-100">
        {receipts.map((r) => {
          const categoryName = getCategoryLabel(r.category, locale);
          return (
            <li key={r.id}>
              <Link
                href={`/receipts/${r.id}`}
                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-ink-50"
              >
                <CategoryIcon slug={r.category?.slug} size={18} />

                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {r.vendor ?? (locale === 'ko' ? '알 수 없는 상호' : 'Unknown vendor')}
                  </div>
                  <div className="truncate text-xs text-ink-500">
                    {categoryName} · {formatRelativeDate(r.purchasedAt, locale)}
                  </div>
                </div>

                <div className="font-semibold tabular-nums">
                  {formatCurrency(r.totalAmount, r.currency, locale)}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
