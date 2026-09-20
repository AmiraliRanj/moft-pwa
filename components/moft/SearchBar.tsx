import { Icon } from "@/components/moft/Icon";

export function SearchBar({
  value,
  onChange,
  placeholder = "جست‌وجوی فروشگاه یا بسته",
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <label className="relative flex items-center gap-2.5 h-11 px-3.5 rounded-2xl bg-surface border border-line shadow-xs focus-within:border-brand-2/50 focus-within:ring-2 focus-within:ring-brand-2/10 transition-all">
      <span className="sr-only">جست‌وجو</span>
      <Icon name="search" className="w-4 h-4 text-muted shrink-0" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-transparent text-xs text-ink placeholder:text-muted focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="پاک کردن جست‌وجو"
          className="min-w-[36px] min-h-[36px] -me-1.5 rounded-full grid place-items-center text-muted hover:text-ink shrink-0 transition-colors cursor-pointer"
        >
          <span className="w-5 h-5 rounded-full bg-canvas grid place-items-center">
            <Icon name="close" className="w-3 h-3" />
          </span>
        </button>
      )}
    </label>
  );
}
