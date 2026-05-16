import { NextResponse } from 'next/server';

import { markReceiptFailed, saveExtraction } from '@/db/queries/receipts';
import { extractReceipt, ExtractionError } from '@/lib/ai/extract-receipt';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/receipts/:id/retry
 *
 * Re-runs AI extraction on an existing receipt image.
 * Intended for receipts with status 'failed'.
 * Clears any previous line items before reinserting.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the receipt (must belong to the authenticated user)
  const { data: receipt, error: fetchError } = await supabase
    .from('receipts')
    .select('id, image_path, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !receipt) {
    return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
  }

  if (receipt.status === 'processing') {
    return NextResponse.json({ error: 'Already processing' }, { status: 409 });
  }

  // Mark as processing and clear the previous error
  await supabase
    .from('receipts')
    .update({ status: 'processing', error_message: null })
    .eq('id', id)
    .eq('user_id', user.id);

  // Clear any line items from a previous partial extraction
  await supabase.from('receipt_items').delete().eq('receipt_id', id);

  // Download the original image from Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('receipts')
    .download(receipt.image_path);

  if (downloadError || !fileData) {
    await markReceiptFailed(id, user.id, 'Could not retrieve original image for retry');
    return NextResponse.json({ error: 'Image not found in storage' }, { status: 500 });
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  const base64 = buffer.toString('base64');

  const ext = receipt.image_path.split('.').pop()?.toLowerCase();
  const mediaType: 'image/jpeg' | 'image/png' | 'image/webp' =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  try {
    const extraction = await extractReceipt(base64, mediaType);
    await saveExtraction({
      receiptId: id,
      userId: user.id,
      extracted: extraction.data,
      model: extraction.model,
      costUsd: extraction.costUsd,
    });
    return NextResponse.json({ success: true, vendor: extraction.data.vendor });
  } catch (error) {
    const message =
      error instanceof ExtractionError ? error.message : 'Extraction failed on retry';
    await markReceiptFailed(id, user.id, message);
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
