'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';

interface Props {
  /** Supabase table to watch. Defaults to 'receipts'. */
  table?: string;
  /** Debounce delay in ms before calling router.refresh(). Defaults to 400. */
  debounceMs?: number;
}

/**
 * Invisible component that subscribes to Supabase Realtime for a given table
 * and calls router.refresh() when any row changes. Place it anywhere inside a
 * server component page to make that page's data live.
 *
 * Requires Realtime to be enabled for the table in the Supabase dashboard
 * (Database → Replication → supabase_realtime publication).
 */
export function RealtimeRefresher({ table = 'receipts', debounceMs = 400 }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout>;

    const channel = supabase
      .channel(`realtime:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        clearTimeout(timer);
        timer = setTimeout(() => router.refresh(), debounceMs);
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [router, table, debounceMs]);

  return null;
}
