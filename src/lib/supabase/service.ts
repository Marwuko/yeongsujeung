import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

/**
 * Service-role client. BYPASSES RLS.
 *
 * Use this ONLY in trusted server contexts where you need admin access
 * (e.g., background jobs, webhooks). Never expose this to the client.
 *
 * The `'server-only'` import will fail the build if this file is ever
 * imported into client code.
 */
export function createServiceClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
