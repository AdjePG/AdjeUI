"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useFieldInvalid } from "./Field";

// Clase base de los inputs (compatibilidad: las apps la usaban directamente).
// SIN altura: la altura la ponen Input (fija) y Textarea (mínima).
export const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent-blue)]";

const invalidCls = "!border-[var(--negative)]";

// Input de línea con ALTURA FIJA (--control-h), la misma que Button y Select:
// nunca un control más alto que otro. Cubre también type="date"/"time"/…
// (el nativo trae alturas distintas; aquí queda igualado, ver theme.css).
// Dentro de un <Field error="…"> se pinta en rojo solo.
export function Input({
  className = "",
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const fieldInvalid = useFieldInvalid();
  const bad = invalid ?? fieldInvalid;
  return (
    <input
      {...props}
      aria-invalid={bad || undefined}
      className={`${inputCls} h-[var(--control-h)] !py-0 ${bad ? invalidCls : ""} ${className}`}
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
