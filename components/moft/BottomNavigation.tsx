import { Icon, type IconName } from "@/components/moft/Icon";
import { numberFa } from "@/lib/moft-format";
import type { AppTab } from "@/types/moft";
import { LiquidGlassLens } from "@/components/moft/LiquidGlassLens";

const items: Array<{ id: AppTab; label: string; icon: IconName }> = [
  { id: "home", label: "خانه", icon: "home" },
  { id: "discover", label: "کشف", icon: "search" },
  { id: "reservations", label: "رزروهای من", icon: "bag" },
  { id: "profile", label: "پروفایل", icon: "user" }
];

export function BottomNavigation({ value, onChange, reservationCount }: { value: AppTab; onChange: (tab: AppTab) => void; reservationCount: number }) {
  return (
    <nav className="bottom-nav-shell" aria-label="ناوبری اصلی">
      <div className="bottom-nav">
      {items.map((item) => (
        <button key={item.id} className={value === item.id ? "active" : ""} type="button" onClick={() => onChange(item.id)} aria-current={value === item.id ? "page" : undefined}>
          {value === item.id && <LiquidGlassLens />}
          <span className="nav-icon"><Icon name={item.icon} />{item.id === "reservations" && reservationCount > 0 && <b>{numberFa(reservationCount)}</b>}</span>
          <small>{item.label}</small>
        </button>
      ))}
      </div>
    </nav>
  );
}
