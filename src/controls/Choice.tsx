"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";

// Radio y checkbox del sistema. El input nativo con accent-color no se deja
// dimensionar, ignora el tema y sale de un tamaño distinto en cada navegador.
// Estos son CONTROLES VISUALES: el estado lo lleva quien los usa, y en una
// lista de opciones lo que se pulsa es la fila entera, no el circulito.
//
//   <Radio checked={…} />                     marca sola, en tu propia fila
//   <Checkbox checked={…} />
//   <ChoiceOption …>Texto</ChoiceOption>      fila completa, clicable entera
//
// Los dos se rellenan con el degradado de la app al marcarse: la diferencia
// es la forma (círculo o cuadrado) y lo que llevan dentro (punto o tic), que
// es justo lo que distingue "elige una" de "elige las que quieras".
//
// Tamaños sm / md / lg, la misma escala que Switch.

const TAMANOS = {
  sm: { caja: "h-4 w-4", radio: "rounded-[5px]", tic: 10, punto: "h-1.5 w-1.5" },
  md: { caja: "h-[18px] w-[18px]", radio: "rounded-[6px]", tic: 12, punto: "h-[7px] w-[7px]" },
  lg: { caja: "h-5 w-5", radio: "rounded-[7px]", tic: 13, punto: "h-2 w-2" },
} as const;

export type ChoiceSize = keyof typeof TAMANOS;

const BASE = "grid shrink-0 place-items-center border-2 transition";
const APAGADO = "border-[var(--border)]";
const ENCENDIDO = "border-transparent text-white";

export function Radio({ checked, size = "md", className = "" }: { checked: boolean; size?: ChoiceSize; className?: string }) {
  const t = TAMANOS[size];
  return (
    <span
      aria-hidden
      className={`${BASE} ${t.caja} rounded-full ${checked ? ENCENDIDO : APAGADO} ${className}`}
      style={checked ? { background: "var(--app-gradient)" } : undefined}
    >
      {/* Punto blanco centrado y de tamaño fijo: con porcentajes bailaba según
          el grosor del borde y se veía descentrado. */}
      <span className={`rounded-full bg-white transition-transform ${t.punto} ${checked ? "scale-100" : "scale-0"}`} />
    </span>
  );
}

export function Checkbox({ checked, size = "md", className = "" }: { checked: boolean; size?: ChoiceSize; className?: string }) {
  const t = TAMANOS[size];
  return (
    <span
      aria-hidden
      className={`${BASE} ${t.caja} ${t.radio} ${checked ? ENCENDIDO : APAGADO} ${className}`}
      style={checked ? { background: "var(--app-gradient)" } : undefined}
    >
      <Check size={t.tic} strokeWidth={3.5} className={`transition-opacity ${checked ? "opacity-100" : "opacity-0"}`} />
    </span>
  );
}

// Fila completa de elección: toda la caja es el objetivo del clic, con el rol
// accesible correcto (radio o checkbox según `multiple`). Elegida se marca con
// borde en degradado, igual que PickCard — el acento plano no se distinguía
// del borde normal en tema oscuro.
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
  const marco =
    tone === "ok"
      ? "border-[var(--positive)] bg-[var(--positive)]/[0.07]"
      : tone === "mal"
        ? "border-[var(--negative)] bg-[var(--negative)]/[0.07]"
        : checked
          ? "borde-degradado"
          : "border-[var(--border)] hover:bg-[var(--hover)]";

  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition ${marco} ${
        disabled ? "cursor-default" : "cursor-pointer"
      } ${checked ? "font-medium" : ""} ${className}`}
    >
      {multiple ? <Checkbox checked={checked} size={size} /> : <Radio checked={checked} size={size} />}
      {prefix != null && <span className="w-4 shrink-0 font-mono text-[11px] text-muted">{prefix}</span>}
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}
