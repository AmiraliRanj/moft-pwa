import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="skeleton-page t-skel-skeleton is-pulsing" role="status" aria-label="در حال آماده‌سازی صفحه">
      <Skeleton className="skeleton-title" />
      <Skeleton className="skeleton-search" />
      <div className="skeleton-grid">
        {[1, 2, 3, 4].map((item) => <Skeleton className="skeleton-card" key={item} />)}
      </div>
    </div>
  );
}
