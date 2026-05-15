'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { DailyPoint } from '@/db/queries/stats';
import { formatCurrency } from '@/lib/utils/format';
import type { Locale } from '@/types';

interface Props {
  points: DailyPoint[];
  locale: Locale;
}

export function SpendingTrendChart({ points, locale }: Props) {
  const hasAny = points.some((p) => p.amount > 0);

  if (!hasAny) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-ink-700">Last 30 days</h3>
        <p className="mt-8 text-center text-sm text-ink-400">No spending in the last 30 days</p>
      </div>
    );
  }

  // Format X-axis: show only day-of-month, sparsely labeled
  const data = points.map((p) => {
    const d = new Date(p.date);
    return {
      date: p.date,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      amount: p.amount,
    };
  });

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-ink-700">Last 30 days</h3>

      <div className="mt-2 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ed6f1f" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ed6f1f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ec" vertical={false} />
            <XAxis
              dataKey="label"
              fontSize={11}
              stroke="#85857c"
              tickLine={false}
              axisLine={false}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis
              fontSize={11}
              stroke="#85857c"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${Math.round(v / 1000)}k` : v.toString()
              }
              width={36}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value, 'KRW', locale)}
              labelFormatter={(label, payload) => {
                const date = payload?.[0]?.payload?.date;
                if (!date) return label;
                return new Date(date).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e7e7e4',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#ed6f1f"
              strokeWidth={2}
              fill="url(#trendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
