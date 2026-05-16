'use client';

import {
  CheckCircle2,
  Layers,
  Plus,
  ReceiptText,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { compressImage } from '@/lib/utils/compress-image';
import { formatCurrency } from '@/lib/utils/format';
import type { Locale } from '@/types';

// ─── types ──────────────────────────────────────────────────────────────────

type ItemStatus = 'queued' | 'processing' | 'done' | 'failed';
type BatchPhase = 'selecting' | 'running' | 'complete';

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  status: ItemStatus;
  receiptId?: string;
  vendor?: string | null;
  total?: number | null;
  currency?: string;
  error?: string;
}

// ─── concurrency ─────────────────────────────────────────────────────────────

async function runConcurrent(
  tasks: (() => Promise<void>)[],
  limit: number,
): Promise<void> {
  const queue = [...tasks];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const task = queue.shift();
      if (task) await task();
    }
  }

  const slots = Math.min(limit, tasks.length);
  await Promise.all(Array.from({ length: slots }, worker));
}

// ─── labels ──────────────────────────────────────────────────────────────────

function tr(locale: Locale, en: string, ko: string, de: string): string {
  if (locale === 'ko') return ko;
  if (locale === 'de') return de;
  return en;
}

// ─── sub-components ──────────────────────────────────────────────────────────

function ProcessingDots() {
  return (
    <span className="flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function ItemRow({
  item,
  phase,
  onRemove,
  locale,
}: {
  item: BatchItem;
  phase: BatchPhase;
  onRemove?: () => void;
  locale: Locale;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {/* Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.previewUrl}
        alt={item.file.name}
        className="h-11 w-11 shrink-0 rounded-lg border border-ink-100 object-cover"
      />

      {/* Name + status */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-800">{item.file.name}</p>
        <p className="mt-0.5 truncate text-xs text-ink-500">
          {item.status === 'queued' && tr(locale, 'Waiting…', '대기 중…', 'Wartend…')}
          {item.status === 'processing' && (
            <span className="flex items-center gap-1.5">
              <ProcessingDots />
              {tr(locale, 'Reading receipt…', '영수증 읽는 중…', 'Beleg wird gelesen…')}
            </span>
          )}
          {item.status === 'done' && (
            <span className="text-green-700">
              {item.vendor ?? tr(locale, 'Extracted', '추출 완료', 'Extrahiert')}
            </span>
          )}
          {item.status === 'failed' && (
            <span className="text-red-600">
              {item.error ?? tr(locale, 'Extraction failed', '추출 실패', 'Extraktion fehlgeschlagen')}
            </span>
          )}
        </p>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2">
        {item.status === 'queued' && (
          <span className="h-2 w-2 rounded-full bg-ink-300" />
        )}
        {item.status === 'processing' && (
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" />
        )}
        {item.status === 'done' && (
          <>
            {item.total != null && (
              <span className="text-sm font-semibold tabular-nums text-ink-800">
                {formatCurrency(item.total, item.currency ?? 'KRW', locale)}
              </span>
            )}
            {item.receiptId ? (
              <Link href={`/receipts/${item.receiptId}`}>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </Link>
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
          </>
        )}
        {item.status === 'failed' && (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        {phase === 'selecting' && onRemove && (
          <button
            onClick={onRemove}
            className="rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function BatchUploader() {
  const locale = useLocale() as Locale;
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);

  const [phase, setPhase] = useState<BatchPhase>('selecting');
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Revoke all object URLs on unmount
  useEffect(() => {
    const urls = urlsRef.current;
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const existing = new Set(
      // deduplicate by name+size
      items.map((i) => `${i.file.name}-${i.file.size}`),
    );
    const newItems: BatchItem[] = arr
      .filter((f) => {
        const key = `${f.name}-${f.size}`;
        if (existing.has(key)) return false;
        existing.add(key);
        const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(f.type);
        const small = f.size <= 10 * 1024 * 1024;
        return ok && small;
      })
      .map((f) => {
        const url = URL.createObjectURL(f);
        urlsRef.current.push(url);
        return {
          id: crypto.randomUUID(),
          file: f,
          previewUrl: url,
          status: 'queued' as const,
        };
      });
    setItems((prev) => [...prev, ...newItems]);
  }, [items]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const processItem = useCallback(async (item: BatchItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'processing' } : i)),
    );

    const compressed = await compressImage(item.file);
    const formData = new FormData();
    formData.append('file', compressed);

    try {
      const res = await fetch('/api/receipts/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'Extraction failed');
      }
      const data = (await res.json()) as {
        receiptId: string;
        vendor?: string | null;
        total?: number | null;
        currency?: string;
      };
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: 'done',
                receiptId: data.receiptId,
                vendor: data.vendor,
                total: data.total,
                currency: data.currency,
              }
            : i,
        ),
      );
    } catch (err) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: 'failed',
                error: err instanceof Error ? err.message : 'Failed',
              }
            : i,
        ),
      );
    }
  }, []);

  const startExtraction = useCallback(async () => {
    if (items.length === 0) return;
    setPhase('running');

    const tasks = items.map((item) => () => processItem(item));
    await runConcurrent(tasks, 3);

    setPhase('complete');
  }, [items, processItem]);

  const reset = useCallback(() => {
    setItems([]);
    setPhase('selecting');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (phase !== 'selecting') return;
    addFiles(e.dataTransfer.files);
  };

  const doneCount = items.filter((i) => i.status === 'done').length;
  const failedCount = items.filter((i) => i.status === 'failed').length;
  const finishedCount = doneCount + failedCount;
  const progress = items.length > 0 ? (finishedCount / items.length) * 100 : 0;

  // ── selecting phase ────────────────────────────────────────────────────────
  if (phase === 'selecting') {
    return (
      <div className="w-full space-y-4">
        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-colors ${
            isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-ink-200 hover:border-brand-300 hover:bg-brand-50/30'
          }`}
        >
          <Layers className="mb-3 h-10 w-10 text-ink-400" />
          <p className="font-medium text-ink-700">
            {tr(locale, 'Drop multiple receipts here', '여러 영수증을 여기에 드롭하세요', 'Mehrere Belege hier ablegen')}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            {tr(locale, 'or click to select files', '또는 클릭하여 파일 선택', 'oder klicken um Dateien auszuwählen')}
          </p>
          <p className="mt-2 text-xs text-ink-400">
            {tr(locale, 'JPG, PNG, WebP, HEIC · up to 10 MB each · max 20 files', 'JPG, PNG, WebP, HEIC · 파일당 최대 10MB · 최대 20개', 'JPG, PNG, WebP, HEIC · je max. 10 MB · max. 20 Dateien')}
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
          />
        </div>

        {/* Queue list */}
        {items.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <span className="text-sm font-semibold text-ink-700">
                {items.length} {tr(locale,
                  items.length === 1 ? 'receipt selected' : 'receipts selected',
                  `개 선택됨`,
                  items.length === 1 ? 'Beleg ausgewählt' : 'Belege ausgewählt',
                )}
              </span>
              <button
                onClick={reset}
                className="text-xs text-ink-500 hover:text-red-600"
              >
                {tr(locale, 'Clear all', '모두 지우기', 'Alle löschen')}
              </button>
            </div>

            <ul className="divide-y divide-ink-50">
              {items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  phase={phase}
                  onRemove={() => removeItem(item.id)}
                  locale={locale}
                />
              ))}
            </ul>

            <div className="flex items-center gap-3 border-t border-ink-100 px-4 py-3">
              <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
              >
                <Plus className="h-3.5 w-3.5" />
                {tr(locale, 'Add more', '추가', 'Mehr hinzufügen')}
              </button>
              <button
                onClick={() => void startExtraction()}
                disabled={items.length === 0}
                className="ml-auto flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {tr(locale,
                  `Extract ${items.length} receipt${items.length !== 1 ? 's' : ''}`,
                  `${items.length}개 추출하기`,
                  `${items.length} Beleg${items.length !== 1 ? 'e' : ''} extrahieren`,
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── running + complete phases ───────────────────────────────────────────────
  return (
    <div className="w-full space-y-4">
      {/* Progress header */}
      <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
        {phase === 'running' ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-700">
                {tr(locale, 'Extracting receipts…', '영수증 추출 중…', 'Belege werden extrahiert…')}
              </p>
              <span className="text-sm tabular-nums text-ink-500">
                {finishedCount} / {items.length}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-500">
              {tr(locale,
                'Processing up to 3 receipts at a time',
                '한 번에 최대 3개씩 처리 중',
                'Verarbeitung von bis zu 3 Belegen gleichzeitig',
              )}
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              {failedCount === 0 ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
              ) : doneCount === 0 ? (
                <XCircle className="h-5 w-5 shrink-0 text-red-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-500" />
              )}
              <p className="font-semibold text-ink-800">
                {tr(locale,
                  `${doneCount} extracted${failedCount > 0 ? ` · ${failedCount} failed` : ''}`,
                  `${doneCount}개 추출 완료${failedCount > 0 ? ` · ${failedCount}개 실패` : ''}`,
                  `${doneCount} extrahiert${failedCount > 0 ? ` · ${failedCount} fehlgeschlagen` : ''}`,
                )}
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
              >
                <Layers className="h-4 w-4" />
                {tr(locale, 'Upload more', '더 추가하기', 'Mehr hochladen')}
              </button>
              <Link
                href="/receipts"
                className="ml-auto flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                <ReceiptText className="h-4 w-4" />
                {tr(locale, 'View all receipts', '전체 영수증 보기', 'Alle Belege anzeigen')}
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Item list */}
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
        <ul className="divide-y divide-ink-50">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} phase={phase} locale={locale} />
          ))}
        </ul>
      </div>
    </div>
  );
}
