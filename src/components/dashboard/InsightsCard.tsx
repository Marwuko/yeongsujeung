import { AlertCircle, Info, Repeat, Star, TrendingDown, TrendingUp, Zap } from 'lucide-react';

import type { Insight, InsightIcon, InsightType } from '@/lib/utils/insights';
import type { Locale } from '@/types';

const ICONS: Record<InsightIcon, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  TrendingDown,
  Info,
  AlertCircle,
  Star,
  Repeat,
  Zap,
};

const CHIP_STYLES: Record<InsightType, string> = {
  increase: 'border-red-100 bg-red-50 text-red-700',
  decrease: 'border-green-100 bg-green-50 text-green-700',
  info:     'border-blue-100 bg-blue-50 text-blue-700',
  warning:  'border-amber-100 bg-amber-50 text-amber-700',
  positive: 'border-brand-100 bg-brand-50 text-brand-700',
};

interface Props {
  insights: Insight[];
  locale: Locale;
}

export function InsightsCard({ insights, locale }: Props) {
  if (insights.length === 0) return null;

  const heading =
    locale === 'ko' ? '지출 인사이트' : locale === 'de' ? 'Ausgaben-Einblicke' : 'Spending Insights';

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">{heading}</h3>
      <div className="space-y-2">
        {insights.map((insight) => {
          const Icon = ICONS[insight.icon];
          return (
            <div
              key={insight.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${CHIP_STYLES[insight.type]}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-sm leading-relaxed">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
