"use client";

// Shared light/dark/system theme: one store for the whole page (every
// useTheme call sees the same value), saved in localStorage under the app's
// key and applied as data-theme on <html>.
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { LucideIcon, Monitor, Moon, Sun } from "lucide-react";

export type Theme = "system" | "light" | "dark";

const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
const LABEL: Record<Theme, string> = { system: "System", light: "Light", dark: "Dark" };
const ICON: Record<Theme, LucideIcon> = { system: Monitor, light: Sun, dark: Moon };

let current: Theme = "system";
let loadedKey: string | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function apply(theme: Theme) {
  current = theme;
  const el = document.documentElement;
  if (theme === "system") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", theme);
  listeners.forEach((l) => l());
}

function readSaved(key: string): Theme {
  try {
    const saved = localStorage.getItem(key);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

/** system → light → dark cycle, stored under `storageKey`. Ship an inline head script to avoid a flash on load. */
export function useTheme(storageKey: string): {
  theme: Theme;
  cycleTheme: () => void;
  themeLabel: string;
  ThemeIcon: LucideIcon;
} {
  const theme = useSyncExternalStore(
    subscribe,
    () => current,
    () => "system" as Theme,
  );

  useEffect(() => {
    if (loadedKey === storageKey) return;
    loadedKey = storageKey;
    apply(readSaved(storageKey));
  }, [storageKey]);

  const cycleTheme = useCallback(() => {
    const next = NEXT[current];
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // No storage: the theme lasts this visit.
    }
    apply(next);
  }, [storageKey]);

  return { theme, cycleTheme, themeLabel: LABEL[theme], ThemeIcon: ICON[theme] };
}
