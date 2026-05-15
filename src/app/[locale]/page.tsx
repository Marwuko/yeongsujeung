import {
  BarChart3,
  Camera,
  ChevronRight,
  CreditCard,
  Globe,
  Layers,
  Receipt,
  ScanLine,
  Target,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { LocaleSwitcher } from '@/components/LocaleSwitcher';

export default async function HomePage() {
  const t = await getTranslations('landing');
  const tAuth = await getTranslations('auth');

  return (
    <div className="min-h-screen bg-white text-ink-900">
      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500">
              <Receipt className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-tight">Yeongsujeung</span>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2">
            <LocaleSwitcher />
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100"
            >
              {tAuth('login')}
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-700"
            >
              {t('cta')}
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="overflow-hidden bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-16 text-center sm:px-6 sm:pt-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            {t('badge')}
          </div>

          {/* Headline */}
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl md:text-6xl lg:text-7xl">
            {t('headline1')}
            <br />
            <span className="text-ink-400">{t('headline2')}</span>
          </h1>

          {/* Sub-heading */}
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
            {t('sub')}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 hover:shadow-brand-500/30 active:scale-[0.98] sm:w-auto"
            >
              {t('cta')}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-1 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900 sm:w-auto"
            >
              {t('login')} →
            </Link>
          </div>
        </div>

        {/* ── Dashboard preview ──────────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-2xl shadow-ink-900/10 ring-1 ring-ink-900/5 md:rounded-3xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50 px-4 py-3 sm:px-5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <div className="ml-2 flex min-w-0 max-w-[200px] flex-1 items-center rounded-md border border-ink-200 bg-white px-3 py-1">
                <span className="truncate text-xs text-ink-400">
                  yeongsujeung.vercel.app/dashboard
                </span>
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="bg-ink-50 p-4 sm:p-6">
              {/* Stat cards */}
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Total Spent', value: '$2,480', trend: '↑ 8%', trendColor: 'text-red-500' },
                  { label: 'Receipts', value: '23', trend: 'this month', trendColor: 'text-ink-400' },
                  { label: 'Daily Avg', value: '$83', trend: 'last 30 days', trendColor: 'text-ink-400' },
                  { label: 'Budget', value: '78%', trend: '$420 remaining', trendColor: 'text-green-600' },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl border border-ink-100 bg-white p-3 sm:p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400 sm:text-xs">
                      {card.label}
                    </p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-ink-900 sm:text-2xl">
                      {card.value}
                    </p>
                    <p className={`mt-0.5 text-[10px] sm:text-xs ${card.trendColor}`}>
                      {card.trend}
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts + receipts */}
              <div className="grid gap-3 md:grid-cols-5">
                {/* Bar chart */}
                <div className="rounded-xl border border-ink-100 bg-white p-4 md:col-span-3">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                    30-day trend
                  </p>
                  <div className="flex h-20 items-end gap-1 sm:h-24">
                    {[32, 58, 44, 72, 48, 85, 64, 38, 70, 52, 91, 47, 75, 40, 62, 68, 50, 79, 58, 92, 45, 70, 38, 83, 57, 76, 63, 48, 71, 55].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="min-w-0 flex-1 rounded-sm bg-brand-400"
                          style={{ height: `${h}%`, opacity: 0.7 + (i / 30) * 0.3 }}
                        />
                      ),
                    )}
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-ink-400">
                    <span>Nov 15</span>
                    <span>Today</span>
                  </div>
                </div>

                {/* Recent receipts */}
                <div className="rounded-xl border border-ink-100 bg-white p-4 md:col-span-2">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                    Recent
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      { name: 'Starbucks', cat: 'Café', amount: '$12.50', color: 'bg-amber-400' },
                      { name: 'Amazon', cat: 'Shopping', amount: '$89.00', color: 'bg-blue-400' },
                      { name: 'Uber', cat: 'Transport', amount: '$18.50', color: 'bg-green-400' },
                      { name: 'Whole Foods', cat: 'Grocery', amount: '$64.20', color: 'bg-purple-400' },
                    ].map((r) => (
                      <li key={r.name} className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${r.color}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-ink-800">{r.name}</p>
                          <p className="text-[10px] text-ink-400">{r.cat}</p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-ink-900">
                          {r.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Category bars */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'Restaurant', pct: 42, color: 'bg-brand-400' },
                  { label: 'Shopping', pct: 28, color: 'bg-blue-400' },
                  { label: 'Transport', pct: 18, color: 'bg-green-400' },
                  { label: 'Other', pct: 12, color: 'bg-purple-400' },
                ].map((c) => (
                  <div key={c.label} className="rounded-lg border border-ink-100 bg-white px-3 py-2">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-ink-600">{c.label}</span>
                      <span className="text-[10px] font-bold text-ink-800">{c.pct}%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className={`h-full rounded-full ${c.color}`}
                        style={{ width: `${c.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <section className="border-y border-ink-100 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {(
              [
                [t('statsVal1'), t('statsLabel1')],
                [t('statsVal2'), t('statsLabel2')],
                [t('statsVal3'), t('statsLabel3')],
                [t('statsVal4'), t('statsLabel4')],
              ] as [string, string][]
            ).map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{val}</p>
                <p className="mt-1 text-sm text-ink-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            {t('featuresTitle')}
          </h2>
          <p className="mt-3 text-ink-500">{t('featuresSub')}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<ScanLine className="h-5 w-5" />}
            iconClass="bg-brand-50 text-brand-600"
            title={t('f1Title')}
            body={t('f1Body')}
          />
          <FeatureCard
            icon={<CreditCard className="h-5 w-5" />}
            iconClass="bg-green-50 text-green-600"
            title={t('f2Title')}
            body={t('f2Body')}
          />
          <FeatureCard
            icon={<Globe className="h-5 w-5" />}
            iconClass="bg-blue-50 text-blue-600"
            title={t('f3Title')}
            body={t('f3Body')}
          />
          <FeatureCard
            icon={<Target className="h-5 w-5" />}
            iconClass="bg-purple-50 text-purple-600"
            title={t('f4Title')}
            body={t('f4Body')}
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            iconClass="bg-amber-50 text-amber-600"
            title={t('f5Title')}
            body={t('f5Body')}
          />
          <FeatureCard
            icon={<Layers className="h-5 w-5" />}
            iconClass="bg-rose-50 text-rose-600"
            title={t('f6Title')}
            body={t('f6Body')}
          />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="border-t border-ink-100 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            {t('howTitle')}
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {(
              [
                { num: '01', icon: <Camera className="h-5 w-5" />, key: 'how1' },
                { num: '02', icon: <ScanLine className="h-5 w-5" />, key: 'how2' },
                { num: '03', icon: <BarChart3 className="h-5 w-5" />, key: 'how3' },
              ] as { num: string; icon: React.ReactNode; key: 'how1' | 'how2' | 'how3' }[]
            ).map((step) => (
              <div key={step.num} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/20">
                    {step.icon}
                  </div>
                  <span className="text-5xl font-black text-ink-100">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-ink-900">
                  {t(`${step.key}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{t(`${step.key}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl md:text-5xl">
          {t('ctaTitle')}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-ink-500">{t('ctaSub')}</p>
        <Link
          href="/signup"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-4 font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 hover:shadow-brand-500/30 active:scale-[0.98]"
        >
          {t('ctaBtn')}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-ink-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500">
              <Receipt className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-ink-900">Yeongsujeung</span>
          </div>
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} Yeongsujeung. All rights reserved.
          </p>
          <LocaleSwitcher />
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  iconClass,
  title,
  body,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  body: string;
}) {
  return (
    <div className="group rounded-2xl border border-ink-100 bg-white p-6 shadow-sm transition-all duration-200 hover:border-ink-200 hover:shadow-md">
      <div
        className={`mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
    </div>
  );
}
