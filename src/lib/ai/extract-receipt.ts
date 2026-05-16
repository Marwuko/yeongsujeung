import 'server-only';

import {
  APPROX_COST_PER_EXTRACTION_USD,
  EXTRACTION_MODEL,
  getAnthropicClient,
} from '@/lib/ai/client';
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT } from '@/lib/ai/prompts';
import { normalizeMerchant } from '@/lib/utils/merchants';
import { ExtractedReceiptSchema, type ExtractedReceipt } from '@/lib/validators/receipt';

export interface ExtractionResult {
  data: ExtractedReceipt;
  model: string;
  costUsd: number;
  rawResponse: string;
}

export class ExtractionError extends Error {
  constructor(
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}

/**
 * Extract structured data from a receipt image using Claude vision.
 * Applies merchant normalization as a post-processing step to correct
 * OCR artefacts and improve category accuracy.
 */
export async function extractReceipt(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
): Promise<ExtractionResult> {
  const client = getAnthropicClient();

  let response;
  try {
    response = await client.messages.create({
      model: EXTRACTION_MODEL,
      max_tokens: 2048,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      system: [{ type: 'text', text: EXTRACTION_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }] as any,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: EXTRACTION_USER_PROMPT,
            },
          ],
        },
      ],
    });
  } catch (error) {
    throw new ExtractionError('Failed to call Anthropic API', error);
  }

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new ExtractionError('Model returned no text content');
  }

  const rawText = textBlock.text.trim();

  // Strip code fences if the model added them despite instructions
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    throw new ExtractionError(
      `Model returned invalid JSON. First 200 chars: ${cleaned.slice(0, 200)}`,
      error,
    );
  }

  const validation = ExtractedReceiptSchema.safeParse(parsed);
  if (!validation.success) {
    throw new ExtractionError(
      `Extracted data failed schema validation: ${validation.error.message}`,
      validation.error,
    );
  }

  // ── Merchant post-processing ────────────────────────────────────────
  // Match the AI's vendor string against our known merchant database.
  // This corrects OCR noise ("GS 25" → "GS25") and improves category
  // accuracy for recognized chains (overrides AI's "other" classification).
  const merchant = normalizeMerchant(validation.data.vendor);
  if (merchant) {
    validation.data.vendor = merchant.canonical;
    if (validation.data.category_slug === 'other') {
      validation.data.category_slug =
        merchant.categorySlug as ExtractedReceipt['category_slug'];
    }
  }
  // ───────────────────────────────────────────────────────────────────

  return {
    data: validation.data,
    model: EXTRACTION_MODEL,
    costUsd: APPROX_COST_PER_EXTRACTION_USD,
    rawResponse: rawText,
  };
}
