import { Icon, type IconName } from "@/components/moft/Icon";
import type { AppTab } from "@/types/moft";
import { AnimatedNumber } from "@/components/moft/AnimatedNumber";
import { GlassSegmentedControl } from "@/components/glass/GlassSegmentedControl";

const items: Array<{ id: AppTab; label: string; icon: IconName }> = [
  { id: "home", label: "خانه", icon: "home" },
  { id: "discover", label: "کشف", icon: "search" },
  { id: "reservations", label: "رزروهای من", icon: "bag" },
  { id: "profile", label: "پروفایل", icon: "user" },
];

export function BottomNavigation({
  value,
  onChange,
  reservationCount,
}: {
  value: AppTab;
  onChange: (tab: AppTab) => void;
  reservationCount: number;
}) {
  const options = items.map((item) => ({
    value: item.id,
    ariaLabel: item.label,
    label: (
      <span className="flex flex-col items-center justify-center gap-0.5 relative py-1">
        <span className="relative">
          <Icon name={item.icon} className="w-5 h-5" />
          {item.id === "reservations" && reservationCount > 0 && (
            <b className="absolute -top-1.5 -end-2.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-2 text-white text-[10px] font-black grid place-items-center leading-none">
              <AnimatedNumber value={reservationCount} />
            </b>
          )}
        </span>
        <small className="text-[10px] font-medium leading-none">{item.label}</small>
      </span>
    ),
  }));

  return (
    <nav className="fixed bottom-3 inset-x-4 z-40 max-w-md mx-auto" aria-label="ناوبری اصلی">
      <GlassSegmentedControl
        value={value}
        options={options}
        onChange={onChange}
        ariaLabel="بخش‌های اصلی دیبز"
        className="bottom-nav shadow-lg"
        preset="navigation"
      />
    </nav>
  );
}
