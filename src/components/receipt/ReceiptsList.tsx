'use client';

import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { RecentReceiptRow } from '@/db/queries/stats';
import { CATEGORY_CONFIG, CategoryIcon, getCategoryLabel } from '@/lib/utils/categories';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Locale } from '@/types';

interface Props {
  receipts: RecentReceiptRow[];
  locale: Locale;
}

function groupByDate(receipts: RecentReceiptRow[], locale: Locale) {
  const tz = locale === 'ko' ? 'ko-KR' : 'en-US';
  const todayKey = new Date().toISOString().slice(0, 10);
  const yesterdayKey = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const groups = new Map<string, { label: string; items: RecentReceiptRow[] }>();

  for (const r of receipts) {
    const dateKey = r.purchasedAt ? r.purchasedAt.slice(0, 10) : '__none__';
    let groupKey: string;
    let label: string;

    if (dateKey === todayKey) {
      groupKey = '__today__';
      label = locale === 'ko' ? '오늘' : 'Today';
    } else if (dateKey === yesterdayKey) {
      groupKey = '__yesterday__';
      label = locale === 'ko' ? '어제' : 'Yesterday';
    } else if (dateKey === '__none__') {
      groupKey = '__none__';
      label = locale === 'ko' ? '날짜 없음' : 'No date';
    } else {
      groupKey = dateKey.slice(0, 7); // YYYY-MM
      label = new Date(dateKey + 'T12:00:00').toLocaleDateString(tz, {
        month: 'long',
        year: 'numeric',
      });
    }

    if (!groups.has(groupKey)) groups.set(groupKey, { label, items: [] });
    groups.get(groupKey)!.items.push(r);
  }

  return [...groups.values()];
}

export function ReceiptsList({ receipts, locale }: Props) {
  const [query, setQuery] = useState('');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const usedSlugs = useMemo(
    () => new Set(receipts.map((r) => r.category?.slug).filter(Boolean) as string[]),
    [receipts],
  );

  const visibleCategories = Object.entries(CATEGORY_CONFIG).filter(([slug]) =>
    usedSlugs.has(slug),
  );

  const filtered = useMemo(() => {
    let list = receipts;
    if (activeSlug) list = list.filter((r) => r.category?.slug === activeSlug);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => r.vendor?.toLowerCase().includes(q));
    }
    return list;
  }, [receipts, activeSlug, query]);

  const groups = useMemo(() => groupByDate(filtered, locale), [filtered, locale]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={locale === 'ko' ? '상호 검색…' : 'Search by vendor…'}
          className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category filter pills */}
      {visibleCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSlug(null)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
              !activeSlug
                ? 'border-brand-400 bg-brand-50 text-brand-700'
                : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
            }`}
          >
            {locale === 'ko' ? '전체' : 'All'}
          </button>
          {visibleCategories.map(([slug, cfg]) => (
            <button
              key={slug}
              onClick={() => setActiveSlug(activeSlug === slug ? null : slug)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeSlug === slug
                  ? 'border-brand-400 bg-brand-50 text-brand-700'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
              }`}
            >
              <CategoryIcon slug={slug} size={12} />
              {locale === 'ko' ? cfg.labelKo : locale === 'de' ? cfg.labelDe : cfg.labelEn}
            </button>
          ))}
        </div>
      )}

      {/* Result count when filtering */}
      {(query || activeSlug) && (
        <p className="text-xs text-ink-500">
          {filtered.length} {locale === 'ko' ? '개 결과' : 'results'}
        </p>
      )}

      {/* Grouped list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center text-sm text-ink-500">
          {locale === 'ko' ? '결과가 없어요' : 'No matching receipts'}
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                {group.label}
              </h3>
              <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
                {group.items.map((r) => {
                  const categoryName = getCategoryLabel(r.category, locale);
                  return (
                    <li key={r.id}>
                      <a
                        href={`/receipts/${r.id}`}
                        className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-ink-50"
                      >
                        <CategoryIcon slug={r.category?.slug} size={18} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">
                            {r.vendor ?? (locale === 'ko' ? '알 수 없는 상호' : 'Unknown vendor')}
                          </div>
                          <div className="truncate text-xs text-ink-500">
                            {categoryName} · {formatDate(r.purchasedAt, locale)}
                          </div>
                        </div>
                        <div className="font-semibold tabular-nums">
                          {formatCurrency(r.totalAmount, r.currency, locale)}
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
