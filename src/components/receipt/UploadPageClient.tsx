'use client';

import { Layers, ScanLine } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useState } from 'react';

import type { Locale } from '@/types';
import { BatchUploader } from './BatchUploader';
import { ReceiptUploader } from './ReceiptUploader';

type Mode = 'single' | 'batch';

function tr(locale: Locale, en: string, ko: string, de: string): string {
  if (locale === 'ko') return ko;
  if (locale === 'de') return de;
  return en;
}

export function UploadPageClient() {
  const locale = useLocale() as Locale;
  const [mode, setMode] = useState<Mode>('single');

  return (
    <div className="w-full space-y-6">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 rounded-2xl border border-ink-200 bg-ink-50 p-1">
        <button
          onClick={() => setMode('single')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            mode === 'single'
              ? 'bg-white text-ink-800 shadow-sm'
              : 'text-ink-500 hover:text-ink-700'
          }`}
        >
          <ScanLine className="h-4 w-4 shrink-0" />
          {tr(locale, 'Single receipt', '영수증 1장', 'Einzelner Beleg')}
        </button>
        <button
          onClick={() => setMode('batch')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            mode === 'batch'
              ? 'bg-white text-ink-800 shadow-sm'
              : 'text-ink-500 hover:text-ink-700'
          }`}
        >
          <Layers className="h-4 w-4 shrink-0" />
          {tr(locale, 'Batch upload', '일괄 업로드', 'Stapel-Upload')}
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
            {tr(locale, 'NEW', '신규', 'NEU')}
          </span>
        </button>
      </div>

      {/* Mode content */}
      {mode === 'single' ? <ReceiptUploader /> : <BatchUploader />}
    </div>
  );
}
