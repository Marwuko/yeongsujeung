'use client';

import { Target, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatCurrency } from '@/lib/utils/format';
import type { Locale } from '@/types';

export const BUDGET_KEY = 'yeongsujeung_monthly_budget';
export const CURRENCY_KEY = 'yeongsujeung_default_currency';

interface Props {
  spent: number;
  currency: string;
  locale: Locale;
}

function tr(locale: Locale, en: string, ko: string, de: string) {
  if (locale === 'ko') return ko;
  if (locale === 'de') return de;
  return en;
}

export function BudgetCard({ spent, currency, locale }: Props) {
  const [budget, setBudget] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(BUDGET_KEY);
    if (stored) setBudget(Number(stored));
  }, []);

  const saveBudget = () => {
    const val = Number(input.replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      setBudget(val);
      localStorage.setItem(BUDGET_KEY, String(val));
    }
    setEditing(false);
  };

  const pct = budget && budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget ? budget - spent : null;
  const isOver = remaining !== null && remaining < 0;

  if (!mounted) return null;

  if (!budget && !editing) {
    return (
      <button
        onClick={() => { setEditing(true); setInput(''); }}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-white p-5 text-left text-sm text-ink-500 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50/30"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-ink-50">
          <Target className="h-4 w-4 text-ink-400" />
        </div>
        <span>{tr(locale, 'Set a monthly budget goal', '이번 달 예산 설정하기', 'Monatliches Budget festlegen')}</span>
      </button>
    );
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5 shadow-sm">
        <label className="mb-2 block text-xs font-medium text-ink-500">
          {tr(locale, `Monthly budget (${currency})`, `이번 달 예산 (${currency})`, `Monatsbudget (${currency})`)}
        </label>
        <div className="flex gap-2">
          <input
            autoFocus
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
            placeholder={tr(locale, '500000', '500000', '500000')}
            className="flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <button onClick={saveBudget} className="btn btn-primary px-4 text-sm">
            {tr(locale, 'Save', '저장', 'Speichern')}
          </button>
          <button onClick={() => setEditing(false)} className="btn btn-secondary px-3 text-sm">
            <span aria-hidden>✕</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-wide text-ink-500">
          {tr(locale, 'Monthly budget', '이번 달 예산', 'Monatsbudget')}
        </div>
        <button
          onClick={() => { setEditing(true); setInput(budget?.toString() ?? ''); }}
          className="text-ink-400 hover:text-ink-600"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOver ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-brand-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="text-xl font-bold tabular-nums">
            {formatCurrency(spent, currency, locale)}
          </div>
          <div className="text-xs text-ink-500">
            {tr(locale, 'of', '/', 'von')} {formatCurrency(budget!, currency, locale)}
          </div>
        </div>
        {remaining !== null && (
          <div className={`text-right text-sm font-medium ${isOver ? 'text-red-600' : 'text-green-600'}`}>
            {isOver
              ? `${formatCurrency(Math.abs(remaining), currency, locale)} ${tr(locale, 'over', '초과', 'überschritten')}`
              : `${formatCurrency(remaining, currency, locale)} ${tr(locale, 'left', '남음', 'übrig')}`}
          </div>
        )}
      </div>
    </div>
  );
}
