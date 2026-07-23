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
  grocery: "cart"
};

export function CategorySelector({ value, onChange }: { value: CategoryId; onChange: (value: CategoryId) => void }) {
  return (
    <div className="category-row" role="group" aria-label="دسته‌بندی فروشگاه‌ها">
      {categories.map((item) => (
        <button key={item.id} className={`category-chip glass-medium ${value === item.id ? "active" : ""}`} type="button" onClick={() => onChange(item.id)} aria-pressed={value === item.id}>
          <Icon name={categoryIcons[item.id]} />{item.label}
        </button>
      ))}
    </div>
  );
}
