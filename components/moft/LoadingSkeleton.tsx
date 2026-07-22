export function LoadingSkeleton() {
  return (
    <div className="skeleton-page" role="status" aria-label="در حال آماده‌سازی صفحه">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-search" />
      <div className="skeleton-grid">
        {[1, 2, 3, 4].map((item) => <div className="skeleton skeleton-card" key={item} />)}
      </div>
    </div>
  );
}
