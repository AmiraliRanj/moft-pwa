"use client";

import Image from "next/image";
import { Icon, type IconName } from "@/components/moft/Icon";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { numberFa } from "@/lib/moft-format";
import type { AppTab } from "@/types/moft";

interface DesktopHeaderProps {
  tab: AppTab;
  onTabChange: (tab: AppTab) => void;
  location: string;
  onOpenLocation: () => void;
  cartCount: number;
  onOpenCart: () => void;
  activeOrdersCount: number;
  query: string;
  onQueryChange: (query: string) => void;
  onSearchFocus?: () => void;
}

const navItems: Array<{ id: AppTab; label: string; icon: IconName }> = [
  { id: "home", label: "خانه", icon: "home" },
  { id: "discover", label: "کشف", icon: "search" },
  { id: "orders", label: "سفارش‌ها", icon: "bag" },
  { id: "profile", label: "پروفایل", icon: "user" },
];

export function DesktopHeader({
  tab,
  onTabChange,
  location,
  onOpenLocation,
  cartCount,
  onOpenCart,
  activeOrdersCount,
  query,
  onQueryChange,
  onSearchFocus,
}: DesktopHeaderProps) {
  return (
    <header
      className="fixed top-0 inset-x-0 z-40 w-full bg-surface/90 dark:bg-[#1D1E21]/90 backdrop-blur-xl border-b border-line/60 shadow-xs transition-all"
      aria-label="هدر و ناوبری دسکتاپ"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2.5 pb-1">
        {/* Row 1: Symmetrical 3-column grid ensuring the Search Bar is centered */}
        <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center gap-2.5 md:gap-4 h-11">
          {/* Right Column (Start in RTL): Logo & Location Selector */}
          <div className="flex items-center justify-start gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onTabChange("home")}
              className="group flex items-center gap-2 min-h-[40px] px-1.5 py-1 rounded-2xl hover:bg-canvas/60 active:scale-95 transition-all cursor-pointer select-none shrink-0"
              aria-label="دیبز - صفحه اصلی"
            >
              <span className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-2xl overflow-hidden shadow-xs border border-line/50 shrink-0 bg-brand-soft grid place-items-center">
                <Image
                  src="/icons/dibz-ios-dark.png"
                  alt="لوگوی دیبز"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  priority
                />
              </span>
              <span className="font-black text-sm sm:text-base lg:text-lg text-ink font-morabba tracking-tight">
                دیبز!
              </span>
            </button>

            {/* Divider */}
            <div className="w-[1px] h-5 sm:h-6 bg-line/80 shrink-0" aria-hidden="true" />

            {/* Location Selector Pill */}
            <button
              type="button"
              onClick={onOpenLocation}
              className="group flex items-center gap-1.5 min-h-[38px] px-2.5 sm:px-3.5 py-1 rounded-full bg-canvas/80 hover:bg-canvas border border-line/80 hover:border-brand-2/40 text-xs font-bold text-ink cursor-pointer active:scale-95 transition-all shadow-2xs shrink-0"
              aria-label={`تغییر موقعیت فعلی؛ ${location}`}
            >
              <Icon name="pin" className="w-3.5 h-3.5 text-brand-2 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-[80px] md:max-w-[105px] lg:max-w-[140px]">{location}</span>
              <Icon name="chevron" className="w-3 h-3 text-muted rotate-90 shrink-0 group-hover:text-brand-2 transition-colors" />
            </button>
          </div>

          {/* Center Column: Search Bar in the exact center */}
          <div className="flex items-center justify-center w-full max-w-[280px] md:max-w-[340px] lg:max-w-[480px] xl:max-w-[560px] mx-auto">
            <div className="relative flex items-center w-full h-10 px-3.5 sm:px-4 rounded-xl bg-canvas/80 dark:bg-[#26282D]/80 border border-line/80 focus-within:border-brand-2/50 focus-within:ring-2 focus-within:ring-brand-2/15 focus-within:bg-surface transition-all text-xs shadow-2xs">
              <Icon name="search" className="w-4 h-4 text-muted shrink-0 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onFocus={onSearchFocus}
                placeholder="جست‌وجوی کافه، رستوران یا نام بسته..."
                autoComplete="off"
                className="w-full bg-transparent px-2.5 text-xs sm:text-sm text-ink placeholder:text-muted focus:outline-none"
                aria-label="جست‌وجو در هدر دسکتاپ"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange("")}
                  aria-label="پاک کردن جست‌وجو"
                  className="w-5 h-5 rounded-full bg-muted/20 hover:bg-muted/40 text-ink grid place-items-center shrink-0 cursor-pointer transition-colors"
                >
                  <Icon name="close" className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Left Column (End in RTL): Cart Pill Button & Theme Toggle */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 min-w-0">
            {/* Cart Pill Trigger */}
            <button
              type="button"
              onClick={onOpenCart}
              className={`group flex items-center gap-1.5 sm:gap-2 min-h-[38px] px-2.5 sm:px-3.5 py-1 rounded-full border transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0 ${
                tab === "cart"
                  ? "bg-brand-soft text-brand-2 border-brand-2/40 shadow-xs"
                  : "bg-canvas/80 hover:bg-canvas hover:border-brand-2/40 border-line/80 text-ink"
              }`}
              aria-label={`سبد خرید با ${numberFa(cartCount)} قلم کالا`}
            >
              <div className="relative flex items-center">
                <Icon name="cart" className={`w-4 h-4 ${tab === "cart" ? "text-brand-2" : "text-muted group-hover:text-brand-2"}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -end-2 min-w-4 h-4 px-1 rounded-full bg-brand-2 text-white text-[9px] font-black grid place-items-center shadow-xs">
                    {numberFa(cartCount)}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold whitespace-nowrap hidden sm:inline">سبد خرید</span>
            </button>

            {/* Divider */}
            <div className="w-[1px] h-5 sm:h-6 bg-line/80 shrink-0" aria-hidden="true" />

            {/* Theme Toggle */}
            <ThemeToggle compact />
          </div>
        </div>

        {/* Row 2: Desktop Website Navigation Bar (Clean links, no background container, no button backgrounds) */}
        <div className="flex items-center justify-center border-t border-line/30 mt-2 pt-1 pb-1">
          <nav
            className="flex items-center justify-center gap-8 sm:gap-10 lg:gap-12"
            aria-label="پیوندهای ناوبری اصلی دسکتاپ"
          >
            {navItems.map((item) => {
              const isActive = tab === item.id || (item.id === "orders" && tab === "reservations");
              const hasOrderBadge = item.id === "orders" && activeOrdersCount > 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`group relative flex items-center gap-2 py-1 px-1 text-sm cursor-pointer select-none transition-all ${
                    isActive
                      ? "text-brand-2 dark:text-[#FDA74D] font-black"
                      : "text-muted hover:text-ink font-semibold"
                  }`}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    name={item.icon}
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-brand-2 dark:text-[#FDA74D]" : "text-muted group-hover:text-ink"
                    }`}
                  />
                  <span>{item.label}</span>

                  {/* Active orders count badge */}
                  {hasOrderBadge && (
                    <span className="min-w-4.5 h-4.5 px-1.5 rounded-full bg-brand-2 text-white text-[10px] font-black grid place-items-center ms-0.5 shadow-2xs">
                      {numberFa(activeOrdersCount)}
                    </span>
                  )}

                  {/* Clean desktop underline indicator */}
                  {isActive && (
                    <span
                      className="absolute -bottom-1 inset-x-0 h-[2.5px] bg-brand-2 dark:bg-[#FDA74D] rounded-full shadow-2xs"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
