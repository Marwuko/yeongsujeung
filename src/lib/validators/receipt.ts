import { z } from 'zod';

/**
 * The structured output we expect from Claude vision.
 *
 * Why Zod? The AI returns JSON, but JSON from any LLM can be malformed.
 * Zod gives us a runtime guarantee that what we save to the DB matches
 * the shape we expect — and gives us TypeScript types for free.
 */

export const ExtractedItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().positive().default(1),
  unit_price: z.number().nonnegative().nullable(),
  total_price: z.number().nonnegative().nullable(),
});

export const ExtractedReceiptSchema = z.object({
  vendor: z.string().min(1).max(200).nullable(),
  purchased_at: z
    .string()
    .nullable()
    .describe('ISO 8601 datetime, e.g. 2025-04-27T18:30:00Z'),
  total_amount: z.number().nonnegative().nullable(),
  tax_amount: z.number().nonnegative().nullable(),
  currency: z.string().length(3).default('KRW'),
  category_slug: z
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
    .default('other'),
  items: z.array(ExtractedItemSchema).default([]),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Model self-reported confidence in the extraction'),
  notes: z.string().max(500).nullable().describe('Anything unusual the model noticed'),
});

export type ExtractedReceipt = z.infer<typeof ExtractedReceiptSchema>;
export type ExtractedItem = z.infer<typeof ExtractedItemSchema>;

/**
 * Upload validation — stricter than the API would otherwise enforce.
 */
export const UploadReceiptSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 10 * 1024 * 1024, 'Image must be 10MB or smaller')
    .refine(
      (f) => ['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(f.type),
      'Only JPEG, PNG, WebP, or HEIC images are supported',
    ),
});
