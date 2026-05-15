import 'server-only';

import { createClient } from '@/lib/supabase/server';

// ─── helpers ────────────────────────────────────────────────────────────────

async function fetchReceiptRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  from: Date,
  to: Date,
) {
  const { data, error } = await supabase
    .from('receipts')
    .select(`total_amount, tax_amount, currency, category:categories (slug, name_en, name_ko, color)`)
    .eq('status', 'extracted')
    .gte('purchased_at', from.toISOString())
    .lte('purchased_at', to.toISOString())
    .not('total_amount', 'is', null);
  if (error) throw new Error(`Failed to load stats: ${error.message}`);
  return data ?? [];
}

// ─── period stats ────────────────────────────────────────────────────────────

export interface PeriodStats {
  totalSpent: number;
  totalTax: number;
  receiptCount: number;
  avgPerReceipt: number;
  dominantCurrency: string;
  topCategory: {
    slug: string;
    nameEn: string;
    nameKo: string;
    color: string | null;
    amount: number;
  } | null;
  prevTotalSpent: number;
  prevReceiptCount: number;
}

export async function getStatsForPeriod(from: Date, to: Date, prevFrom: Date, prevTo: Date): Promise<PeriodStats> {
  const supabase = await createClient();

  const [rows, prevRows] = await Promise.all([
    fetchReceiptRows(supabase, from, to),
    fetchReceiptRows(supabase, prevFrom, prevTo),
  ]);

  let totalSpent = 0;
  let totalTax = 0;
  const byCategory = new Map<string, { slug: string; nameEn: string; nameKo: string; color: string | null; amount: number }>();
  const byCurrency = new Map<string, number>();

  for (const row of rows) {
    const amount = Number(row.total_amount ?? 0);
    const tax = Number(row.tax_amount ?? 0);
    const currency = (row as { currency?: string }).currency ?? 'KRW';
    totalSpent += amount;
    totalTax += tax;
    byCurrency.set(currency, (byCurrency.get(currency) ?? 0) + amount);

    const cat = row.category as unknown as { slug: string; name_en: string; name_ko: string; color: string | null } | null;
    if (cat) {
      const existing = byCategory.get(cat.slug);
      if (existing) {
        existing.amount += amount;
      } else {
        byCategory.set(cat.slug, { slug: cat.slug, nameEn: cat.name_en, nameKo: cat.name_ko, color: cat.color, amount });
      }
    }
  }

  let dominantCurrency = 'KRW';
  let maxCurrencyAmount = 0;
  byCurrency.forEach((amt, cur) => {
    if (amt > maxCurrencyAmount) { maxCurrencyAmount = amt; dominantCurrency = cur; }
  });

  const prevTotalSpent = prevRows.reduce((s, r) => s + Number(r.total_amount ?? 0), 0);
  const sorted = [...byCategory.values()].sort((a, b) => b.amount - a.amount);

  return {
    totalSpent,
    totalTax,
    receiptCount: rows.length,
    avgPerReceipt: rows.length > 0 ? totalSpent / rows.length : 0,
    dominantCurrency,
    topCategory: sorted[0] ?? null,
    prevTotalSpent,
    prevReceiptCount: prevRows.length,
  };
}

// keep old export name for backward compat with anything that still uses it
export async function getCurrentMonthStats() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  return getStatsForPeriod(from, now, prevFrom, prevTo);
}

// ─── category breakdown ──────────────────────────────────────────────────────

export interface CategoryBreakdown {
  slug: string;
  nameEn: string;
  nameKo: string;
  color: string | null;
  amount: number;
  percent: number;
}

export async function getCategoryBreakdown(from?: Date, to?: Date): Promise<CategoryBreakdown[]> {
  const supabase = await createClient();

  const now = new Date();
  const start = from ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const end = to ?? now;

  const { data, error } = await supabase
    .from('receipts')
    .select(`total_amount, category:categories (slug, name_en, name_ko, color)`)
    .eq('status', 'extracted')
    .gte('purchased_at', start.toISOString())
    .lte('purchased_at', end.toISOString())
    .not('total_amount', 'is', null);

  if (error) throw new Error(`Failed to load category breakdown: ${error.message}`);

  const rows = data ?? [];
  const total = rows.reduce((s, r) => s + Number(r.total_amount ?? 0), 0);
  const map = new Map<string, Omit<CategoryBreakdown, 'percent'>>();

  for (const row of rows) {
    const cat = row.category as unknown as { slug: string; name_en: string; name_ko: string; color: string | null } | null;
    if (!cat) continue;
    const amount = Number(row.total_amount ?? 0);
    const ex = map.get(cat.slug);
    if (ex) {
      ex.amount += amount;
    } else {
      map.set(cat.slug, { slug: cat.slug, nameEn: cat.name_en, nameKo: cat.name_ko, color: cat.color, amount });
    }
  }

  return [...map.values()]
    .map((c) => ({ ...c, percent: total > 0 ? (c.amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

// ─── daily trend ─────────────────────────────────────────────────────────────

export interface DailyPoint {
  date: string;
  amount: number;
}

export async function getDailySpendingTrend(days = 30): Promise<DailyPoint[]> {
  const supabase = await createClient();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('receipts')
    .select('purchased_at, total_amount')
    .eq('status', 'extracted')
    .gte('purchased_at', start.toISOString())
    .not('total_amount', 'is', null)
    .not('purchased_at', 'is', null);

  if (error) throw new Error(`Failed to load trend: ${error.message}`);

  const map = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    map.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of data ?? []) {
    if (!row.purchased_at) continue;
    const key = new Date(row.purchased_at).toISOString().slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + Number(row.total_amount ?? 0));
  }

  return [...map.entries()].map(([date, amount]) => ({ date, amount }));
}

// ─── recent receipts ─────────────────────────────────────────────────────────

export interface RecentReceiptRow {
  id: string;
  vendor: string | null;
  totalAmount: number | null;
  currency: string;
  purchasedAt: string | null;
  category: { slug: string; nameEn: string; nameKo: string; color: string | null } | null;
}

export async function getRecentReceipts(limit = 10): Promise<RecentReceiptRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('receipts')
    .select(`id, vendor, total_amount, currency, purchased_at, category:categories (slug, name_en, name_ko, color)`)
    .eq('status', 'extracted')
    .order('purchased_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load recent receipts: ${error.message}`);

  return (data ?? []).map((r) => {
    const cat = r.category as unknown as { slug: string; name_en: string; name_ko: string; color: string | null } | null;
    return {
      id: r.id,
      vendor: r.vendor,
      totalAmount: r.total_amount == null ? null : Number(r.total_amount),
      currency: r.currency,
      purchasedAt: r.purchased_at,
      category: cat ? { slug: cat.slug, nameEn: cat.name_en, nameKo: cat.name_ko, color: cat.color } : null,
    };
  });
}

// ─── receipt detail ──────────────────────────────────────────────────────────

export interface ReceiptDetail {
  id: string;
  imagePath: string;
  imageSignedUrl: string | null;
  vendor: string | null;
  totalAmount: number | null;
  taxAmount: number | null;
  currency: string;
  purchasedAt: string | null;
  status: string;
  errorMessage: string | null;
  userNotes: string | null;
  category: { id: string; slug: string; nameEn: string; nameKo: string; color: string | null } | null;
  items: Array<{ id: string; name: string; quantity: number; unitPrice: number | null; totalPrice: number | null }>;
}

export async function getReceiptById(id: string): Promise<ReceiptDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('receipts')
    .select(`id, image_path, vendor, total_amount, tax_amount, currency, purchased_at, status, error_message, user_notes,
      category:categories (id, slug, name_en, name_ko, color),
      items:receipt_items (id, name, quantity, unit_price, total_price, sort_order)`)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load receipt: ${error.message}`);
  if (!data) return null;

  const { data: signed } = await supabase.storage.from('receipts').createSignedUrl(data.image_path, 60 * 60);

  const cat = data.category as unknown as { id: string; slug: string; name_en: string; name_ko: string; color: string | null } | null;
  const items = (data.items ?? [])
    .slice()
    .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    .map((it: { id: string; name: string; quantity: number; unit_price: number | null; total_price: number | null }) => ({
      id: it.id,
      name: it.name,
      quantity: Number(it.quantity ?? 1),
      unitPrice: it.unit_price == null ? null : Number(it.unit_price),
      totalPrice: it.total_price == null ? null : Number(it.total_price),
    }));

  return {
    id: data.id,
    imagePath: data.image_path,
    imageSignedUrl: signed?.signedUrl ?? null,
    vendor: data.vendor,
    totalAmount: data.total_amount == null ? null : Number(data.total_amount),
    taxAmount: data.tax_amount == null ? null : Number(data.tax_amount),
    currency: data.currency,
    purchasedAt: data.purchased_at,
    status: data.status,
    errorMessage: data.error_message,
    userNotes: data.user_notes,
    category: cat ? { id: cat.id, slug: cat.slug, nameEn: cat.name_en, nameKo: cat.name_ko, color: cat.color } : null,
    items,
  };
}

// ─── top vendors ─────────────────────────────────────────────────────────────

export interface TopVendor {
  vendor: string;
  count: number;
  totalAmount: number;
  currency: string;
}

export async function getTopVendors(from: Date, to: Date, limit = 5): Promise<TopVendor[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('receipts')
    .select('vendor, total_amount, currency')
    .eq('status', 'extracted')
    .gte('purchased_at', from.toISOString())
    .lte('purchased_at', to.toISOString())
    .not('vendor', 'is', null)
    .not('total_amount', 'is', null);

  if (error) throw new Error(`Failed to load top vendors: ${error.message}`);

  const map = new Map<string, { count: number; totalAmount: number; currencies: Map<string, number> }>();

  for (const row of data ?? []) {
    if (!row.vendor) continue;
    const amount = Number(row.total_amount ?? 0);
    const currency = row.currency ?? 'KRW';
    const existing = map.get(row.vendor);
    if (existing) {
      existing.count++;
      existing.totalAmount += amount;
      existing.currencies.set(currency, (existing.currencies.get(currency) ?? 0) + amount);
    } else {
      map.set(row.vendor, { count: 1, totalAmount: amount, currencies: new Map([[currency, amount]]) });
    }
  }

  return [...map.entries()]
    .map(([vendor, d]) => {
      let currency = 'KRW';
      let max = 0;
      d.currencies.forEach((amt, cur) => { if (amt > max) { max = amt; currency = cur; } });
      return { vendor, count: d.count, totalAmount: d.totalAmount, currency };
    })
    .sort((a, b) => b.count - a.count || b.totalAmount - a.totalAmount)
    .slice(0, limit);
}
