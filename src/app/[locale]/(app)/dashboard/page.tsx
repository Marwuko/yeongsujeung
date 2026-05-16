import { Camera, ScanLine } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { RealtimeRefresher } from '@/components/RealtimeRefresher';
import { CategoryDonut } from '@/components/dashboard/CategoryDonut';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { RecentReceiptsList } from '@/components/dashboard/RecentReceiptsList';
import { SpendingTrendChart } from '@/components/dashboard/SpendingTrendChart';
import { StatCard } from '@/components/dashboard/StatCard';
import { TopVendorsCard } from '@/components/dashboard/TopVendorsCard';
import {
  getCategoryBreakdown,
  getDailySpendingTrend,
  getRecentReceipts,
  getStatsForPeriod,
  getTopVendors,
} from '@/db/queries/stats';
import { getPeriodDates, getPrevPeriodDates, isValidPeriod, PERIOD_LABELS } from '@/lib/utils/period';
import { generateInsights } from '@/lib/utils/insights';
import { InsightsCard } from '@/components/dashboard/InsightsCard';
import type { Locale } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('dashboard');

  const { period: rawPeriod = 'month' } = await searchParams;
  const period = isValidPeriod(rawPeriod) ? rawPeriod : 'month';

  const { from, to } = getPeriodDates(period);
  const { from: prevFrom, to: prevTo } = getPrevPeriodDates(period);

  const [stats, breakdown, trend, recent, vendors] = await Promise.all([
    getStatsForPeriod(from, to, prevFrom, prevTo),
    getCategoryBreakdown(from, to),
    getDailySpendingTrend(30),
    getRecentReceipts(8),
    getTopVendors(from, to, 5),
  ]);

  const hasData = stats.receiptCount > 0;
  const currency = stats.dominantCurrency;
  const insights = generateInsights(stats, breakdown, vendors, locale);

  const delta = (curr: number, prev: number) =>
    prev > 0 ? ((curr - prev) / prev) * 100 : null;

  const spentDelta = delta(stats.totalSpent, stats.prevTotalSpent);
  const countDelta = delta(stats.receiptCount, stats.prevReceiptCount);

  // Daily average for the period
  const daysElapsed = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyAvg = stats.totalSpent / daysElapsed;

  const periodLabel = PERIOD_LABELS[period][locale];
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'de' ? 'de-DE' : 'en-US';

  return (
    <div className="space-y-5">
      <RealtimeRefresher />
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{periodLabel}</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            {from.toLocaleDateString(localeTag, { month: 'short', day: 'numeric' })}
            {' — '}
            {to.toLocaleDateString(localeTag, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector current={period} locale={locale} />
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            <Camera className="h-4 w-4" />
            {t('add')}
          </Link>
        </div>
      </div>

      {!hasData ? (
        <EmptyState locale={locale} />
      ) : (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={t('totalSpent')}
              value={stats.totalSpent}
              currency={currency}
              locale={locale}
              isHero
              deltaPercent={spentDelta}
            />
            <StatCard
              label={t('totalVat')}
              value={stats.totalTax}
              currency={currency}
              locale={locale}
            />
            <StatCard
              label={t('receipts')}
              value={stats.receiptCount}
              locale={locale}
              deltaPercent={countDelta}
            />
            <StatCard
              label={t('dailyAvg')}
              value={dailyAvg}
              currency={currency}
              locale={locale}
            />
          </div>

          {/* Budget */}
          <BudgetCard spent={stats.totalSpent} currency={currency} locale={locale} />

          {/* AI Insights */}
          <InsightsCard insights={insights} locale={locale} />

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CategoryDonut breakdown={breakdown} locale={locale} />
            <SpendingTrendChart points={trend} locale={locale} />
          </div>

          {/* Top vendors + recent */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopVendorsCard vendors={vendors} locale={locale} />
            <RecentReceiptsList receipts={recent} locale={locale} />
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ locale }: { locale: Locale }) {
  const label =
    locale === 'ko'
      ? { h: '아직 영수증이 없어요', p: '첫 영수증을 찍으면 지출 인사이트가 여기 나타납니다.', cta: '첫 영수증 추가하기' }
      : locale === 'de'
        ? { h: 'Noch keine Belege', p: 'Erfassen Sie Ihren ersten Beleg — Ausgabenanalysen erscheinen hier.', cta: 'Ersten Beleg hinzufügen' }
        : { h: 'No receipts yet', p: 'Scan your first receipt and spending insights will appear here.', cta: 'Add your first receipt' };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-14 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-ink-200 bg-ink-50">
          <ScanLine className="h-6 w-6 text-ink-400" />
        </div>
        <h2 className="font-semibold text-ink-800">{label.h}</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-500">{label.p}</p>
        <Link
          href="/upload"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Camera className="h-4 w-4" />
          {label.cta}
        </Link>
      </div>
      <BudgetCard spent={0} currency="KRW" locale={locale} />
    </div>
  );
}
