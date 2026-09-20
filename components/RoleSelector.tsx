import Link from "next/link";
import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Icon } from "@/components/moft/Icon";

export default function RoleSelector() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-canvas px-3.5 sm:px-6 py-5 sm:py-7 max-w-[1200px] mx-auto flex flex-col">
      <a className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:end-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-xl focus:shadow-lg" href="#role-options">رفتن به انتخاب نوع ورود</a>
      <div className="pointer-events-none fixed -top-[300px] -end-[170px] h-[500px] w-[500px] rounded-full bg-emerald-500/15 blur-[115px]" aria-hidden="true" />
      <div className="pointer-events-none fixed -bottom-[330px] -start-[190px] h-[500px] w-[500px] rounded-full bg-amber-400/10 blur-[115px]" aria-hidden="true" />
      
      <div className="relative z-10 w-full max-w-[940px] mx-auto flex flex-col gap-5 sm:gap-7">
        <header className="flex items-center justify-between">
          <BrandMark subtitle="غذای خوب، نزدیک تو" />
          <ThemeToggle compact />
        </header>

        <section aria-labelledby="role-title" className="text-start">
          <h1 id="role-title" className="text-xl sm:text-3xl font-extrabold text-ink leading-snug tracking-tight text-start">دوست داری از کدوم سمت وارد دیبز بشی؟</h1>
        </section>
      </div>

      <div className="relative z-10 w-full max-w-[940px] mx-auto my-auto py-4 sm:py-6">
        <section id="role-options" className="max-w-[460px] mx-auto w-full" aria-label="ورود به اپلیکیشن">
          <Link className="group relative flex min-h-[265px] sm:min-h-[310px] flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-surface p-4 sm:p-6 text-ink shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-md active:scale-[0.985] no-underline" href="/customer">
            <span className="relative z-10 mb-3 sm:mb-4 flex items-center justify-start text-brand-2" aria-hidden="true">
              <span className="[&>svg]:w-7 [&>svg]:h-7 sm:[&>svg]:w-9 sm:[&>svg]:h-9"><Icon name="bag" /></span>
            </span>
            <span className="relative z-10 flex flex-1 flex-col text-start">
              <strong className="mb-2 sm:mb-3 block text-base sm:text-xl font-extrabold leading-tight text-ink text-start">ورود به دیبز (کاربر)</strong>
              <ul className="mb-4 flex flex-col gap-2 text-start text-xs sm:text-sm text-muted list-none p-0">
                <li className="flex items-center gap-2"><span className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4 text-brand-2 shrink-0"><Icon name="check" /></span><span>تخفیف‌های غذای روز</span></li>
                <li className="flex items-center gap-2"><span className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4 text-brand-2 shrink-0"><Icon name="check" /></span><span>رزرو آنلاین و کد تحویل</span></li>
                <li className="flex items-center gap-2"><span className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4 text-brand-2 shrink-0"><Icon name="check" /></span><span>ثبت نظر و امتیاز</span></li>
              </ul>
            </span>
            <span className="relative z-10 mt-auto flex min-h-[44px] items-center justify-between gap-2 rounded-xl sm:rounded-2xl bg-[#174d3d] dark:bg-brand-2 dark:text-zinc-900 px-3.5 sm:px-4 text-xs sm:text-sm font-bold text-white transition-opacity group-hover:opacity-95">
              <span>پیشنهادها رو ببین</span>
              <span className="rotate-180 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4"><Icon name="arrow" /></span>
            </span>
          </Link>

          {/* [BUSINESS SIDE TEMPORARILY HIDDEN - SEPARATE APP/PANEL - DO NOT DELETE]
          <Link className="group relative flex min-h-[265px] sm:min-h-[310px] flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-surface p-4 sm:p-6 text-ink shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-md active:scale-[0.985] no-underline" href="/business">
            <span className="relative z-10 mb-3 sm:mb-4 flex items-center justify-start text-accent" aria-hidden="true">
              <span className="[&>svg]:w-7 [&>svg]:h-7 sm:[&>svg]:w-9 sm:[&>svg]:h-9"><Icon name="store" /></span>
            </span>
            <span className="relative z-10 flex flex-1 flex-col text-start">
              <strong className="mb-2 sm:mb-3 block text-base sm:text-xl font-extrabold leading-tight text-ink text-start">برای کسب‌وکارم</strong>
              <ul className="mb-4 flex flex-col gap-2 text-start text-xs sm:text-sm text-muted list-none p-0">
                <li className="flex items-center gap-2"><span className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4 text-accent shrink-0"><Icon name="check" /></span><span>مدیریت پیشنهاد و موجودی</span></li>
                <li className="flex items-center gap-2"><span className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4 text-accent shrink-0"><Icon name="check" /></span><span>بررسی سفارش و تحویل</span></li>
                <li className="flex items-center gap-2"><span className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4 text-accent shrink-0"><Icon name="check" /></span><span>گزارش فروش و تسویه</span></li>
              </ul>
            </span>
            <span className="relative z-10 mt-auto flex min-h-[38px] sm:min-h-[44px] items-center justify-between gap-2 rounded-xl sm:rounded-2xl bg-[#6d3040] dark:bg-accent dark:text-zinc-900 px-3 sm:px-4 text-xs sm:text-sm font-bold text-white transition-opacity group-hover:opacity-95">
              <span>برو به پنل</span>
              <span className="rotate-180 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4"><Icon name="arrow" /></span>
            </span>
          </Link>
          */}
        </section>
      </div>
    </main>
  );
}
