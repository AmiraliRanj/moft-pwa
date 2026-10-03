import Link from "next/link";
import { Icon } from "@/components/moft/Icon";

export default function OfflinePage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-canvas text-ink" dir="rtl">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-lg text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Offline Brand Mark */}
        <div className="relative w-16 h-16 rounded-2xl bg-brand-soft text-brand-2 grid place-items-center mx-auto shadow-2xs border border-brand-2/20">
          <Icon name="wifi" className="w-8 h-8 text-brand-2" />
        </div>

        <div className="space-y-1.5">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            حالت آفلاین
          </span>
          <h1 className="text-base sm:text-lg font-black text-ink font-morabba">
            ارتباط اینترنت برقرار نیست
          </h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            اتصال اینترنت خود را بررسی کنید. پیشنهادهای ذخیره‌شده را در حافظهٔ دستگاه نگه داشته‌ایم.
          </p>
        </div>

        <div className="pt-2">
          <Link
            className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-2xl bg-brand-2 hover:bg-brand-2/90 active:scale-[0.99] text-white text-xs sm:text-sm font-black transition-all shadow-xs cursor-pointer"
            href="/"
          >
            <Icon name="spark" className="w-4 h-4" />
            <span>تلاش دوباره</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

