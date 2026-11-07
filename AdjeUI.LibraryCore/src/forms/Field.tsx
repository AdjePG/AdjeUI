"use client";

import { ReactNode, createContext, useContext, useId, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { HelpTip } from "../overlays/HelpTip";

// What a Field tells the controls inside it: whether it is in error (they
// turn red on their own) and the ids that tie its label and message to them.
type FieldContext = { invalid: boolean; controlId?: string; labelId?: string; errorId?: string };

const FieldCtx = createContext<FieldContext>({ invalid: false });

/** Whether the enclosing Field shows an error. */
export function useFieldInvalid(): boolean {
  return useContext(FieldCtx).invalid;
}

/** Id for the Field's labelable control (an input): the label points at it. */
export function useFieldControlId(): string | undefined {
  return useContext(FieldCtx).controlId;
}

/** Id of the Field's label, for controls that are not labelable (groups, triggers): `aria-labelledby`. */
export function useFieldLabelId(): string | undefined {
  return useContext(FieldCtx).labelId;
}

/** Id of the Field's error message, for `aria-describedby`. */
export function useFieldErrorId(): string | undefined {
  return useContext(FieldCtx).errorId;
}

// Form field: label + control + (help | error). The label is a <label for>
// pointing at the control, never a <label> wrapped around it: a wrapping label
// activates the first button inside (a chip's remove button, a Segmented's
// first option, a Select's trigger).
export function Field({
  label,
  children,
  help,
  right,
  error,
  required,
  as = "div",
}: {
  label: string;
  children: ReactNode;
  /** HelpTip next to the label. */
  help?: ReactNode;
  /** Right end of the label row: counters, units. */
  right?: ReactNode;
  /** Message under the control; also turns the control red. Pass it from useFormErrors. */
  error?: string;
  /** Asterisk after the label. */
  required?: boolean;
  /**
   * "div" (default): the label points at the AdjeUI control inside.
   * "label": the whole field is wrapped in a <label>; only for a single
   * native input that is not an AdjeUI control.
   */
  as?: "label" | "div";
}) {
  const id = useId();
  const wraps = as === "label";
  const ctx = useMemo<FieldContext>(
    () => ({
      invalid: !!error,
      controlId: wraps ? undefined : `${id}-control`,
      labelId: `${id}-label`,
      errorId: error ? `${id}-error` : undefined,
    }),
    [error, id, wraps],
  );
  const Tag = wraps ? "label" : "div";
  const text = (
    <>
      {label}
      {required && <span className="text-[var(--negative)] ml-1">*</span>}
    </>
  );
  return (
    <Tag className="flex flex-col gap-1 text-sm">
      <span className="text-muted flex items-center gap-1.5">
        {wraps ? (
          <span id={ctx.labelId}>{text}</span>
        ) : (
          <label id={ctx.labelId} htmlFor={ctx.controlId}>
            {text}
          </label>
        )}
        {help && <HelpTip>{help}</HelpTip>}
        {right && <span className="ml-auto">{right}</span>}
      </span>
      <FieldCtx.Provider value={ctx}>{children}</FieldCtx.Provider>
      {error && (
        <span id={ctx.errorId} role="alert" className="flex items-center gap-1 text-[12px] text-[var(--negative)]">
          <AlertCircle size={12} className="shrink-0" /> {error}
        </span>
      )}
    </Tag>
  );
}
