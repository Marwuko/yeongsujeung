import { Skeleton } from '@/components/ui/Skeleton';

export default function ReceiptsLoading() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>

      {/* Search + filter pills */}
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-xl" />
        ))}
      </div>

      {/* Receipt groups */}
      {Array.from({ length: 3 }).map((_, g) => (
        <div key={g} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-ink-50 px-5 py-4 last:border-0"
              >
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
