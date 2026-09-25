"use client";

import { Icon, type IconName } from "@/components/moft/Icon";
import type { AppTab } from "@/types/moft";

const items: Array<{ id: AppTab; label: string; icon: IconName }> = [
  { id: "home", label: "خانه", icon: "home" },
  { id: "discover", label: "کشف", icon: "search" },
  { id: "orders", label: "سفارش‌ها", icon: "bag" },
  { id: "profile", label: "پروفایل", icon: "user" },
];

export function BottomNavigation({
  value,
  onChange,
  reservationCount,
}: {
  value: AppTab;
  onChange: (tab: AppTab) => void;
  reservationCount?: number;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 pointer-events-auto bg-surface/95 dark:bg-[#18201a]/95 backdrop-blur-xl border-t border-line"
      style={{ paddingBottom: "max(10px, calc(env(safe-area-inset-bottom, 0px) - 8px))" }}
      aria-label="ناوبری اصلی"
    >
      <div className="w-full flex items-center justify-around px-2 sm:px-3 pt-1.5 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = value === item.id || (item.id === "orders" && value === "reservations");
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`relative flex-1 min-w-0 min-h-[44px] py-1.5 px-1 sm:px-3 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 select-none transition-all duration-200 ${
                isActive
                  ? "text-brand-2 dark:text-emerald-400 font-black"
                  : "text-muted hover:text-ink font-semibold"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Light green pill backdrop behind the selected option */}
              {isActive && (
                <span
                  className="absolute inset-x-1 sm:inset-x-2 inset-y-1 rounded-2xl bg-brand-soft/85 dark:bg-emerald-500/20 border border-brand-2/20 dark:border-emerald-500/30 -z-10 shadow-2xs animate-in fade-in zoom-in-95 duration-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative z-10">
                <Icon name={item.icon} className="w-5 h-5" />
                {item.id === "orders" && typeof reservationCount === "number" && reservationCount > 0 && (
                  <span className="absolute -top-1 -end-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-brand-2 text-white text-[9px] font-black grid place-items-center border border-surface shadow-2xs">
                    {reservationCount}
                  </span>
                )}
              </div>
              <small className="text-[10px] leading-tight font-black z-10 truncate max-w-full">{item.label}</small>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
