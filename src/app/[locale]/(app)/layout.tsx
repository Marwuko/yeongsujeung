import { redirect } from 'next/navigation';

import { AppNav } from '@/components/AppNav';
import { createClient } from '@/lib/supabase/server';

/**
 * Layout for the (app) route group — all authenticated pages.
 *
 * Server-renders the auth check so unauthenticated users never see
 * the shell flash before being redirected.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-ink-50">
      <AppNav userEmail={user.email ?? null} />
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:pt-10">{children}</div>
    </div>
  );
}
