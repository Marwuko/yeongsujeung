import { createBrowserClient } from '@supabase/ssr';

import { env } from '@/lib/env';

/**
 * Supabase client for client components.
 * Uses the anon key — RLS enforces security.
 */
export function createClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
