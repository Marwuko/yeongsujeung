import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabase
    .from('receipts')
    .select(`
      purchased_at, vendor, currency, total_amount, tax_amount,
      category:categories (name_en),
      items:receipt_items (name, quantity, unit_price, total_price)
    `)
    .eq('status', 'extracted')
    .order('purchased_at', { ascending: false, nullsFirst: false });

  if (from) query = query.gte('purchased_at', from);
  if (to)   query = query.lte('purchased_at', to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];

  const escape = (v: string | null | undefined) => {
    if (v == null) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const headers = ['Date', 'Vendor', 'Category', 'Currency', 'Total', 'Tax', 'Items'];
  const lines: string[] = [headers.join(',')];

  for (const r of rows) {
    const date = r.purchased_at ? new Date(r.purchased_at).toISOString().slice(0, 10) : '';
    const cat = (r.category as unknown as { name_en: string } | null)?.name_en ?? '';
    const items = ((r.items ?? []) as { name: string; quantity: number }[])
      .map((i) => `${i.quantity}× ${i.name}`)
      .join('; ');

    lines.push([
      escape(date),
      escape(r.vendor),
      escape(cat),
      escape(r.currency),
      r.total_amount ?? '',
      r.tax_amount ?? '',
      escape(items),
    ].join(','));
  }

  const csv = lines.join('\r\n');
  const filename = `receipts-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
