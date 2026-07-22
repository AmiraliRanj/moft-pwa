import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="offline-page">
      <div className="offline-card">
        <div className="offline-mark" aria-hidden="true">م</div>
        <p className="eyebrow">حالت آفلاین</p>
        <h1>این یکی فعلاً از دسترس دوره.</h1>
        <p>اتصال اینترنت را بررسی کنید و دوباره به صفحه خانه برگردید.</p>
        <Link className="primary-button" href="/">تلاش دوباره</Link>
      </div>
    </main>
  );
}
