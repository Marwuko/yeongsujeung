import 'server-only';

import Anthropic from '@anthropic-ai/sdk';

import { env } from '@/lib/env';

/**
 * Singleton Anthropic client.
 *
 * We export a factory rather than a top-level instance so that the env
 * validation runs at first call, not at module load (which would crash
 * tests that don't set env vars).
 */
let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }
  return _client;
}

export const EXTRACTION_MODEL = 'claude-sonnet-4-6';

export const APPROX_COST_PER_EXTRACTION_USD = 0.012;
