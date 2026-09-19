"use client";

import { ReactNode, createContext, useContext } from "react";
import { AlertCircle } from "lucide-react";
import { HelpTip } from "../overlays/HelpTip";

// Context that propagates the Field's error state to the controls it
// contains: Input, Textarea and Select turn red on their own when the Field
// has `error`, without passing props by hand.
const FieldCtx = createContext<{ invalid: boolean }>({ invalid: false });

export function useFieldInvalid(): boolean {
  return useContext(FieldCtx).invalid;
}

// Form field: label + control + (help | error).
// - `required` paints an asterisk in the label.
// - `error` shows the message in red under the control AND turns the
//   control's border red (via context). Pass the message from useFormErrors.
// - `as="div"` for controls that are NOT a native input (rich-text editor,
//   button groups…): inside a <label>, the click would activate the first
//   button they contain.
export function Field({
  label,
  children,
  help,
  right,
  error,
  required,
  as = "label",
}: {
  label: string;
  children: ReactNode;
  help?: ReactNode;
  right?: ReactNode;
  error?: string;
  required?: boolean;
  as?: "label" | "div";
}) {
  const Tag = as;
  return (
    <Tag className="flex flex-col gap-1 text-sm">
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
    </Tag>
  );
}
