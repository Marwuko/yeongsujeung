/**
 * Rule-based financial insight generation.
 * No AI calls — computed entirely from dashboard query results.
 */

import type { CategoryBreakdown, PeriodStats, TopVendor } from '@/db/queries/stats';
import type { Locale } from '@/types';

export type InsightType = 'increase' | 'decrease' | 'info' | 'warning' | 'positive';
export type InsightIcon =
  | 'TrendingUp'
  | 'TrendingDown'
  | 'Info'
  | 'AlertCircle'
  | 'Star'
  | 'Repeat'
  | 'Zap';

export interface Insight {
  id: string;
  type: InsightType;
  icon: InsightIcon;
  text: string;
}

function tr(locale: Locale, en: string, ko: string, de: string): string {
  if (locale === 'ko') return ko;
  if (locale === 'de') return de;
  return en;
}

/**
 * Generate up to 3 contextual insights from the user's current period data.
 * Returns an empty array when there are no receipts yet.
 */
export function generateInsights(
  stats: PeriodStats,
  breakdown: CategoryBreakdown[],
  vendors: TopVendor[],
  locale: Locale,
): Insight[] {
  if (stats.receiptCount === 0) return [];

  const insights: Insight[] = [];

  // ── 1. Spending trend vs previous period ──────────────────────────
  if (stats.prevTotalSpent > 0) {
    const delta = (stats.totalSpent - stats.prevTotalSpent) / stats.prevTotalSpent;
    const pct = Math.round(Math.abs(delta) * 100);

    if (delta > 0.1) {
      insights.push({
        id: 'spending-up',
        type: 'increase',
        icon: 'TrendingUp',
        text: tr(
          locale,
          `Spending is up ${pct}% compared to the previous period.`,
          `지출이 이전 기간 대비 ${pct}% 증가했습니다.`,
          `Ausgaben sind um ${pct} % gegenüber dem Vormonat gestiegen.`,
        ),
      });
    } else if (delta < -0.1) {
      insights.push({
        id: 'spending-down',
        type: 'decrease',
        icon: 'TrendingDown',
        text: tr(
          locale,
          `Spending is down ${pct}% vs last period — nice work!`,
          `지출이 이전 기간 대비 ${pct}% 줄었습니다. 잘 하셨어요!`,
          `Ausgaben sind um ${pct} % gesunken — gut gemacht!`,
        ),
      });
    }
  }

  // ── 2. Dominant spending category ────────────────────────────────
  if (breakdown.length > 0) {
    const top = breakdown[0]!;
    if (top.percent > 44) {
      const name =
        locale === 'ko'
          ? top.nameKo
          : locale === 'de'
            ? (top.nameKo === top.nameEn ? top.nameEn : top.nameEn)
            : top.nameEn;
      insights.push({
        id: 'category-dominant',
        type: 'info',
        icon: 'Info',
        text: tr(
          locale,
          `${Math.round(top.percent)}% of spending went to ${name} this period.`,
          `이번 기간 지출의 ${Math.round(top.percent)}%가 ${top.nameKo}에서 발생했습니다.`,
          `${Math.round(top.percent)} % der Ausgaben entfielen auf ${name}.`,
        ),
      });
    }
  }

  // ── 3. Frequent merchant ──────────────────────────────────────────
  if (vendors.length > 0 && vendors[0]!.count >= 3) {
    const v = vendors[0]!;
    insights.push({
      id: 'frequent-merchant',
      type: 'info',
      icon: 'Repeat',
      text: tr(
        locale,
        `You visited ${v.vendor} ${v.count} times this period.`,
        `이번 기간 ${v.vendor}을(를) ${v.count}번 방문했습니다.`,
        `Sie haben ${v.vendor} ${v.count} Mal in diesem Zeitraum besucht.`,
      ),
    });
  }

  // ── 4. Receipt count milestone ────────────────────────────────────
  if (stats.receiptCount >= 10 && stats.receiptCount % 5 === 0) {
    insights.push({
      id: 'milestone',
      type: 'positive',
      icon: 'Star',
      text: tr(
        locale,
        `${stats.receiptCount} receipts tracked this period — great consistency!`,
        `이번 기간 영수증 ${stats.receiptCount}개 기록 완료! 꾸준히 잘 하고 계세요.`,
        `${stats.receiptCount} Belege in diesem Zeitraum — hervorragende Konsistenz!`,
      ),
    });
  }

  // ── 5. High receipt count but low spend (many small purchases) ────
  if (stats.receiptCount >= 5 && stats.avgPerReceipt > 0 && stats.avgPerReceipt < 10) {
    insights.push({
      id: 'small-purchases',
      type: 'info',
      icon: 'Zap',
      text: tr(
        locale,
        `Most purchases are small — your average receipt is under $10.`,
        `대부분 소액 결제네요. 평균 영수증 금액이 10달러 미만입니다.`,
        `Die meisten Einkäufe sind klein — Ihr Durchschnitt liegt unter 10 $.`,
      ),
    });
  }

  // ── 6. High average per receipt ───────────────────────────────────
  if (stats.receiptCount >= 3 && stats.avgPerReceipt > 100) {
    insights.push({
      id: 'high-avg',
      type: 'warning',
      icon: 'AlertCircle',
      text: tr(
        locale,
        `Your average spend per receipt is high this period.`,
        `이번 기간 영수증 건당 평균 금액이 높습니다.`,
        `Ihr durchschnittlicher Ausgabenbetrag je Beleg ist in diesem Zeitraum hoch.`,
      ),
    });
  }

  return insights.slice(0, 3);
}
