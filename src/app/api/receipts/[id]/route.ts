import { NextResponse } from 'next/server';
import { z } from 'zod';

import { deleteReceipt, updateReceipt } from '@/db/queries/receipts';
import { createClient } from '@/lib/supabase/server';

const PatchBody = z.object({
  vendor: z.string().min(1).max(200).nullable().optional(),
  totalAmount: z.number().nonnegative().nullable().optional(),
  taxAmount: z.number().nonnegative().nullable().optional(),
  purchasedAt: z.string().nullable().optional(),
  categorySlug: z
    .enum([
      'restaurant',
      'cafe',
      'convenience',
      'grocery',
      'transport',
      'subscription',
      'school',
      'health',
      'other',
    ])
    .nullable()
    .optional(),
  currency: z.string().length(3).nullable().optional(),
  userNotes: z.string().max(1000).nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = PatchBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  try {
    await updateReceipt({ receiptId: id, userId: user.id, ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Update failed' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    await deleteReceipt(id, user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Delete failed' },
      { status: 500 },
    );
  }
}
