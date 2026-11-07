"use client";

import { useCallback, useState } from "react";

// ---------------- Form validation ----------------
// Typical usage in a dialog:
//
//   const { errors, validate, clearError, reset } = useFormErrors();
//
//   function save() {
//     if (!validate({
//       name: rules.required()(name),
//       emoji: rules.maxLen(4)(emoji),
//     })) return; // the messages are already in `errors`
//     …save…
//   }
//
//   <Field label="Name" required error={errors.name}>
//     <Input value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} />
//   </Field>
//
// Each rule returns a message (string) if it fails or null if it passes.

export type RuleResult = string | null;

export const rules = {
  required:
    (msg = "This field is required") =>
    (v: unknown): RuleResult =>
      v == null || String(v).trim() === "" ? msg : null,

  maxLen:
    (n: number, msg?: string) =>
    (v: string | undefined | null): RuleResult =>
      v && v.length > n ? msg ?? `Max ${n} characters (you have ${v.length})` : null,

  minLen:
    (n: number, msg?: string) =>
    (v: string | undefined | null): RuleResult =>
      v != null && v.trim() !== "" && v.trim().length < n ? msg ?? `Min ${n} characters` : null,

  positive:
    (msg = "Must be a number greater than 0") =>
    (v: number | undefined | null): RuleResult =>
      v != null && !(v > 0) ? msg : null,

  url:
    (msg = "This doesn't look like a valid URL") =>
    (v: string | undefined | null): RuleResult => {
      if (!v || !v.trim()) return null; // empty = valid (use required separately)
      try {
        new URL(v);
        return null;
      } catch {
        return msg;
      }
    },
};

// Stores the errors per field and shows/clears them. `validate` receives the
// result of applying the rules and returns true if everything passes.
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
