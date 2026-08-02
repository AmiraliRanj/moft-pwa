"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/moft/Icon";
import type { ThemePreference } from "@/types/moft";

export const THEME_STORAGE_KEY = "moft-theme-v2";

function applyTheme(preference: ThemePreference) {
  const hour = new Date().getHours();
  const resolved = preference === "system" ? (hour >= 7 && hour < 19 ? "light" : "dark") : preference;
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  root.dataset.themeReady = "true";
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#151816" : "#F4F8F3");
  document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute("content", resolved === "dark" ? "black-translucent" : "default");
}

export function useMoftTheme() {
  const [theme, setThemeState] = useState<ThemePreference>("system");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const initial = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    const hydrateTimer = window.setTimeout(() => { setThemeState(initial); applyTheme(initial); }, 0);
    const hourTimer = window.setInterval(() => {
      const current = localStorage.getItem(THEME_STORAGE_KEY);
      applyTheme(current === "light" || current === "dark" || current === "system" ? current : "system");
    }, 60_000);
    return () => { window.clearTimeout(hydrateTimer); window.clearInterval(hourTimer); };
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
  const next: ThemePreference = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const label = theme === "light" ? "پوسته روشن؛ تغییر به تاریک" : theme === "dark" ? "پوسته تاریک؛ تغییر به خودکار" : "پوسته خودکار؛ تغییر به روشن";
  return (
    <button className={`shared-theme-toggle ${compact ? "compact" : ""}`} type="button" onClick={() => setTheme(next)} aria-label={label} title={label}>
      <Icon name={theme === "dark" ? "moon" : theme === "light" ? "sun" : "spark"} />
      {!compact && <span>{theme === "light" ? "روشن" : theme === "dark" ? "تاریک" : "خودکار"}</span>}
    </button>
  );
}
