'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import type { CategoryBreakdown } from '@/db/queries/stats';
import { getCategoryLabel } from '@/lib/utils/categories';
import { formatCurrency } from '@/lib/utils/format';
import type { Locale } from '@/types';

interface Props {
  breakdown: CategoryBreakdown[];
  locale: Locale;
}

export function CategoryDonut({ breakdown, locale }: Props) {
  if (breakdown.length === 0) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-ink-700">
          {locale === 'ko' ? '카테고리별' : 'By category'}
        </h3>
        <p className="mt-8 text-center text-sm text-ink-400">
          {locale === 'ko' ? '이번 달 지출 없음' : 'No spending yet this period'}
        </p>
      </div>
    );
  }

  const data = breakdown.map((c) => ({
    name: getCategoryLabel(c, locale),
    value: c.amount,
    color: c.color ?? '#95a5a6',
    percent: c.percent,
  }));

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-ink-700">
        {locale === 'ko' ? '카테고리별' : 'By category'}
      </h3>

      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value, 'KRW', locale)}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e7e7e4',
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-2 text-sm">
          {data.slice(0, 6).map((c) => (
            <li key={c.name} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="truncate text-ink-700">{c.name}</span>
              </span>
              <span className="font-medium tabular-nums text-ink-700">
                {c.percent.toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
