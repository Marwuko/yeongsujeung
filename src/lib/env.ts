import { z } from 'zod';

/**
 * Validated environment variables.
 *
 * Split into client-safe and server-only sections:
 * - Public vars (NEXT_PUBLIC_*) are exposed to the browser
 * - Server vars are validated lazily — only when actually accessed on the server
 *
 * This matters because `env` is imported by both client and server code,
 * and we can't expose secrets like SUPABASE_SERVICE_ROLE_KEY to the browser.
 */

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(20), // Just check it's non-trivial; format varies
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Validate public vars — runs on both client and server
const publicParsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!publicParsed.success) {
  console.error('❌ Invalid public environment variables:');
  console.error(publicParsed.error.flatten().fieldErrors);
  throw new Error('Invalid public environment variables. See .env.example.');
}

// Lazy server-side validation — only runs when accessed on the server
let _serverEnv: z.infer<typeof serverEnvSchema> | null = null;

function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('Server env vars cannot be accessed on the client');
  }
  if (!_serverEnv) {
    const parsed = serverEnvSchema.safeParse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });
    if (!parsed.success) {
      console.error('❌ Invalid server environment variables:');
      console.error(parsed.error.flatten().fieldErrors);
      throw new Error('Invalid server environment variables. See .env.example.');
    }
    _serverEnv = parsed.data;
  }
  return _serverEnv;
}

/**
 * The env object: public vars are always available, server vars are
 * accessed via getters that throw if used on the client.
 */
export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return publicParsed.data.NEXT_PUBLIC_SUPABASE_URL;
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return publicParsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  },
  get NEXT_PUBLIC_APP_URL() {
    return publicParsed.data.NEXT_PUBLIC_APP_URL;
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return getServerEnv().SUPABASE_SERVICE_ROLE_KEY;
  },
  get ANTHROPIC_API_KEY() {
    return getServerEnv().ANTHROPIC_API_KEY;
  },
  get NODE_ENV() {
    return getServerEnv().NODE_ENV;
  },
};