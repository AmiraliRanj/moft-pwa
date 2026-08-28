import { Icon, type IconName } from "@/components/moft/Icon";
import type { AppTab } from "@/types/moft";
import { AnimatedNumber } from "@/components/moft/AnimatedNumber";
import { GlassSegmentedControl } from "@/components/glass/GlassSegmentedControl";

const items: Array<{ id: AppTab; label: string; icon: IconName }> = [
  { id: "home", label: "خانه", icon: "home" },
  { id: "discover", label: "کشف", icon: "search" },
  { id: "reservations", label: "رزروهای من", icon: "bag" },
  { id: "profile", label: "پروفایل", icon: "user" }
];

export function BottomNavigation({ value, onChange, reservationCount }: { value: AppTab; onChange: (tab: AppTab) => void; reservationCount: number }) {
  const options = items.map((item) => ({
    value: item.id,
    ariaLabel: item.label,
    label: <><span className="nav-icon"><Icon name={item.icon} />{item.id === "reservations" && reservationCount > 0 && <b><AnimatedNumber value={reservationCount} /></b>}</span><small>{item.label}</small></>,
  }));
  return (
    <nav className="bottom-nav-shell" aria-label="ناوبری اصلی">
      <GlassSegmentedControl value={value} options={options} onChange={onChange} ariaLabel="بخش‌های اصلی دیبز" className="bottom-nav" preset="navigation" />
    </nav>
  );
}
