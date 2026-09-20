"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/moft/Icon";
import type { ThemePreference } from "@/types/moft";

export const THEME_STORAGE_KEY = "moft-theme-v2";

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  root.dataset.theme = preference;
  root.style.colorScheme = preference;
  root.dataset.themeReady = "true";
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", preference === "dark" ? "#151816" : "#F4F8F3");
  document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute("content", preference === "dark" ? "black-translucent" : "default");
}

export function useMoftTheme() {
  const [theme, setThemeState] = useState<ThemePreference>("light");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const initial = saved === "dark" ? "dark" : "light";
    const hydrateTimer = window.setTimeout(() => { setThemeState(initial); applyTheme(initial); }, 0);
    const onThemeChange = (event: Event) => {
      const next = (event as CustomEvent<ThemePreference>).detail;
      if (next === "light" || next === "dark") setThemeState(next);
    };
    window.addEventListener("moft-theme-change", onThemeChange);
    return () => { window.clearTimeout(hydrateTimer); window.removeEventListener("moft-theme-change", onThemeChange); };
  }, []);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
    window.dispatchEvent(new CustomEvent("moft-theme-change", { detail: next }));
  }, []);

  return { theme, setTheme };
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useMoftTheme();
  const next: ThemePreference = theme === "light" ? "dark" : "light";
  const label = theme === "light" ? "تغییر به حالت تاریک" : "تغییر به حالت روشن";
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface text-brand-2 shadow-xs transition-colors hover:bg-surface-raised active:scale-95 cursor-pointer ${
        compact ? "h-11 w-11 min-w-[44px] p-0" : "min-h-[44px] min-w-[92px] px-3.5"
      }`}
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
    >
      <span className="[&>svg]:w-5 [&>svg]:h-5"><Icon name={theme === "dark" ? "moon" : "sun"} /></span>
      {!compact && <span className="text-xs font-bold">{theme === "light" ? "روشن" : "تاریک"}</span>}
    </button>
  );
}
