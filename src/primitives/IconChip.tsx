"use client";

import { ReactNode } from "react";

// Chip cuadrado con el degradado de identidad de la app, para iconos de
// títulos y cabeceras.
export function IconChip({ children, size = "md" }: { children: ReactNode; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "w-8 h-8 rounded-xl" : "w-7 h-7 rounded-lg";
  return (
    <span
      className={`inline-flex items-center justify-center text-white shrink-0 ${cls}`}
      style={{ background: "var(--app-gradient)" }}
    >
      {children}
    </span>
  );
}
