"use client";

import { ReactNode } from "react";
import { ScrollArrows } from "./ScrollArrows";
import type { ControlSize } from "./Button";

// Grupo de botones excluyentes (filtros, vistas). La opción activa lleva el
// degradado de la app. Para subpáginas usa Tabs.
//
// Tamaños sm / md / lg como Button, Input y Select: el Segmented que va al
// lado de un botón pequeño tiene que medir lo mismo que él.
//
// Si no cabe en el ancho del contenedor no saca barra de desplazamiento:
// aparecen dos flechas en los extremos (13 sep 2026). `max-w-full` es lo que
// hace que se pueda estrechar sin desbordar al padre.

const TAMANOS: Record<ControlSize, { alto: string; texto: string; lados: string; radio: string }> = {
  sm: { alto: "h-[var(--control-h-sm)]", texto: "text-[12px]", lados: "px-2.5", radio: "rounded-lg" },
  md: { alto: "h-[var(--control-h)]", texto: "text-[13px]", lados: "px-3.5", radio: "rounded-xl" },
  lg: { alto: "h-[var(--control-h-lg)]", texto: "text-[15px]", lados: "px-[18px]", radio: "rounded-xl" },
};

export function Segmented({
  value,
  onChange,
  options,
  size = "md",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label?: ReactNode; icon?: ReactNode; title?: string }[];
  size?: ControlSize;
  className?: string;
}) {
  const t = TAMANOS[size];
  return (
    <div
      className={`inline-flex max-w-full shrink-0 overflow-hidden border border-[var(--border)] ${t.radio} ${t.texto} ${className}`}
    >
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
                className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap transition ${t.alto} ${t.lados} ${
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
