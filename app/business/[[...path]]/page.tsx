import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "پنل کسب‌وکار",
  description: "پنل کسب‌وکار دیبز در برنامه‌ای جداگانه ارائه می‌شود.",
  robots: { index: false, follow: false },
};

export default function BusinessPage() {
  // When BUSINESS_PWA_URL is set, next.config.ts redirects before this fallback renders.
  return (
    <main className="offline-page">
      <div className="offline-card">
        <h1>پنل کسب‌وکار به برنامه‌ای جدا منتقل شده است.</h1>
        <Link className="primary-button" href="/customer">بازگشت به نسخه مشتری</Link>
      </div>
    </main>
  );
}
