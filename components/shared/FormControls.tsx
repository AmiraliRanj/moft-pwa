"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { Icon } from "@/components/moft/Icon";
import { FoodImage } from "@/components/moft/FoodImage";

export type SelectOption = { value: string; label: string; description?: string };

export function FormField({ label, hint, error, required, children, className = "" }: { label: string; hint?: string; error?: string; required?: boolean; children: ReactNode; className?: string }) {
  return <label className={`form-field ${className}`}><span>{label}{required && <b aria-hidden="true"> *</b>}</span>{children}{error ? <small className="field-error" role="alert">{error}</small> : hint ? <small>{hint}</small> : null}</label>;
}

export function SelectField({ label, value, options, onChange, required = false, disabled = false, className = "" }: { label: string; value: string; options: SelectOption[]; onChange: (value: string) => void; required?: boolean; disabled?: boolean; className?: string }) {
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
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", keydown); };
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

  return <div ref={rootRef} className={`custom-select ${open ? "open" : ""} ${className}`}>
    <span id={`${id}-label`} className="custom-select-label">{label}{required && <b aria-hidden="true"> *</b>}</span>
    <button ref={triggerRef} type="button" className="custom-select-trigger" aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="listbox" aria-expanded={open} disabled={disabled} onClick={() => setOpen((current) => !current)} onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); } }}>
      <span id={`${id}-value`}><strong>{selected?.label}</strong>{selected?.description && <small>{selected.description}</small>}</span><Icon name="chevron" />
    </button>
    {open && <div className="custom-select-popover" role="listbox" aria-labelledby={`${id}-label`} onKeyDown={moveOptionFocus}>
      <div className="custom-select-mobile-head"><strong>{label}</strong><button type="button" onClick={() => setOpen(false)} aria-label="بستن"><Icon name="close" /></button></div>
      {options.map((option, index) => <button ref={(node) => { optionRefs.current[index] = node; }} type="button" role="option" aria-selected={option.value === value} key={option.value} onClick={() => { onChange(option.value); setOpen(false); triggerRef.current?.focus(); }}>
        <span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>{option.value === value && <Icon name="check" />}
      </button>)}
    </div>}
  </div>;
}

export function BranchSelector({ value, options, onChange }: { value: string; options: SelectOption[]; onChange: (value: string) => void }) {
  return <div className="branch-selector"><Icon name="pin" /><SelectField label="انتخاب شعبه" value={value} options={options} onChange={onChange} /></div>;
}

export function UploadField({ value, onChange, label = "تصویر پیشنهاد", hint = "PNG، JPG یا WebP تا ۲ مگابایت", required = false }: { value: string; onChange: (value: string) => void; label?: string; hint?: string; required?: boolean }) {
  const inputId = useId();
  const [error, setError] = useState("");
  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("فرمت فایل باید تصویری باشد."); event.target.value = ""; return; }
    if (file.size > 2_000_000) { setError("حجم تصویر باید کمتر از ۲ مگابایت باشد."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { onChange(String(reader.result)); setError(""); };
    reader.onerror = () => setError("خواندن تصویر ممکن نشد. دوباره تلاش کنید.");
    reader.readAsDataURL(file);
  };

  return <div className="upload-field full-field">
    <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
    {value ? <div className="upload-preview"><span><FoodImage src={value} alt="پیش‌نمایش تصویر انتخاب‌شده" sizes="180px" /></span><div><label className="business-secondary" htmlFor={inputId}>جایگزینی تصویر</label><button type="button" className="danger-text" onClick={() => onChange("")}>حذف تصویر</button></div></div> : <label className="upload-dropzone" htmlFor={inputId}><Icon name="plus" /><strong>انتخاب تصویر</strong><small>{hint}</small></label>}
    <input id={inputId} className="visually-hidden-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} />
    {error && <small className="field-error" role="alert">{error}</small>}
  </div>;
}
