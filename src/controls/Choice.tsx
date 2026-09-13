"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";

// Radio y checkbox del sistema (13 sep 2026). El input nativo con
// accent-color no se deja dimensionar, ignora el tema y en móvil sale de un
// tamaño distinto en cada navegador. Estos son CONTROLES VISUALES: el estado
// lo lleva quien los usa, y lo que se pulsa suele ser la fila entera, no el
// circulito.
//
//   <Radio checked={…} />           marca sola (dentro de tu propia fila)
//   <Checkbox checked={…} />
//   <ChoiceOption …>Texto</ChoiceOption>   fila completa, clicable entera
//
// Mismos tamaños que Switch: sm, md, lg.

const TAMANOS = {
  sm: { caja: "h-4 w-4", radio: "rounded-[5px]", tic: 10 },
  md: { caja: "h-[18px] w-[18px]", radio: "rounded-[6px]", tic: 12 },
  lg: { caja: "h-5 w-5", radio: "rounded-[7px]", tic: 13 },
} as const;

export type ChoiceSize = keyof typeof TAMANOS;

export function Radio({ checked, size = "md", className = "" }: { checked: boolean; size?: ChoiceSize; className?: string }) {
  const t = TAMANOS[size];
  return (
    <span
      aria-hidden
      className={`${t.caja} grid shrink-0 place-items-center rounded-full border-2 transition ${
        checked ? "border-[var(--accent-blue)]" : "border-[var(--border)]"
      } ${className}`}
    >
      <span
        className={`rounded-full transition-all ${checked ? "h-1/2 w-1/2" : "h-0 w-0"}`}
        style={{ background: "var(--accent-blue)" }}
      />
    </span>
  );
}

export function Checkbox({ checked, size = "md", className = "" }: { checked: boolean; size?: ChoiceSize; className?: string }) {
  const t = TAMANOS[size];
  return (
    <span
      aria-hidden
      className={`${t.caja} ${t.radio} grid shrink-0 place-items-center border-2 transition ${
        checked ? "border-transparent text-white" : "border-[var(--border)]"
      } ${className}`}
      style={checked ? { background: "var(--app-gradient)" } : undefined}
    >
      <Check size={t.tic} strokeWidth={3.5} className={checked ? "opacity-100" : "opacity-0"} />
    </span>
  );
}

// Fila completa de elección: toda la caja es el objetivo del clic, con el rol
// accesible correcto (radio o checkbox según `multiple`).
export function ChoiceOption({
  checked,
  multiple = false,
  onToggle,
  disabled = false,
  prefix,
  children,
  tone,
  size = "md",
  className = "",
}: {
  checked: boolean;
  /** true = casillas (varias a la vez); false = círculos (una sola). */
  multiple?: boolean;
  onToggle: () => void;
  disabled?: boolean;
  /** Letra o número a la izquierda (A, B, C…). */
  prefix?: ReactNode;
  children: ReactNode;
  /** Fuerza el color del borde, para señalar acierto o fallo al corregir. */
  tone?: "ok" | "mal";
  size?: ChoiceSize;
  className?: string;
}) {
  const borde =
    tone === "ok"
      ? "border-[var(--positive)] bg-[var(--positive)]/[0.07]"
      : tone === "mal"
        ? "border-[var(--negative)] bg-[var(--negative)]/[0.07]"
        : checked
          ? "border-[var(--accent-blue)] bg-[var(--hover)]"
          : "border-[var(--border)] hover:bg-[var(--hover)]";

  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${borde} ${
        disabled ? "cursor-default" : "cursor-pointer"
      } ${checked ? "font-medium" : ""} ${className}`}
    >
      {multiple ? <Checkbox checked={checked} size={size} /> : <Radio checked={checked} size={size} />}
      {prefix != null && <span className="w-4 shrink-0 font-mono text-[11px] text-muted">{prefix}</span>}
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}
