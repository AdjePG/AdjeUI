"use client";

import { ReactNode } from "react";

// Control segmentado (píldora): un único estilo para TODOS los toggles de la
// app (filtros, vistas). La opción activa usa el degradado de identidad.
export function Segmented({
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
    <div className={`inline-flex rounded-xl border border-[var(--border)] overflow-hidden text-[13px] shrink-0 ${className}`}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            title={o.title}
            className={`inline-flex items-center gap-1.5 px-3.5 h-[var(--control-h)] transition ${
              active ? "text-white" : "hover:bg-[var(--hover)]"
            }`}
            style={active ? { background: "var(--app-gradient)" } : undefined}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
