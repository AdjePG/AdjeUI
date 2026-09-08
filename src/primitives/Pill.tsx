"use client";

import { ReactNode } from "react";

// Badge/etiqueta redondeada. Sin color usa la superficie neutra; con color,
// tinta el fondo al 13% y el texto al 100%. Acepta hex o var(): lo normal es
// pasar un token de la paleta fija, p. ej. color={palette("green", 600)}.
export function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{
        background: color ? `color-mix(in srgb, ${color} 13%, transparent)` : "var(--hover)",
        color: color ?? "var(--foreground)",
      }}
    >
      {children}
    </span>
  );
}
