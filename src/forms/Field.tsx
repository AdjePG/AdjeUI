"use client";

import { ReactNode, createContext, useContext } from "react";
import { AlertCircle } from "lucide-react";
import { HelpTip } from "../overlays/HelpTip";

// Contexto que propaga el estado de error del Field a los controles que
// contiene: Input, Textarea y Select se pintan en rojo solos cuando el Field
// tiene `error`, sin pasar props a mano.
const FieldCtx = createContext<{ invalid: boolean }>({ invalid: false });

export function useFieldInvalid(): boolean {
  return useContext(FieldCtx).invalid;
}

// Campo de formulario: etiqueta + control + (ayuda | error).
// - `required` pinta un asterisco en la etiqueta.
// - `error` muestra el mensaje en rojo bajo el control Y pone el borde del
//   control en rojo (via contexto). Pasa el mensaje de useFormErrors.
export function Field({
  label,
  children,
  help,
  right,
  error,
  required,
}: {
  label: string;
  children: ReactNode;
  help?: ReactNode;
  right?: ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted flex items-center gap-1.5">
        {label}
        {required && <span className="text-[var(--negative)] -ml-0.5">*</span>}
        {help && <HelpTip>{help}</HelpTip>}
        {right && <span className="ml-auto">{right}</span>}
      </span>
      <FieldCtx.Provider value={{ invalid: !!error }}>{children}</FieldCtx.Provider>
      {error && (
        <span role="alert" className="flex items-center gap-1 text-[12px] text-[var(--negative)]">
          <AlertCircle size={12} className="shrink-0" /> {error}
        </span>
      )}
    </label>
  );
}
