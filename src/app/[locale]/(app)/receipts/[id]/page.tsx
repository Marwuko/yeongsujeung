import { AlertCircle, ArrowLeft, Clock, ImageOff, Sparkles } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { RetryExtractionButton } from '@/components/receipt/RetryExtractionButton';
import { EditReceiptActions } from '@/components/receipt/EditReceiptForm';
import { getReceiptById } from '@/db/queries/stats';
import { CategoryIcon } from '@/lib/utils/categories';
import { getCategoryLabel } from '@/lib/utils/categories';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { generateReceiptInsight } from '@/lib/utils/receipt-insight';
import type { Locale } from '@/types';

export const dynamic = 'force-dynamic';

function tr(locale: Locale, en: string, ko: string, de: string) {
  if (locale === 'ko') return ko;
  if (locale === 'de') return de;
  return en;
}

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = (await getLocale()) as Locale;
  const receipt = await getReceiptById(id);

  if (!receipt) notFound();

  const categoryName = getCategoryLabel(
    receipt.category
      ? { slug: receipt.category.slug, nameEn: receipt.category.nameEn, nameKo: receipt.category.nameKo }
      : null,
    locale,
  );

  const subtotal =
    receipt.totalAmount != null && receipt.taxAmount != null
      ? receipt.totalAmount - receipt.taxAmount
      : null;

  const insight = generateReceiptInsight(
    {
      vendor: receipt.vendor,
      totalAmount: receipt.totalAmount,
      currency: receipt.currency,
      category: receipt.category
        ? { slug: receipt.category.slug, nameEn: receipt.category.nameEn, nameKo: receipt.category.nameKo }
        : null,
      items: receipt.items,
    },
    locale,
  );

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        href="/receipts"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" />
        {tr(locale, 'All receipts', '전체 영수증', 'Alle Belege')}
      </Link>

      {/* Status banners */}
      {receipt.status === 'failed' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-800">
                {tr(locale, 'Extraction failed', '추출 실패', 'Extraktion fehlgeschlagen')}
              </p>
              {receipt.errorMessage && (
                <p className="mt-0.5 text-xs text-red-700">{receipt.errorMessage}</p>
              )}
              <div className="mt-3">
                <RetryExtractionButton receiptId={receipt.id} locale={locale} />
              </div>
            </div>
          </div>
        </div>
      )}

      {receipt.status === 'processing' && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Clock className="h-4 w-4 shrink-0 animate-pulse" />
          {tr(
            locale,
            'Still processing — this usually takes a few seconds.',
            '처리 중입니다 — 잠시만 기다려 주세요.',
            'Wird noch verarbeitet — das dauert meist nur wenige Sekunden.',
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Receipt image */}
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-ink-50 shadow-sm">
          {receipt.imageSignedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={receipt.imageSignedUrl}
              alt={receipt.vendor ?? tr(locale, 'Receipt', '영수증', 'Beleg')}
              className="h-auto w-full object-contain"
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center text-ink-300">
              <ImageOff className="h-12 w-12" />
            </div>
          )}
        </div>

        {/* Details panel */}
        <div className="space-y-4">
          {/* Main card */}
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
            {/* Vendor + category */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {tr(locale, 'Vendor', '상호', 'Händler')}
                </p>
                <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-ink-900">
                  {receipt.vendor ?? '—'}
                </h1>
                <p className="mt-1 text-sm text-ink-500">
                  {formatDate(receipt.purchasedAt, locale)}
                </p>
              </div>

              {receipt.category && (
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <CategoryIcon slug={receipt.category.slug} size={14} />
                  <span className="text-xs font-medium text-ink-600">{categoryName}</span>
                </div>
              )}
            </div>

            {/* Amounts */}
            <dl className="space-y-2 border-t border-ink-100 pt-4 text-sm">
              {subtotal != null && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">{tr(locale, 'Subtotal', '공급가액', 'Netto')}</dt>
                  <dd className="tabular-nums text-ink-700">
                    {formatCurrency(subtotal, receipt.currency, locale)}
                  </dd>
                </div>
              )}
              {receipt.taxAmount != null && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">{tr(locale, 'Tax', '부가세', 'MwSt.')}</dt>
                  <dd className="tabular-nums text-ink-700">
                    {formatCurrency(receipt.taxAmount, receipt.currency, locale)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-ink-100 pt-2">
                <dt className="font-semibold text-ink-900">{tr(locale, 'Total', '합계', 'Gesamt')}</dt>
                <dd className="text-base font-bold tabular-nums text-ink-900">
                  {formatCurrency(receipt.totalAmount, receipt.currency, locale)}
                </dd>
              </div>
            </dl>

            {/* User notes (read-only) */}
            {receipt.userNotes && (
              <div className="mt-4 rounded-xl bg-ink-50 p-3 text-sm text-ink-600">
                <span className="font-medium text-ink-700">
                  {tr(locale, 'Note: ', '메모: ', 'Notiz: ')}
                </span>
                {receipt.userNotes}
              </div>
            )}
          </div>

          {/* AI insight */}
          {insight && receipt.status === 'extracted' && (
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
          )}

          {/* Line items */}
          {receipt.items.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
              <div className="border-b border-ink-100 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-ink-700">
                  {tr(locale, 'Items', '품목', 'Artikel')}
                  <span className="ml-2 rounded-full bg-ink-100 px-1.5 py-0.5 text-xs font-normal text-ink-500">
                    {receipt.items.length}
                  </span>
                </h2>
              </div>
              <ul className="divide-y divide-ink-50">
                {receipt.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-800">{item.name}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-ink-400">
                          {item.quantity}
                          {item.unitPrice != null
                            ? ` × ${formatCurrency(item.unitPrice, receipt.currency, locale)}`
                            : ''}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-900">
                      {formatCurrency(
                        item.totalPrice ?? item.unitPrice,
                        receipt.currency,
                        locale,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Edit / delete */}
          <EditReceiptActions
            receiptId={receipt.id}
            locale={locale}
            initial={{
              vendor: receipt.vendor,
              totalAmount: receipt.totalAmount,
              taxAmount: receipt.taxAmount,
              purchasedAt: receipt.purchasedAt,
              categorySlug: receipt.category?.slug ?? null,
              currency: receipt.currency,
            }}
          />
        </div>
      </div>
    </div>
  );
}
