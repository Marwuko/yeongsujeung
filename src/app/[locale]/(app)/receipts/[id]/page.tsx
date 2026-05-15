import { ArrowLeft, ImageOff } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EditReceiptActions } from '@/components/receipt/EditReceiptForm';
import { getReceiptById } from '@/db/queries/stats';
import { CategoryIcon } from '@/lib/utils/categories';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Locale } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = (await getLocale()) as Locale;
  const receipt = await getReceiptById(id);

  if (!receipt) notFound();

  const categoryName = receipt.category
    ? locale === 'ko'
      ? receipt.category.nameKo
      : receipt.category.nameEn
    : '—';

  return (
    <div className="space-y-6">
      <Link
        href="/receipts"
        className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All receipts
      </Link>

      {receipt.status === 'failed' && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
          <strong className="block">Extraction failed</strong>
          <span className="mt-1 block text-red-700">
            {receipt.errorMessage ?? 'Unknown error.'}
          </span>
        </div>
      )}

      {receipt.status === 'processing' && (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
          Still processing this receipt — try refreshing in a moment.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-ink-50">
          {receipt.imageSignedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={receipt.imageSignedUrl}
              alt={receipt.vendor ?? 'Receipt'}
              className="h-auto w-full object-contain"
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center text-ink-400">
              <ImageOff className="h-10 w-10" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-ink-500">
                  Vendor
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight">
                  {receipt.vendor ?? '—'}
                </h1>
                <div className="mt-1 text-sm text-ink-500">
                  {formatDate(receipt.purchasedAt, locale)}
                </div>
              </div>

              {receipt.category && (
                <div className="flex shrink-0 items-center gap-2">
                  <CategoryIcon slug={receipt.category.slug} size={14} />
                  <span className="text-sm font-medium text-ink-700">{categoryName}</span>
                </div>
              )}
            </div>

            <dl className="space-y-2 border-t border-ink-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="font-medium tabular-nums">
                  {formatCurrency(
                    receipt.totalAmount != null && receipt.taxAmount != null
                      ? receipt.totalAmount - receipt.taxAmount
                      : null,
                    receipt.currency,
                    locale,
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Tax</dt>
                <dd className="tabular-nums">
                  {formatCurrency(receipt.taxAmount, receipt.currency, locale)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-ink-100 pt-2 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-bold tabular-nums">
                  {formatCurrency(receipt.totalAmount, receipt.currency, locale)}
                </dd>
              </div>
            </dl>
          </div>

          {receipt.items.length > 0 && (
            <div className="rounded-2xl border border-ink-100 bg-white shadow-sm">
              <h2 className="border-b border-ink-100 px-5 py-4 text-sm font-semibold text-ink-700">
                Items ({receipt.items.length})
              </h2>
              <ul className="divide-y divide-ink-100">
                {receipt.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{item.name}</div>
                      {item.quantity > 1 && (
                        <div className="text-xs text-ink-500">× {item.quantity}</div>
                      )}
                    </div>
                    <div className="shrink-0 text-sm font-medium tabular-nums">
                      {formatCurrency(item.totalPrice ?? item.unitPrice, receipt.currency, locale)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
