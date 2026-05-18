import { ArrowLeft, ChevronRight, FlaskConical, Receipt, Sparkles } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';

import { CategoryIcon } from '@/lib/utils/categories';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Locale } from '@/types';

export const dynamic = 'force-static';

function tr(locale: Locale, en: string, ko: string, de: string) {
  if (locale === 'ko') return ko;
  if (locale === 'de') return de;
  return en;
}

const DEMO_RECEIPT = {
  vendor: 'Starbucks',
  purchasedAt: '2026-05-15T10:23:00+09:00',
  totalAmount: 8500,
  taxAmount: 773,
  currency: 'KRW' as const,
  category: { slug: 'cafe', nameEn: 'Cafe', nameKo: '카페', nameDe: 'Café' },
  paymentMethod: { en: 'Credit card', ko: '신용카드', de: 'Kreditkarte' },
  confidence: 0.97,
  items: [
    { id: '1', name: 'Caffè Latte (Grande)', quantity: 1, totalPrice: 6500 },
    { id: '2', name: 'Almond Croissant', quantity: 1, totalPrice: 2000 },
  ],
};

export default async function DemoPage() {
  const locale = (await getLocale()) as Locale;
  const receipt = DEMO_RECEIPT;
  const subtotal = receipt.totalAmount - receipt.taxAmount;
  const categoryName =
    locale === 'ko'
      ? receipt.category.nameKo
      : locale === 'de'
        ? receipt.category.nameDe
        : receipt.category.nameEn;

  const insight = tr(
    locale,
    'Starbucks was automatically recognized. Café spending is one of the most frequently tracked categories — regular visits add up quickly.',
    '스타벅스가 자동으로 인식되었습니다. 카페 지출은 가장 자주 추적되는 카테고리 중 하나입니다. 정기적인 방문이 쌓이면 큰 금액이 됩니다.',
    'Starbucks wurde automatisch erkannt. Café-Ausgaben sind eine der häufigsten Kategorien — regelmäßige Besuche summieren sich schnell.',
  );

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Minimal nav */}
      <header className="border-b border-ink-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500">
              <Receipt className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-tight">Yeongsujeung</span>
          </div>
          <Link
            href="/signup"
            className="rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-700"
          >
            {tr(locale, 'Get started free', '무료로 시작하기', 'Kostenlos starten')}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {tr(locale, 'Back to home', '홈으로', 'Zurück')}
        </Link>

        {/* Demo banner */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {tr(locale, 'Demo — sample data only', '데모 — 샘플 데이터', 'Demo — Beispieldaten')}
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              {tr(
                locale,
                'This shows a real extraction result from a sample café receipt. No real data is stored.',
                '카페 영수증 샘플의 실제 추출 결과입니다. 실제 데이터는 저장되지 않습니다.',
                'Dies zeigt ein echtes Extraktionsergebnis aus einem Beispielbeleg. Es werden keine echten Daten gespeichert.',
              )}
            </p>
          </div>
        </div>

        {/* Page heading */}
        <div className="mt-6">
          <h1 className="text-xl font-bold text-ink-900">
            {tr(
              locale,
              'AI Receipt Extraction — Result',
              'AI 영수증 추출 결과',
              'KI-Belegextraktion — Ergebnis',
            )}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {tr(
              locale,
              'Here is what our AI extracted from a sample café receipt in under a second.',
              '카페 영수증 샘플에서 AI가 1초 이내에 추출한 내용입니다.',
              'Das hat unsere KI in unter einer Sekunde aus einem Beispiel-Café-Beleg extrahiert.',
            )}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          {/* Main info card */}
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
            {/* Vendor + category */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {tr(locale, 'Vendor', '상호', 'Händler')}
                </p>
                <h2 className="mt-1 truncate text-2xl font-bold tracking-tight text-ink-900">
                  {receipt.vendor}
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  {formatDate(receipt.purchasedAt, locale)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <CategoryIcon slug={receipt.category.slug} size={14} />
                <span className="text-xs font-medium text-ink-600">{categoryName}</span>
              </div>
            </div>

            {/* Amounts */}
            <dl className="space-y-2 border-t border-ink-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">{tr(locale, 'Subtotal', '공급가액', 'Netto')}</dt>
                <dd className="tabular-nums text-ink-700">
                  {formatCurrency(subtotal, receipt.currency, locale)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">{tr(locale, 'Tax (VAT)', '부가세', 'MwSt.')}</dt>
                <dd className="tabular-nums text-ink-700">
                  {formatCurrency(receipt.taxAmount, receipt.currency, locale)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-ink-100 pt-2">
                <dt className="font-semibold text-ink-900">
                  {tr(locale, 'Total', '합계', 'Gesamt')}
                </dt>
                <dd className="text-base font-bold tabular-nums text-ink-900">
                  {formatCurrency(receipt.totalAmount, receipt.currency, locale)}
                </dd>
              </div>
            </dl>

            {/* Extra metadata */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-ink-50 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                  {tr(locale, 'Currency', '통화', 'Währung')}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink-800">{receipt.currency}</p>
              </div>
              <div className="rounded-xl bg-ink-50 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                  {tr(locale, 'Payment', '결제 방법', 'Zahlung')}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink-800">
                  {receipt.paymentMethod[locale === 'ko' ? 'ko' : locale === 'de' ? 'de' : 'en']}
                </p>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mt-3 rounded-xl bg-green-50 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">
                  {tr(
                    locale,
                    'Extraction confidence',
                    '추출 정확도',
                    'Extraktionsgenauigkeit',
                  )}
                </p>
                <span className="text-sm font-bold text-green-700">
                  {Math.round(receipt.confidence * 100)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-green-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${receipt.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
            <div className="border-b border-ink-100 px-5 py-3.5">
              <h3 className="text-sm font-semibold text-ink-700">
                {tr(locale, 'Items', '품목', 'Artikel')}
                <span className="ml-2 rounded-full bg-ink-100 px-1.5 py-0.5 text-xs font-normal text-ink-500">
                  {receipt.items.length}
                </span>
              </h3>
            </div>
            <ul className="divide-y divide-ink-50">
              {receipt.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <p className="text-sm font-medium text-ink-800">{item.name}</p>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-900">
                    {formatCurrency(item.totalPrice, receipt.currency, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI insight */}
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                  {tr(locale, 'AI Insight', 'AI 인사이트', 'KI-Einblick')}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-brand-800">{insight}</p>
              </div>
            </div>
          </div>

          {/* Sign-up CTA */}
          <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-sm">
            <h3 className="text-base font-semibold text-ink-900">
              {tr(
                locale,
                'Ready to track your own receipts?',
                '직접 영수증을 추적할 준비가 되셨나요?',
                'Bereit, Ihre eigenen Belege zu erfassen?',
              )}
            </h3>
            <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-500">
              {tr(
                locale,
                'Create a free account and scan your first receipt in minutes.',
                '무료 계정을 만들고 몇 분 안에 첫 영수증을 스캔하세요.',
                'Erstellen Sie ein kostenloses Konto und scannen Sie Ihren ersten Beleg in Minuten.',
              )}
            </p>
            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600 active:scale-[0.98] sm:w-auto"
              >
                {tr(locale, 'Get started free', '무료로 시작하기', 'Kostenlos starten')}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/" className="text-sm font-medium text-ink-500 hover:text-ink-900">
                {tr(locale, 'Learn more', '더 알아보기', 'Mehr erfahren')} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
