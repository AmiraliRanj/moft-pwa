"use client";

import Image from "next/image";
import { Icon } from "@/components/moft/Icon";

interface EndingSoonBannerCardProps {
  onAction?: () => void;
  className?: string;
}

export function EndingSoonBannerCard({ onAction, className = "" }: EndingSoonBannerCardProps) {
  return (
    <article
      className={`relative shrink-0 w-60 sm:w-68 rounded-2xl overflow-hidden shadow-xs border border-emerald-800/40 bg-gradient-to-br from-[#0e3521] via-[#092215] to-[#14422b] text-white group cursor-pointer transition-all hover:border-emerald-600/60 hover:shadow-md ${className}`}
    >
      <button
        type="button"
        onClick={onAction}
        aria-label="مشاهده تمام پیشنهادهای در حال اتمام با بیشترین تخفیف"
        className="w-full h-full text-start p-3.5 flex flex-col justify-between relative overflow-hidden focus:outline-none select-none active:scale-[0.99] transition-transform"
      >
        {/* Ambient lighting effects */}
        <div
          className="absolute -top-10 -start-10 w-28 h-28 rounded-full bg-rose-500/15 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-8 -end-8 w-24 h-24 rounded-full bg-emerald-400/15 blur-xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Badges: Urgency indicator + Discount highlight */}
        <div className="relative z-10 flex items-center justify-between gap-2 w-full">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Icon name="clock" className="w-3 h-3 text-rose-300 motion-safe:animate-pulse" />
            <span>فرصت آخر امروز</span>
          </span>
          <span className="text-[10px] font-black text-emerald-300/90 bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-800/50">
            تا ۷۰٪ تخفیف
          </span>
        </div>

        {/* Middle Section: Text description + Cutout Product Image */}
        <div className="relative z-10 my-2.5 flex items-center justify-between gap-2 w-full">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug">
              نجات فوری بسته‌ها
            </h3>
            <p className="text-[11px] text-emerald-100/80 leading-relaxed line-clamp-2">
              جعبه‌های نزدیکت که کمتر از ۲ ساعت تا پایان زمان دریافت دارند.
            </p>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative flex items-center justify-center">
            <Image
              src="/images/products/dibz-dessert-box-cutout.png"
              alt="بسته نجات غذای در حال اتمام"
              width={80}
              height={80}
              className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            />
          </div>
        </div>

        {/* Bottom Bar: Action link with icon */}
        <div className="relative z-10 pt-2 flex items-center justify-between gap-2 border-t border-white/10 w-full">
          <span className="text-xs font-bold text-emerald-300 group-hover:text-white transition-colors">
            مشاهده تمام گزینه‌ها
          </span>
          <span className="w-7 h-7 rounded-xl bg-white/10 group-hover:bg-white text-white group-hover:text-emerald-950 grid place-items-center transition-all shadow-xs">
            <Icon name="arrow" className="w-3.5 h-3.5 rtl:rotate-180" />
          </span>
        </div>
      </button>
    </article>
  );
}
