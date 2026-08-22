"use client";

import { ReactNode } from "react";

// Toggle de DOS opciones con tono semántico (verde/rojo): Ingreso/Gasto,
// Compra/Venta. Va a lo ancho, arriba del formulario.
export function ChoiceToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: ReactNode; tone: "positive" | "negative" }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => {
        const on = value === o.value;
        const color = o.tone === "positive" ? "var(--positive)" : "var(--negative)";
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-semibold border-2 transition ${
              on ? "" : "border-[var(--border)] hover:bg-[var(--hover)]"
            }`}
            style={on ? { borderColor: color, background: `color-mix(in srgb, ${color} 12%, transparent)`, color } : undefined}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
