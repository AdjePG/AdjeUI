"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";

// ELEGIR, una sola familia (13 sep 2026). Antes había tres componentes para lo
// mismo —PickCard, ChoiceToggle y ChoiceOption— cada uno con su aspecto: el
// resultado es que en una misma app la opción elegida se marcaba de tres
// maneras distintas. Ahora hay UNO, ChoiceOption, y los otros dos se retiran.
//
// El lenguaje es el que mejor funcionaba (el de PickCard): borde en degradado
// + tic. Y la FORMA de la marca dice cuántas puedes elegir:
//   · redonda  → una sola (lo que antes era un radio)
//   · cuadrada → varias a la vez (lo que antes era un checkbox)
//
// El radio ya no lleva punto central: encendido es un círculo relleno con un
// tic, igual que el checkbox. Un punto y un tic significaban lo mismo con dos
// dibujos distintos.
//
//   <ChoiceOption checked={a===1} onToggle={…}>Una sola</ChoiceOption>
//   <ChoiceOption multiple checked={…} onToggle={…}>Varias</ChoiceOption>
//   <ChoiceOption checked icon={<Car/>} marca={false}>Tarjeta (lo de PickCard)</ChoiceOption>
//   <ChoiceOption checked tone="positive" align="center" icon={<Up/>}>Ingreso</ChoiceOption>

const TAMANOS = {
  sm: { marca: "h-4 w-4", cuadrada: "rounded-[5px]", tic: 10, fila: "px-2.5 py-2 text-[13px]", hueco: "gap-2" },
  md: { marca: "h-[18px] w-[18px]", cuadrada: "rounded-[6px]", tic: 12, fila: "px-3 py-2.5 text-sm", hueco: "gap-3" },
  lg: { marca: "h-5 w-5", cuadrada: "rounded-[7px]", tic: 13, fila: "px-3.5 py-3 text-[15px]", hueco: "gap-3" },
} as const;

export type ChoiceSize = keyof typeof TAMANOS;
export type ChoiceTone = "accent" | "positive" | "negative";

function colorDe(tone: ChoiceTone): string | undefined {
  return tone === "positive" ? "var(--positive)" : tone === "negative" ? "var(--negative)" : undefined;
}

// La marca: redonda si eliges una, cuadrada si puedes elegir varias. Encendida
// se rellena (con el degradado de la app, o con el color del tono) y enseña el
// tic. Exportada suelta para cuando necesitas la marca sin la fila entera —
// una tabla, una lista propia—, pero lo normal es usar ChoiceOption.
export function ChoiceMark({
  checked,
  multiple = false,
  size = "md",
  tone = "accent",
  className = "",
}: {
  checked: boolean;
  multiple?: boolean;
  size?: ChoiceSize;
  tone?: ChoiceTone;
  className?: string;
}) {
  const t = TAMANOS[size];
  const color = colorDe(tone);
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center border-2 transition ${t.marca} ${
        multiple ? t.cuadrada : "rounded-full"
      } ${checked ? "border-transparent text-white" : "border-[var(--border)]"} ${className}`}
      // backgroundOrigin border-box es OBLIGATORIO aquí: el borde de 2px es
      // transparente y el degradado se pinta por debajo (clip border-box), pero
      // por defecto el degradado se DIMENSIONA al padding-box. Resultado: esos
      // 2px de más repetían el color del extremo y dibujaban un recuadro dentro
      // del relleno — el corte que se veía entre el borde y el color interno.
      style={
        checked
          ? { backgroundImage: color ? `linear-gradient(${color}, ${color})` : "var(--app-gradient)", backgroundOrigin: "border-box" }
          : undefined
      }
    >
      <Check size={t.tic} strokeWidth={3.5} className={`transition-opacity ${checked ? "opacity-100" : "opacity-0"}`} />
    </span>
  );
}

export function ChoiceOption({
  checked,
  multiple = false,
  onToggle,
  disabled = false,
  icon,
  prefix,
  children,
  tone = "accent",
  marca = true,
  align = "start",
  size = "md",
  className = "",
}: {
  checked: boolean;
  /** true = se pueden elegir varias (marca cuadrada); false = una sola (redonda). */
  multiple?: boolean;
  onToggle: () => void;
  disabled?: boolean;
  /** Icono a la izquierda, antes de la etiqueta. */
  icon?: ReactNode;
  /** Letra o número delante (A, B, C…), para quizzes. */
  prefix?: ReactNode;
  children: ReactNode;
  /** Color del borde y de la marca: el de la app, o semántico. */
  tone?: ChoiceTone;
  /** false = sin marca a la izquierda; el tic se va a la derecha (tarjeta). */
  marca?: boolean;
  /** center para rejillas de dos opciones. */
  align?: "start" | "center";
  size?: ChoiceSize;
  className?: string;
}) {
  const t = TAMANOS[size];
  const color = colorDe(tone);

  // Elegida: borde en degradado (o del color del tono). Apagada: borde normal.
  const marco = checked
    ? color
      ? "border-transparent"
      : "borde-degradado"
    : "border-[var(--border)] hover:bg-[var(--hover)]";

  const estiloTono =
    checked && color
      ? { borderColor: color, background: `color-mix(in srgb, ${color} 12%, transparent)`, color }
      : undefined;

  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      style={estiloTono}
      className={`flex w-full items-center rounded-xl border-2 text-left transition ${t.fila} ${t.hueco} ${marco} ${
        align === "center" ? "justify-center" : ""
      } ${disabled ? "cursor-default opacity-50" : "cursor-pointer"} ${checked ? "font-semibold" : ""} ${className}`}
    >
      {marca && <ChoiceMark checked={checked} multiple={multiple} size={size} tone={tone} />}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {prefix != null && <span className="w-4 shrink-0 font-mono text-[11px] text-muted">{prefix}</span>}
      <span className={`min-w-0 ${align === "center" ? "" : "flex-1"}`}>{children}</span>
      {/* Sin marca a la izquierda, el tic se enseña aquí: así siempre hay UNA
          señal de "elegido", nunca dos ni ninguna. */}
      {!marca && checked && <Check size={15} className="ml-auto shrink-0" style={{ color: color ?? "var(--accent-blue)" }} />}
    </button>
  );
}
