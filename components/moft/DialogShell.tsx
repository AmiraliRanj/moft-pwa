"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { Icon } from "@/components/moft/Icon";

export function DialogShell({ titleId, label, onClose, children, size = "sheet" }: { titleId?: string; label?: string; onClose: () => void; children: ReactNode; size?: "sheet" | "center" | "detail" }) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add("dialog-open");
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("dialog-open");
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, []);

  const onBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const isCentered = size === "center" || size === "detail";

  return (
    <div className={`dialog-layer ${isCentered ? "centered" : ""} ${size === "detail" ? "detail-layer" : ""}`} onMouseDown={onBackdrop}>
      <section ref={dialogRef} className={`dialog-panel glass-strong ${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-label={label}>
        <button ref={closeRef} className="dialog-close" type="button" onClick={onClose} aria-label="بستن"><Icon name="close" /></button>
        {children}
      </section>
    </div>
  );
}
