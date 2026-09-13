"use client";

import { ReactNode } from "react";
import { ScrollArrows } from "./ScrollArrows";

// Grupo de botones excluyentes (filtros, vistas). La opción activa lleva el
// degradado de la app. Para subpáginas usa Tabs.
//
// Si no cabe en el ancho del contenedor no saca barra de desplazamiento:
// aparecen dos flechas en los extremos (13 sep 2026). `max-w-full` es lo que
// hace que se pueda estrechar sin desbordar al padre.
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
    <div className={`inline-flex max-w-full shrink-0 overflow-hidden rounded-xl border border-[var(--border)] text-[13px] ${className}`}>
      <ScrollArrows paso={120} className="w-full">
        <div className="flex w-max">
          {options.map((o) => {
            const active = value === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange(o.value)}
                title={o.title}
                className={`inline-flex h-[var(--control-h)] shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 transition ${
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
      </ScrollArrows>
    </div>
  );
}
