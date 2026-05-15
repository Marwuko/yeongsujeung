import { Camera, Download, ScanLine } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';

import { ReceiptsList } from '@/components/receipt/ReceiptsList';
import { getRecentReceipts } from '@/db/queries/stats';
import type { Locale } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ReceiptsPage() {
  const locale = (await getLocale()) as Locale;
  const receipts = await getRecentReceipts(200);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {locale === 'ko' ? '영수증' : 'All receipts'}
        </h1>
        <div className="flex items-center gap-2">
          <a
            href="/api/export/csv"
            download
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
          >
            <Download className="h-4 w-4" />
            {locale === 'ko' ? 'CSV 내보내기' : 'Export CSV'}
          </a>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Camera className="h-4 w-4" />
            {locale === 'ko' ? '추가' : 'Add'}
          </Link>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-ink-200 bg-ink-50">
            <ScanLine className="h-6 w-6 text-ink-400" />
          </div>
          <p className="text-sm text-ink-500">
            {locale === 'ko' ? '아직 영수증이 없어요.' : 'No receipts yet.'}
          </p>
        </div>
      ) : (
        <ReceiptsList receipts={receipts} locale={locale} />
      )}
    </div>
  );
}
