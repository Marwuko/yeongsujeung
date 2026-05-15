import type { Locale } from '@/types';

const LOCALE_TAG: Record<string, string> = {
  ko: 'ko-KR',
  de: 'de-DE',
  en: 'en-US',
};

function toLocaleTag(locale: string): string {
  return LOCALE_TAG[locale] ?? 'en-US';
}

export function formatCurrency(
  amount: number | null | undefined,
  currency = 'KRW',
  locale: Locale = 'en',
): string {
  if (amount == null) return '—';
  const tag = toLocaleTag(locale);
  const decimals = ['KRW', 'GHS', 'NGN'].includes(currency) ? 0 : 2;
  try {
    return new Intl.NumberFormat(tag, {
      style: 'currency',
      currency,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatDate(date: Date | string | null | undefined, locale: Locale = 'en'): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(toLocaleTag(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatRelativeDate(
  date: Date | string | null | undefined,
  locale: Locale = 'en',
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const tag = toLocaleTag(locale);
  const rtf = new Intl.RelativeTimeFormat(tag, { numeric: 'auto' });
  if (Math.abs(diffDays) < 1) return rtf.format(0, 'day');
  if (Math.abs(diffDays) < 30) return rtf.format(-diffDays, 'day');
  if (Math.abs(diffDays) < 365) return rtf.format(-Math.floor(diffDays / 30), 'month');
  return formatDate(d, locale);
}
