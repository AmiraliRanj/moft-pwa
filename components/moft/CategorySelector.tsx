import { categories } from "@/data/offers";
import type { CategoryId } from "@/types/moft";

export function CategorySelector({ value, onChange }: { value: CategoryId; onChange: (value: CategoryId) => void }) {
  return (
    <div className="category-row" role="group" aria-label="دسته‌بندی فروشگاه‌ها">
      {categories.map((item) => (
        <button key={item.id} className={`category-chip ${value === item.id ? "active" : ""}`} type="button" onClick={() => onChange(item.id)} aria-pressed={value === item.id}>
          <span aria-hidden="true">{item.icon}</span>{item.label}
        </button>
      ))}
    </div>
  );
}
