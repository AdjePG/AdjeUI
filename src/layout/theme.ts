"use client";

// Tema claro/oscuro/sistema compartido: guarda la elección en localStorage
// (clave propia de cada app) y aplica data-theme al <html>. Antes cada app
// duplicaba esta lógica en su Sidebar.
import { useEffect, useState } from "react";
import { LucideIcon, Monitor, Moon, Sun } from "lucide-react";

export type Theme = "system" | "light" | "dark";

function applyTheme(t: Theme) {
  const el = document.documentElement;
  if (t === "system") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", t);
}

export function useTheme(storageKey: string): {
  theme: Theme;
  cycleTheme: () => void;
  themeLabel: string;
  ThemeIcon: LucideIcon;
} {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = (localStorage.getItem(storageKey) as Theme) || "system";
    setTheme(saved);
    applyTheme(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cycleTheme() {
    const next: Theme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    localStorage.setItem(storageKey, next);
    applyTheme(next);
  }

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const themeLabel = theme === "light" ? "Claro" : theme === "dark" ? "Oscuro" : "Sistema";

  return { theme, cycleTheme, themeLabel, ThemeIcon };
}
