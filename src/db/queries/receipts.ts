import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { ExtractedReceipt } from '@/lib/validators/receipt';

/**
 * Query layer for receipts.
 *
 * Why a separate layer? Three reasons:
 * 1. Encapsulates the DB schema — components never touch raw Supabase.
 * 2. Single place to optimize queries (joins, indexes, caching).
 * 3. Easy to swap the DB or add caching later.
 */

export interface CreateReceiptInput {
  userId: string;
  imagePath: string;
  status: 'pending' | 'processing';
}

export async function createReceipt(input: CreateReceiptInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('receipts')
    .insert({
      user_id: input.userId,
      image_path: input.imagePath,
      status: input.status,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create receipt: ${error.message}`);
  return data;
}

export interface SaveExtractionInput {
  receiptId: string;
  userId: string;
  extracted: ExtractedReceipt;
  model: string;
  costUsd: number;
}

export async function saveExtraction(input: SaveExtractionInput) {
  const supabase = await createClient();
  const { receiptId, userId, extracted, model, costUsd } = input;

  // Look up category_id by slug (cached system categories)
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', extracted.category_slug)
    .is('user_id', null)
    .single();

  // Update receipt with extracted fields
  const { error: updateError } = await supabase
    .from('receipts')
    .update({
      vendor: extracted.vendor,
      vendor_normalized: extracted.vendor?.toLowerCase().trim() ?? null,
      total_amount: extracted.total_amount,
      tax_amount: extracted.tax_amount,
      currency: extracted.currency,
      purchased_at: extracted.purchased_at,
      category_id: category?.id ?? null,
      extracted_data: extracted,
      extraction_model: model,
      extraction_cost_usd: costUsd,
      status: 'extracted',
    })
    .eq('id', receiptId)
    .eq('user_id', userId);

  if (updateError) {
    throw new Error(`Failed to save extraction: ${updateError.message}`);
  }

  // Insert line items
  if (extracted.items.length > 0) {
    const itemsToInsert = extracted.items.map((item, idx) => ({
      receipt_id: receiptId,
      user_id: userId,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      sort_order: idx,
    }));

    const { error: itemsError } = await supabase.from('receipt_items').insert(itemsToInsert);
    if (itemsError) {
      throw new Error(`Failed to save items: ${itemsError.message}`);
    }
  }
}

export async function markReceiptFailed(
  receiptId: string,
  userId: string,
  errorMessage: string,
) {
  const supabase = await createClient();
  await supabase
    .from('receipts')
    .update({ status: 'failed', error_message: errorMessage })
    .eq('id', receiptId)
    .eq('user_id', userId);
}

export interface UpdateReceiptInput {
  receiptId: string;
  userId: string;
  vendor?: string | null;
  totalAmount?: number | null;
  taxAmount?: number | null;
  purchasedAt?: string | null;
  categorySlug?: string | null;
  currency?: string | null;
  userNotes?: string | null;
}

export async function updateReceipt(input: UpdateReceiptInput) {
  const supabase = await createClient();
  const { receiptId, userId, categorySlug, ...fields } = input;

  let categoryId: string | null | undefined;
  if (categorySlug !== undefined) {
    if (categorySlug === null) {
      categoryId = null;
    } else {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .is('user_id', null)
        .single();
      categoryId = cat?.id ?? null;
    }
  }

  const patch: Record<string, unknown> = {};
  if ('vendor' in fields) patch.vendor = fields.vendor;
  if ('totalAmount' in fields) patch.total_amount = fields.totalAmount;
  if ('taxAmount' in fields) patch.tax_amount = fields.taxAmount;
  if ('purchasedAt' in fields) patch.purchased_at = fields.purchasedAt;
  if ('currency' in fields && fields.currency) patch.currency = fields.currency;
  if ('userNotes' in fields) patch.user_notes = fields.userNotes;
  if (categoryId !== undefined) patch.category_id = categoryId;

  const { error } = await supabase
    .from('receipts')
    .update(patch)
    .eq('id', receiptId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to update receipt: ${error.message}`);
}

export async function deleteReceipt(receiptId: string, userId: string): Promise<string> {
  const supabase = await createClient();

  const { data, error: fetchError } = await supabase
    .from('receipts')
    .select('image_path')
    .eq('id', receiptId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !data) throw new Error('Receipt not found');

  await supabase.from('receipt_items').delete().eq('receipt_id', receiptId);

  const { error: deleteError } = await supabase
    .from('receipts')
    .delete()
    .eq('id', receiptId)
    .eq('user_id', userId);

  if (deleteError) throw new Error(`Failed to delete receipt: ${deleteError.message}`);

  await supabase.storage.from('receipts').remove([data.image_path]);

  return data.image_path;
}

export async function listRecentReceipts(userId: string, limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('receipts')
    .select(
      `
      id,
      vendor,
      total_amount,
      currency,
      purchased_at,
      status,
      created_at,
      category:categories (id, slug, name_en, name_ko, icon, color)
    `,
    )
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(`Failed to list receipts: ${error.message}`);
  return data ?? [];
}
