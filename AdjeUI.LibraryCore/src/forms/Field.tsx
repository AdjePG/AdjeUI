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
//
// `layout`: "stacked" (default) puts the label over the control; "row" puts it
// on the left and the control on the right (stacked again on a phone), as a
// settings page lists its fields; "toggle" keeps a Switch on the right of its
// label on every screen.
export function Field({
  label,
  children,
  help,
  right,
  error,
  required,
  as = "div",
  layout = "stacked",
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
  /** Label over the control ("stacked"), beside it ("row"), or a Switch at its end ("toggle"). */
  layout?: "stacked" | "row" | "toggle";
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
  const stacked = layout === "stacked";
  const control = (
    <>
      <FieldCtx.Provider value={ctx}>{children}</FieldCtx.Provider>
      {error && (
        <span id={ctx.errorId} role="alert" className="flex items-center gap-1 text-[12px] text-[var(--negative)]">
          <AlertCircle size={12} className="shrink-0" /> {error}
        </span>
      )}
    </>
  );
  return (
    <Tag className={`text-sm ${LAYOUT[layout]}`}>
      <span className={`flex items-center gap-1.5 ${stacked ? "text-muted" : "min-w-0 font-medium text-[var(--foreground)]"}`}>
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
      {stacked ? control : <div className={`flex min-w-0 flex-col gap-1 ${layout === "toggle" ? "shrink-0 items-end" : ""}`}>{control}</div>}
    </Tag>
  );
}

const LAYOUT = {
  stacked: "flex flex-col gap-1",
  row: "grid gap-2 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:items-center sm:gap-x-6",
  toggle: "flex items-center justify-between gap-4",
} as const;
