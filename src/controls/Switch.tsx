"use client";

// Interruptor booleano para ajustes y filtros. Encendido usa el degradado de
// la app; apagado, la superficie neutra con borde.
//
// Tres tamaños (13 sep 2026): sm para filas densas y tablas, md por defecto,
// lg para un ajuste que manda en la pantalla. La bolita y el recorrido salen
// de la misma tabla para que nunca se descuadren.

const TAMANOS = {
  sm: { pista: "h-4 w-7", bola: "h-3 w-3", apagado: "translate-x-[2px]", encendido: "translate-x-[14px]" },
  md: { pista: "h-6 w-11", bola: "h-[18px] w-[18px]", apagado: "translate-x-[3px]", encendido: "translate-x-[22px]" },
  lg: { pista: "h-7 w-[52px]", bola: "h-[22px] w-[22px]", apagado: "translate-x-[3px]", encendido: "translate-x-[27px]" },
} as const;

export type SwitchSize = keyof typeof TAMANOS;

export function Switch({
  checked,
  onChange,
  disabled,
  label,
  size = "md",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: SwitchSize;
}) {
  const t = TAMANOS[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 items-center rounded-full border transition disabled:opacity-40 disabled:cursor-not-allowed ${t.pista}`}
      style={
        checked
          ? { background: "var(--app-gradient)", borderColor: "transparent" }
          : { background: "var(--hover)", borderColor: "var(--border)" }
      }
    >
      <span
        className={`inline-block rounded-full bg-white shadow transition-transform ${t.bola} ${
          checked ? t.encendido : t.apagado
        }`}
      />
    </button>
  );
}
