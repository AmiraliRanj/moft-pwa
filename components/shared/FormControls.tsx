"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { Icon } from "@/components/moft/Icon";
import { FoodImage } from "@/components/moft/FoodImage";

export type SelectOption = { value: string; label: string; description?: string };

export function FormField({
  label,
  hint,
  error,
  required,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-start ${className}`}>
      <span className="text-xs font-bold text-ink">
        {label}
        {required && <b className="text-danger" aria-hidden="true"> *</b>}
      </span>
      {children}
      {error ? (
        <small className="text-xs font-medium text-danger" role="alert">
          {error}
        </small>
      ) : hint ? (
        <small className="text-xs text-muted">{hint}</small>
      ) : null}
    </label>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  className = "",
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", keydown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
    const timer = window.setTimeout(() => optionRefs.current[selectedIndex]?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open, options, value]);

  const moveOptionFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const currentIndex = optionRefs.current.findIndex((option) => option === document.activeElement);
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = Math.min(options.length - 1, Math.max(0, currentIndex + 1));
    else if (event.key === "ArrowUp") nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else return;
    event.preventDefault();
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div ref={rootRef} className={`relative flex flex-col gap-1.5 text-start ${className}`}>
      <span id={`${id}-label`} className="text-xs font-bold text-ink">
        {label}
        {required && <b className="text-danger" aria-hidden="true"> *</b>}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border border-line bg-surface-raised px-3 py-2 text-start text-sm text-ink shadow-xs transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span id={`${id}-value`} className="flex flex-col overflow-hidden">
          <strong className="truncate font-bold text-ink">{selected?.label}</strong>
          {selected?.description && <small className="truncate text-xs text-muted">{selected.description}</small>}
        </span>
        <span className="shrink-0 text-muted [&>svg]:w-4 [&>svg]:h-4">
          <Icon name="chevron" />
        </span>
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            type="button"
            tabIndex={-1}
            aria-label={`بستن ${label}`}
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed sm:absolute bottom-0 sm:bottom-auto sm:top-full start-0 end-0 z-50 mt-1 max-h-[70vh] sm:max-h-60 overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-line bg-surface-raised p-2 shadow-xl sm:shadow-lg focus:outline-none"
            role="listbox"
            aria-labelledby={`${id}-label`}
            onKeyDown={moveOptionFocus}
          >
            <div className="flex items-center justify-between border-b border-line pb-2 mb-2 sm:hidden px-2">
              <strong className="text-sm font-bold text-ink">{label}</strong>
              <button
                type="button"
                className="p-1 text-muted hover:text-ink [&>svg]:w-5 [&>svg]:h-5"
                onClick={() => setOpen(false)}
                aria-label="بستن"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <button
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    key={option.value}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm transition-colors cursor-pointer ${
                      isSelected ? "bg-brand-soft text-brand font-bold" : "text-ink hover:bg-canvas-soft"
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                  >
                    <span className="flex flex-col">
                      <strong className="font-bold">{option.label}</strong>
                      {option.description && <small className="text-xs text-muted">{option.description}</small>}
                    </span>
                    {isSelected && (
                      <span className="shrink-0 text-brand-2 [&>svg]:w-4 [&>svg]:h-4">
                        <Icon name="check" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function BranchSelector({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-brand-2 shrink-0 [&>svg]:w-5 [&>svg]:h-5">
        <Icon name="pin" />
      </span>
      <div className="min-w-[150px] sm:min-w-[190px]">
        <SelectField label="انتخاب شعبه" value={value} options={options} onChange={onChange} />
      </div>
    </div>
  );
}

export function UploadField({
  value,
  onChange,
  label = "تصویر پیشنهاد",
  hint = "PNG، JPG یا WebP تا ۲ مگابایت",
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  required?: boolean;
}) {
  const inputId = useId();
  const [error, setError] = useState("");

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("فرمت فایل باید تصویری باشد.");
      event.target.value = "";
      return;
    }
    if (file.size > 2_000_000) {
      setError("حجم تصویر باید کمتر از ۲ مگابایت باشد.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      setError("");
    };
    reader.onerror = () => setError("خواندن تصویر ممکن نشد. دوباره تلاش کنید.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-1.5 text-start w-full">
      <span className="text-xs font-bold text-ink">
        {label}
        {required && <b className="text-danger" aria-hidden="true"> *</b>}
      </span>
      {value ? (
        <div className="flex items-center gap-4 p-3 rounded-2xl border border-line bg-surface-raised">
          <span className="h-16 w-16 overflow-hidden rounded-xl border border-line shrink-0">
            <FoodImage src={value} alt="پیش‌نمایش تصویر انتخاب‌شده" sizes="180px" />
          </span>
          <div className="flex items-center gap-3">
            <label
              className="inline-flex min-h-[38px] items-center justify-center rounded-xl border border-line bg-surface px-3 text-xs font-bold text-ink hover:bg-surface-raised cursor-pointer transition-colors"
              htmlFor={inputId}
            >
              جایگزینی تصویر
            </label>
            <button
              type="button"
              className="text-xs font-bold text-danger hover:underline cursor-pointer"
              onClick={() => onChange("")}
            >
              حذف تصویر
            </button>
          </div>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center gap-1.5 p-6 rounded-2xl border-2 border-dashed border-line bg-surface/50 text-center hover:border-brand-2/50 cursor-pointer transition-colors"
          htmlFor={inputId}
        >
          <span className="text-brand-2 [&>svg]:w-6 [&>svg]:h-6">
            <Icon name="plus" />
          </span>
          <strong className="text-sm font-bold text-ink">انتخاب تصویر</strong>
          <small className="text-xs text-muted">{hint}</small>
        </label>
      )}
      <input
        id={inputId}
        className="sr-only"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onFile}
      />
      {error && (
        <small className="text-xs font-medium text-danger" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
