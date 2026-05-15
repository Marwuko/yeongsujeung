import { NextResponse } from 'next/server';

import { createReceipt, markReceiptFailed, saveExtraction } from '@/db/queries/receipts';
import { extractReceipt, ExtractionError } from '@/lib/ai/extract-receipt';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/receipts/upload
 *
 * Multipart form data: { file: File }
 *
 * Flow:
 * 1. Validate file
 * 2. Upload to Supabase Storage at receipts/{userId}/{uuid}.{ext}
 * 3. Create receipts row (status='processing')
 * 4. Call Claude vision → extracted JSON
 * 5. Save extraction (status='extracted')
 * 6. Return the receipt
 *
 * Errors at step 4-5 mark the receipt 'failed' but keep the image so
 * the user can retry.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse multipart
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  // Upload to Storage
  const ext = file.name.split('.').pop() ?? 'jpg';
  const imagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(imagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  // Create receipt row
  let receiptId: string;
  try {
    const receipt = await createReceipt({
      userId: user.id,
      imagePath,
      status: 'processing',
    });
    receiptId = receipt.id;
  } catch (error) {
    await supabase.storage.from('receipts').remove([imagePath]);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'DB error' },
      { status: 500 },
    );
  }

  // Convert file to base64 for Claude
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString('base64');

  // Map HEIC → jpeg for Claude (Anthropic doesn't accept heic directly)
  const mediaType =
    file.type === 'image/heic' || file.type === 'image/gif'
      ? 'image/jpeg'
      : (file.type as 'image/jpeg' | 'image/png' | 'image/webp');

  // Extract
  try {
    const extraction = await extractReceipt(base64, mediaType);
    await saveExtraction({
      receiptId,
      userId: user.id,
      extracted: extraction.data,
      model: extraction.model,
      costUsd: extraction.costUsd,
    });

    return NextResponse.json({
      receiptId,
      vendor: extraction.data.vendor,
      total: extraction.data.total_amount,
      currency: extraction.data.currency,
      category: extraction.data.category_slug,
      confidence: extraction.data.confidence,
    });
  } catch (error) {
    const message =
      error instanceof ExtractionError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Unknown extraction error';
    await markReceiptFailed(receiptId, user.id, message);

    return NextResponse.json(
      { error: 'Extraction failed', detail: message, receiptId },
      { status: 422 },
    );
  }
}
