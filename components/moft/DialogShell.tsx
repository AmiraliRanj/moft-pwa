"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { Icon } from "@/components/moft/Icon";

export function DialogShell({
  titleId,
  label,
  onClose,
  children,
  size = "sheet",
}: {
  titleId?: string;
  label?: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sheet" | "center" | "detail" | "fullscreen";
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add("overflow-hidden");
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, []);

  const onBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const isCentered = size === "center";
  const isFullscreen = size === "fullscreen";

  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        isFullscreen
          ? "items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
          : isCentered
          ? "items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          : "items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      }`}
      onMouseDown={onBackdrop}
    >
      <section
        ref={dialogRef}
        className={`relative w-full ${
          isFullscreen
            ? "max-w-none sm:max-w-lg h-dvh max-h-dvh sm:max-h-[92vh] sm:h-[92vh]"
            : size === "detail"
            ? "max-w-md max-h-[92dvh] sm:max-h-[90vh]"
            : isCentered
            ? "max-w-sm max-h-[85dvh] sm:max-h-[85vh]"
            : "max-w-md max-h-[85dvh] sm:max-h-[85vh]"
        } overflow-hidden flex flex-col ${
          isFullscreen
            ? "rounded-none sm:rounded-3xl border-0 sm:border sm:border-line"
            : isCentered
            ? "rounded-3xl border border-line"
            : "rounded-t-[28px] rounded-b-none sm:rounded-3xl border border-line border-b-0 sm:border-b"
        } bg-surface shadow-2xl animate-in slide-in-from-bottom duration-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={label}
      >
        <button
          ref={closeRef}
          className={`absolute top-[max(0.875rem,env(safe-area-inset-top))] end-3.5 z-20 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full grid place-items-center transition-colors cursor-pointer active:scale-95 ${
            isFullscreen
              ? "bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 shadow-md"
              : size === "detail"
              ? "bg-surface/80 border border-line backdrop-blur-md text-muted hover:text-ink"
              : "text-muted hover:text-ink hover:bg-canvas"
          }`}
          type="button"
          onClick={onClose}
          aria-label="بستن"
        >
          <Icon name="close" className="w-5 h-5" />
        </button>
        {children}
      </section>
    </div>
  );
}
