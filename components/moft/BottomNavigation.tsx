"use client";

import { Icon, type IconName } from "@/components/moft/Icon";
import type { AppTab } from "@/types/moft";

const items: Array<{ id: AppTab; label: string; icon: IconName }> = [
  { id: "home", label: "خانه", icon: "home" },
  { id: "discover", label: "کشف", icon: "search" },
  { id: "profile", label: "پروفایل", icon: "user" },
];

export function BottomNavigation({
  value,
  onChange,
}: {
  value: AppTab;
  onChange: (tab: AppTab) => void;
  reservationCount?: number;
}) {
  return (
    <nav
      className="fixed bottom-3 inset-x-4 z-40 max-w-md mx-auto"
      aria-label="ناوبری اصلی"
    >
      <div className="bg-surface dark:bg-[#18201a] border border-line rounded-full shadow-lg p-1.5 flex items-center justify-between gap-1">
        {items.map((item) => {
          const isActive = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`relative flex-1 min-h-[48px] h-12 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-brand-soft/70 text-[#16a34a] font-black dark:bg-emerald-950/60 dark:text-emerald-400 shadow-2xs"
                  : "text-muted hover:text-ink hover:bg-canvas-soft/40 font-medium"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon name={item.icon} className="w-5 h-5" />
              <small className="text-[10px] leading-none">{item.label}</small>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
