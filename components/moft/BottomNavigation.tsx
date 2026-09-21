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
      className="fixed inset-x-0 bottom-0 z-40 pointer-events-auto bg-surface/95 dark:bg-[#18201a]/95 backdrop-blur-xl border-t border-line"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
      aria-label="ناوبری اصلی"
    >
      <div className="flex items-center justify-around pt-1.5 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`relative flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 cursor-pointer active:scale-95 select-none ${
                isActive
                  ? "text-brand-2 font-black dark:text-emerald-400"
                  : "text-muted hover:text-ink font-medium"
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
