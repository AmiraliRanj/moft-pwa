"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/moft/Icon";
import type { ThemePreference } from "@/types/moft";

export const THEME_STORAGE_KEY = "moft-theme-v2";

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "auto") {
    const hour = new Date().getHours();
    // Night is from 19:00 (7 PM) to 07:00 (7 AM)
    return hour >= 19 || hour < 7 ? "dark" : "light";
  }
  return preference;
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  root.dataset.themeMode = preference;
  root.dataset.themeReady = "true";
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#1D1E21" : "#FAF9F7");
  document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute("content", resolved === "dark" ? "black-translucent" : "default");
}

export function useMoftTheme() {
  const [theme, setThemeState] = useState<ThemePreference>("light");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
    const initial: ThemePreference = saved === "dark" || saved === "auto" ? saved : "light";
    const hydrateTimer = window.setTimeout(() => { setThemeState(initial); applyTheme(initial); }, 0);
    const onThemeChange = (event: Event) => {
      const next = (event as CustomEvent<ThemePreference>).detail;
      if (next === "light" || next === "dark" || next === "auto") setThemeState(next);
    };
    window.addEventListener("moft-theme-change", onThemeChange);

    // Periodically re-check clock if in auto mode
    const clockInterval = window.setInterval(() => {
      const current = (localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null) || "light";
      if (current === "auto") {
        applyTheme("auto");
      }
    }, 60000);

    return () => {
      window.clearTimeout(hydrateTimer);
      window.clearInterval(clockInterval);
      window.removeEventListener("moft-theme-change", onThemeChange);
    };
  }, []);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
    window.dispatchEvent(new CustomEvent("moft-theme-change", { detail: next }));
  }, []);

  const resolvedTheme = resolveTheme(theme);

  return { theme, setTheme, resolvedTheme };
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useMoftTheme();
  const next: ThemePreference = resolvedTheme === "light" ? "dark" : "light";
  const label = resolvedTheme === "light" ? "تغییر به حالت تاریک" : "تغییر به حالت روشن";
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
      <span className="[&>svg]:w-5 [&>svg]:h-5"><Icon name={resolvedTheme === "dark" ? "moon" : "sun"} /></span>
      {!compact && <span className="text-xs font-bold">{theme === "auto" ? "خودکار" : theme === "dark" ? "تاریک" : "روشن"}</span>}
    </button>
  );
}
