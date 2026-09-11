"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useFieldInvalid } from "./Field";
import type { ControlSize } from "../controls/Button";

// Piel común de los campos (borde, fondo, foco), SIN tamaño.
const inputBase =
  "w-full border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--accent-blue)] disabled:opacity-50 disabled:cursor-not-allowed";

// Clase base de los inputs en talla md (compatibilidad: las apps la usaban
// directamente en elementos nativos). SIN altura: la altura la ponen Input
// (fija) y Textarea (mínima).
export const inputCls = `${inputBase} rounded-xl px-3 py-2 text-sm`;

// Tallas: las MISMAS alturas, radios y tipografía que Button (tokens
// --control-h-*), para que un input y su botón de al lado midan igual.
export const INPUT_SIZES: Record<ControlSize, string> = {
  sm: "h-[var(--control-h-sm)] px-2.5 text-[13px] rounded-lg",
  md: "h-[var(--control-h)] px-3 text-sm rounded-xl",
  lg: "h-[var(--control-h-lg)] px-3.5 text-[15px] rounded-xl",
};

const invalidCls = "!border-[var(--negative)]";

// Input de línea con ALTURA FIJA por talla (--control-h-*), la misma que
// Button y Select: nunca un control más alto que otro. Cubre también
// type="date"/"time"/… (el nativo trae alturas distintas; aquí queda igualado,
// ver theme.css). Dentro de un <Field error="…"> se pinta en rojo solo.
//   <Input size="sm" … /> junto a <Button size="sm">…</Button>
export function Input({
  className = "",
  invalid,
  size = "md",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & { invalid?: boolean; size?: ControlSize }) {
  const fieldInvalid = useFieldInvalid();
  const bad = invalid ?? fieldInvalid;
  return (
    <input
      {...props}
      aria-invalid={bad || undefined}
      className={`${inputBase} ${INPUT_SIZES[size]} ${bad ? invalidCls : ""} ${className}`}
    />
  );
}

// Área de texto con la misma piel que Input, altura libre (min-h + resize).
export function Textarea({
  className = "",
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  const fieldInvalid = useFieldInvalid();
  const bad = invalid ?? fieldInvalid;
  return (
    <textarea
      {...props}
      aria-invalid={bad || undefined}
      className={`${inputCls} min-h-[64px] resize-y leading-relaxed ${bad ? invalidCls : ""} ${className}`}
    />
  );
}
