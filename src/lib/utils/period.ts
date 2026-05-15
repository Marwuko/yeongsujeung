import {
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subMilliseconds,
} from 'date-fns';

import type { Locale } from '@/types';

export const PERIODS = ['today', 'week', 'month', 'quarter', 'year'] as const;
export type Period = (typeof PERIODS)[number];

export function isValidPeriod(p: string): p is Period {
  return (PERIODS as readonly string[]).includes(p);
}

export function getPeriodDates(period: Period = 'month'): { from: Date; to: Date } {
  const now = new Date();
  switch (period) {
    case 'today':
      return { from: startOfDay(now), to: now };
    case 'week':
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: now };
    case 'quarter':
      return { from: startOfQuarter(now), to: now };
    case 'year':
      return { from: startOfYear(now), to: now };
    default:
      return { from: startOfMonth(now), to: now };
  }
}

export function getPrevPeriodDates(period: Period = 'month'): { from: Date; to: Date } {
  const { from } = getPeriodDates(period);
  const now = new Date();
  const duration = now.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - duration),
    to: subMilliseconds(from, 1),
  };
}

export const PERIOD_LABELS: Record<Period, Record<Locale, string>> = {
  today:   { en: 'Today',        ko: '오늘',      de: 'Heute' },
  week:    { en: 'This week',    ko: '이번 주',   de: 'Diese Woche' },
  month:   { en: 'This month',   ko: '이번 달',   de: 'Diesen Monat' },
  quarter: { en: 'This quarter', ko: '이번 분기', de: 'Dieses Quartal' },
  year:    { en: 'This year',    ko: '올해',      de: 'Dieses Jahr' },
};
