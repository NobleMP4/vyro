import { Skeleton } from '@/components/ui/skeleton';

/** Skeleton shown while a lazily loaded page chunk is downloading. */
export function PageLoader() {
  return (
    <div role="status" aria-label="Chargement" className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
    </div>
  );
}
