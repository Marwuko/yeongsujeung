'use client';

import { Check, Download } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { defaultLocale, locales, type AppLocale } from '@/i18n/config';
import { BUDGET_KEY, CURRENCY_KEY } from '@/components/dashboard/BudgetCard';
import { SUPPORTED_CURRENCIES } from '@/lib/utils/currencies';
import type { Locale } from '@/types';

const LOCALE_META: Record<AppLocale, { label: string; sub: string }> = {
  en: { label: 'English',  sub: 'English' },
  ko: { label: '한국어',    sub: 'Korean' },
  de: { label: 'Deutsch',  sub: 'German' },
};

function tr(locale: Locale, en: string, ko: string, de: string) {
  if (locale === 'ko') return ko;
  if (locale === 'de') return de;
  return en;
}

export function SettingsForm() {
  const currentLocale = useLocale() as AppLocale;
  const locale = currentLocale as Locale;
  const pathname = usePathname();

  const [currency, setCurrency] = useState('KRW');
  const [budget, setBudget] = useState('');
  const [budgetSaved, setBudgetSaved] = useState(false);

  useEffect(() => {
    const storedCurrency = localStorage.getItem(CURRENCY_KEY);
    if (storedCurrency) setCurrency(storedCurrency);
    const storedBudget = localStorage.getItem(BUDGET_KEY);
    if (storedBudget) setBudget(storedBudget);
  }, []);

  const switchLocale = (next: AppLocale) => {
    let bare = pathname;
    for (const loc of locales) {
      if (pathname.startsWith(`/${loc}/`)) { bare = pathname.slice(loc.length + 1); break; }
      if (pathname === `/${loc}`) { bare = '/'; break; }
    }
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    const target = next === defaultLocale ? bare || '/' : `/${next}${bare}`;
    window.location.href = target;
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    localStorage.setItem(CURRENCY_KEY, code);
  };

  const handleBudgetSave = () => {
    const val = Number(budget.replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      localStorage.setItem(BUDGET_KEY, String(val));
      setBudgetSaved(true);
      setTimeout(() => setBudgetSaved(false), 2000);
    }
  };

  const handleBudgetClear = () => {
    localStorage.removeItem(BUDGET_KEY);
    setBudget('');
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-ink-700">{title}</h2>
      {children}
    </section>
  );

  return (
    <div className="space-y-4">
      {/* Language */}
      <Section title={tr(locale, 'Language', '언어', 'Sprache')}>
        <div className="grid grid-cols-3 gap-2">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-sm font-medium transition-colors ${
                loc === currentLocale
                  ? 'border-brand-400 bg-brand-50 text-brand-700'
                  : 'border-ink-200 text-ink-700 hover:border-ink-300 hover:bg-ink-50'
              }`}
            >
              <span className="text-base font-semibold">{LOCALE_META[loc].label}</span>
              <span className="text-xs text-ink-500">{LOCALE_META[loc].sub}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-500">
          {tr(locale, 'Changes the interface language immediately.', '인터페이스 언어를 즉시 변경합니다.', 'Ändert die Sprache der Benutzeroberfläche sofort.')}
        </p>
      </Section>

      {/* Default currency */}
      <Section title={tr(locale, 'Default currency', '기본 통화', 'Standardwährung')}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SUPPORTED_CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => handleCurrencyChange(c.code)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                currency === c.code
                  ? 'border-brand-400 bg-brand-50 text-brand-700'
                  : 'border-ink-200 text-ink-700 hover:border-ink-300 hover:bg-ink-50'
              }`}
            >
              <span className="font-bold">{c.symbol}</span>
              <span className="font-medium">{c.code}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-500">
          {tr(
            locale,
            'Used as the default for new receipts. Change per receipt in the edit form.',
            '새 영수증의 기본 통화입니다. 영수증별로 변경 가능합니다.',
            'Wird als Standard für neue Belege verwendet. Pro Beleg änderbar.',
          )}
        </p>
      </Section>

      {/* Monthly budget */}
      <Section title={tr(locale, 'Monthly budget', '월 예산', 'Monatsbudget')}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-500">
              {SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? ''}
            </span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBudgetSave()}
              placeholder={tr(locale, 'e.g. 500000', '예: 500000', 'z. B. 500000')}
              className="w-full rounded-xl border border-ink-200 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            onClick={handleBudgetSave}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              budgetSaved
                ? 'bg-green-100 text-green-700'
                : 'bg-brand-500 text-white hover:bg-brand-600'
            }`}
          >
            {budgetSaved ? (
              <>
                <Check className="h-3.5 w-3.5" />
                {tr(locale, 'Saved', '저장됨', 'Gespeichert')}
              </>
            ) : (
              tr(locale, 'Save', '저장', 'Speichern')
            )}
          </button>
          {budget && (
            <button
              onClick={handleBudgetClear}
              className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50"
            >
              {tr(locale, 'Clear', '삭제', 'Löschen')}
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-500">
          {tr(locale, 'Set a spending target — visible on your dashboard.', '지출 목표를 설정하세요 — 대시보드에 표시됩니다.', 'Legen Sie ein Ausgabenziel fest — sichtbar auf Ihrem Dashboard.')}
        </p>
      </Section>

      {/* Export */}
      <Section title={tr(locale, 'Export data', '데이터 내보내기', 'Daten exportieren')}>
        <a
          href="/api/export/csv"
          download
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          <Download className="h-4 w-4" />
          {tr(locale, 'Download all receipts as CSV', '전체 영수증을 CSV로 다운로드', 'Alle Belege als CSV herunterladen')}
        </a>
        <p className="mt-2 text-xs text-ink-500">
          {tr(
            locale,
            'Includes all extracted receipts with line items.',
            '품목이 포함된 모든 추출된 영수증이 포함됩니다.',
            'Enthält alle extrahierten Belege mit Positionen.',
          )}
        </p>
      </Section>
    </div>
  );
}
