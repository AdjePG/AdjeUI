"use client";

import { useCallback, useState } from "react";

// ---------------- Validación de formularios ----------------
// Uso típico en un diálogo:
//
//   const { errors, validate, clearError, reset } = useFormErrors();
//
//   function save() {
//     if (!validate({
//       name: rules.required()(name),
//       emoji: rules.maxLen(4)(emoji),
//     })) return; // los mensajes ya están en `errors`
//     …guardar…
//   }
//
//   <Field label="Nombre" required error={errors.name}>
//     <Input value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} />
//   </Field>
//
// Cada regla devuelve un mensaje (string) si falla o null si pasa.

export type RuleResult = string | null;

export const rules = {
  required:
    (msg = "Este campo es obligatorio") =>
    (v: unknown): RuleResult =>
      v == null || String(v).trim() === "" ? msg : null,

  maxLen:
    (n: number, msg?: string) =>
    (v: string | undefined | null): RuleResult =>
      v && v.length > n ? msg ?? `Máximo ${n} caracteres (llevas ${v.length})` : null,

  minLen:
    (n: number, msg?: string) =>
    (v: string | undefined | null): RuleResult =>
      v != null && v.trim() !== "" && v.trim().length < n ? msg ?? `Mínimo ${n} caracteres` : null,

  positive:
    (msg = "Debe ser un número mayor que 0") =>
    (v: number | undefined | null): RuleResult =>
      v != null && !(v > 0) ? msg : null,

  url:
    (msg = "No parece una URL válida") =>
    (v: string | undefined | null): RuleResult => {
      if (!v || !v.trim()) return null; // vacío = válido (usa required aparte)
      try {
        new URL(v);
        return null;
      } catch {
        return msg;
      }
    },
};

// Guarda los errores por campo y los muestra/limpia. `validate` recibe el
// resultado de aplicar las reglas y devuelve true si todo pasa.
export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((results: Record<string, RuleResult | RuleResult[]>): boolean => {
    const next: Record<string, string> = {};
    for (const [name, res] of Object.entries(results)) {
      const first = Array.isArray(res) ? res.find((r) => r != null) : res;
      if (first) next[name] = first;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, []);

  const clearError = useCallback((name: string) => {
    setErrors((e) => {
      if (!(name in e)) return e;
      const { [name]: _, ...rest } = e;
      return rest;
    });
  }, []);

  const reset = useCallback(() => setErrors({}), []);

  return { errors, validate, clearError, reset };
}
