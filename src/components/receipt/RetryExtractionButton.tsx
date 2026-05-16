'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { Locale } from '@/types';

function tr(locale: Locale, en: string, ko: string, de: string) {
  if (locale === 'ko') return ko;
  if (locale === 'de') return de;
  return en;
}

export function RetryExtractionButton({
  receiptId,
  locale,
}: {
  receiptId: string;
  locale: Locale;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const retry = async () => {
    setStatus('loading');
    setErrMsg(null);
    try {
      const res = await fetch(`/api/receipts/${receiptId}/retry`, { method: 'POST' });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? tr(locale, 'Retry failed', '재시도 실패', 'Fehler beim Neuversuch'));
      }
      router.refresh();
    } catch (err) {
      setStatus('error');
      setErrMsg(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => void retry()}
        disabled={status === 'loading'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
        {status === 'loading'
          ? tr(locale, 'Extracting…', '추출 중…', 'Extrahiere…')
          : tr(locale, 'Retry extraction', '다시 추출하기', 'Erneut extrahieren')}
      </button>
      {errMsg && <p className="text-center text-xs text-red-600">{errMsg}</p>}
    </div>
  );
}
