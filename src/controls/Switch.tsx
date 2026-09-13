"use client";

// Interruptor de encendido/apagado. Encendido usa el degradado de la app;
// apagado, la superficie neutra con borde.
//
// Ojo con cuándo usarlo: el Switch dice "esto está activado o no". Para elegir
// entre opciones —una o varias— es ChoiceOption. Si en la misma fila conviven
// los dos, tienen que leerse como parientes y no como dos cosas del mismo peso:
// por eso el interruptor se redimensionó el 13 sep 2026 para ir a la par de la
// marca de ChoiceOption (antes, un md medía 24px de alto contra los 18px de la
// marca de al lado, y parecía el elemento principal de la fila sin serlo).
//
// Tamaños sm / md / lg, la misma escala que ChoiceOption.

const TAMANOS = {
  sm: { pista: "h-4 w-7", bola: "h-2.5 w-2.5", apagado: "translate-x-[2px]", encendido: "translate-x-[13px]" },
  md: { pista: "h-5 w-9", bola: "h-3.5 w-3.5", apagado: "translate-x-[2px]", encendido: "translate-x-[17px]" },
  lg: { pista: "h-6 w-11", bola: "h-[18px] w-[18px]", apagado: "translate-x-[2px]", encendido: "translate-x-[21px]" },
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
      className={`relative inline-flex shrink-0 items-center rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${t.pista}`}
      // backgroundOrigin border-box: el borde de 2px es transparente y el
      // degradado se pinta por debajo, pero por defecto se DIMENSIONA al
      // padding-box y esos 2px repiten el color del extremo — se veía un
      // recuadro cortado dentro de la pista. Mismo motivo que en ChoiceMark.
      style={
        checked
          ? { backgroundImage: "var(--app-gradient)", backgroundOrigin: "border-box", borderColor: "transparent" }
          : { background: "transparent", borderColor: "var(--border)" }
      }
    >
      <span
        className={`inline-block rounded-full shadow-sm transition-transform ${t.bola} ${
          checked ? t.encendido : t.apagado
        }`}
        style={{ background: checked ? "#fff" : "var(--muted)" }}
      />
    </button>
  );
}
