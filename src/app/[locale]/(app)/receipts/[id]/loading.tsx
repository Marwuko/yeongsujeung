import { Skeleton } from '@/components/ui/Skeleton';

export default function ReceiptDetailLoading() {
  return (
    <div className="space-y-5">
      {/* Back link */}
      <Skeleton className="h-5 w-28" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Receipt image */}
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />

        {/* Details panel */}
        <div className="space-y-4">
          {/* Main card */}
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>

            {/* Amounts */}
            <div className="space-y-2 border-t border-ink-100 pt-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
              <div className="flex justify-between border-t border-ink-100 pt-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
            <div className="border-b border-ink-100 px-5 py-3.5">
              <Skeleton className="h-4 w-20" />
            </div>
            <ul className="divide-y divide-ink-50">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex items-start justify-between gap-3 px-5 py-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </li>
              ))}
            </ul>
          </div>

          {/* Edit actions */}
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
