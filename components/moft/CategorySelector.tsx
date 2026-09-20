import { categories } from "@/data/offers";
import { Icon, type IconName } from "@/components/moft/Icon";
import type { CategoryId } from "@/types/moft";

const categoryIcons: Record<CategoryId, IconName> = {
  all: "grid",
  cafe: "coffee",
  restaurant: "utensils",
  "fast-food": "pizza",
  bakery: "bread",
  confectionery: "cake",
  fruit: "apple",
  grocery: "cart",
};

export function CategorySelector({
  value,
  onChange,
}: {
  value: CategoryId;
  onChange: (value: CategoryId) => void;
}) {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none"
      style={{ scrollbarWidth: "none" }}
      role="group"
      aria-label="دسته‌بندی فروشگاه‌ها"
    >
      {categories.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-pressed={active}
            className={`flex flex-col items-center gap-1.5 p-1.5 rounded-2xl shrink-0 transition-all ${
              active
                ? "text-brand-2 font-bold"
                : "text-muted hover:text-ink"
            }`}
          >
            <span
              className={`w-12 h-12 rounded-2xl grid place-items-center transition-all ${
                active
                  ? "bg-brand-soft text-brand-2 shadow-xs ring-2 ring-brand-2/30"
                  : "bg-surface border border-line text-muted hover:border-brand-2/30"
              }`}
            >
              <Icon name={categoryIcons[item.id]} className="w-5 h-5" />
            </span>
            <span className="text-[11px] whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
