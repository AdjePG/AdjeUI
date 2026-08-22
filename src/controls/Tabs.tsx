"use client";

import { ReactNode } from "react";

// Barra de pestañas de texto con subrayado degradado en la activa (estilo
// navegador/YouTube). Para subpáginas; para filtros/toggles usa Segmented.
export function Tabs({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label?: ReactNode; icon?: ReactNode; title?: string }[];
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            title={o.title}
            className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition ${
              active ? "text-[var(--foreground)]" : "text-muted hover:text-[var(--foreground)]"
            }`}
          >
            {o.icon}
            {o.label}
            {active && (
              <span
                className="absolute left-2 right-2 -bottom-0.5 h-[3px] rounded-full"
                style={{ background: "var(--app-gradient)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
