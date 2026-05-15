'use client';

import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { CATEGORY_CONFIG, CategoryIcon } from '@/lib/utils/categories';
import { SUPPORTED_CURRENCIES } from '@/lib/utils/currencies';
import type { Locale } from '@/types';

const CATEGORY_OPTIONS = Object.entries(CATEGORY_CONFIG).map(([slug, cfg]) => ({
  slug,
  labelEn: cfg.labelEn,
  labelKo: cfg.labelKo,
  labelDe: cfg.labelDe,
}));

function catLabel(cat: typeof CATEGORY_OPTIONS[number], locale: Locale): string {
  if (locale === 'ko') return cat.labelKo;
  if (locale === 'de') return cat.labelDe;
  return cat.labelEn;
}

function tr(locale: Locale, en: string, ko: string, de: string): string {
  if (locale === 'ko') return ko;
  if (locale === 'de') return de;
  return en;
}

interface Props {
  receiptId: string;
  locale: Locale;
  initial: {
    vendor: string | null;
    totalAmount: number | null;
    taxAmount: number | null;
    purchasedAt: string | null;
    categorySlug: string | null;
    currency: string;
  };
}

export function EditReceiptActions({ receiptId, locale, initial }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vendor: initial.vendor ?? '',
    totalAmount: initial.totalAmount?.toString() ?? '',
    taxAmount: initial.taxAmount?.toString() ?? '',
    purchasedAt: initial.purchasedAt ? initial.purchasedAt.slice(0, 10) : '',
    categorySlug: initial.categorySlug ?? 'other',
    currency: initial.currency ?? 'KRW',
  });

  const saveEdit = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/receipts/${receiptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor: form.vendor || null,
          totalAmount: form.totalAmount ? Number(form.totalAmount) : null,
          taxAmount: form.taxAmount ? Number(form.taxAmount) : null,
          purchasedAt: form.purchasedAt ? `${form.purchasedAt}T00:00:00Z` : null,
          categorySlug: form.categorySlug,
          currency: form.currency,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'Save failed');
      }
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteReceipt = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/receipts/${receiptId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/receipts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-ink-800">
            {tr(locale, 'Edit receipt', '영수증 수정', 'Beleg bearbeiten')}
          </h3>
          <button onClick={() => setIsEditing(false)} className="text-ink-400 hover:text-ink-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-500">
              {tr(locale, 'Vendor', '상호', 'Händler')}
            </label>
            <input
              value={form.vendor}
              onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
              className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">
                {tr(locale, 'Total', '합계', 'Gesamt')}
              </label>
              <input
                type="number"
                value={form.totalAmount}
                onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">
                {tr(locale, 'Tax', '부가세', 'MwSt.')}
              </label>
              <input
                type="number"
                value={form.taxAmount}
                onChange={(e) => setForm((f) => ({ ...f, taxAmount: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">
                {tr(locale, 'Date', '날짜', 'Datum')}
              </label>
              <input
                type="date"
                value={form.purchasedAt}
                onChange={(e) => setForm((f) => ({ ...f, purchasedAt: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">
                {tr(locale, 'Currency', '통화', 'Währung')}
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} {c.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-500">
              {tr(locale, 'Category', '카테고리', 'Kategorie')}
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setForm((f) => ({ ...f, categorySlug: cat.slug }))}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.categorySlug === cat.slug
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                  }`}
                >
                  <CategoryIcon slug={cat.slug} size={12} />
                  {catLabel(cat, locale)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>
            {tr(locale, 'Cancel', '취소', 'Abbrechen')}
          </Button>
          <Button variant="primary" className="flex-1" onClick={saveEdit} isLoading={isSaving}>
            <Check className="mr-1.5 h-3.5 w-3.5" />
            {tr(locale, 'Save', '저장', 'Speichern')}
          </Button>
        </div>
      </div>
    );
  }

  if (showDeleteConfirm) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-medium text-red-800">
          {tr(
            locale,
            'Delete this receipt? This cannot be undone.',
            '이 영수증을 삭제할까요? 되돌릴 수 없습니다.',
            'Diesen Beleg löschen? Dies kann nicht rückgängig gemacht werden.',
          )}
        </p>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
            {tr(locale, 'Cancel', '취소', 'Abbrechen')}
          </Button>
          <button
            onClick={deleteReceipt}
            disabled={isDeleting}
            className="btn flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting
              ? tr(locale, 'Deleting…', '삭제 중…', 'Löschen…')
              : tr(locale, 'Delete', '삭제', 'Löschen')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setIsEditing(true)}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
      >
        <Pencil className="h-4 w-4" />
        {tr(locale, 'Edit', '수정', 'Bearbeiten')}
      </button>
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        {tr(locale, 'Delete', '삭제', 'Löschen')}
      </button>
    </div>
  );
}
