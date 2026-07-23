import { Icon } from "@/components/moft/Icon";

export function SearchBar({ value, onChange, placeholder = "جست‌وجوی فروشگاه یا بسته" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="search-box glass-medium">
      <span className="sr-only">جست‌وجو</span>
      <Icon name="search" />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete="off" />
      {value && <button type="button" onClick={() => onChange("")} aria-label="پاک کردن جست‌وجو"><Icon name="close" /></button>}
    </label>
  );
}
