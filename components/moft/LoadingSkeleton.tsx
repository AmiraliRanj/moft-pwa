export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" role="status" aria-label="در حال آماده‌سازی صفحه">
      <div className="h-6 w-1/3 rounded-xl bg-surface" />
      <div className="h-11 w-full rounded-2xl bg-surface" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-52 rounded-3xl bg-surface border border-line" />
        ))}
      </div>
    </div>
  );
}
