"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useFieldControlId, useFieldErrorId, useFieldInvalid } from "./Field";
import type { ControlSize } from "../controls/Button";

// Shared skin of the fields (border, background, focus), without size. The
// background is --field-bg, which theme.css sets by layers: white straight on
// the page, the page's grey on a card or any white surface.
const inputBase =
  "w-full border border-[var(--border)] bg-[var(--field-bg,var(--background))] outline-none focus:border-[var(--accent-blue)] disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * Class string of an md input, without height.
 * @deprecated Use `<Input>` / `<Textarea>`. Kept for the apps that still style native elements with it.
 */
export const inputCls = `${inputBase} rounded-xl px-3 py-2 text-sm`;

/** Size classes shared by Input and Select: the same heights, radii and type as Button. */
export const INPUT_SIZES: Record<ControlSize, string> = {
  sm: "h-[var(--control-h-sm)] px-2.5 text-[13px] rounded-lg",
  md: "h-[var(--control-h)] px-3 text-sm rounded-xl",
  lg: "h-[var(--control-h-lg)] px-3.5 text-[15px] rounded-xl",
};

const invalidCls = "!border-[var(--negative)]";

// The props a field control takes from its Field: invalid state, the id the
// label points at, and the error message's id.
function useFieldProps(id: string | undefined, invalid: boolean | undefined, describedBy: string | undefined) {
  const fieldInvalid = useFieldInvalid();
  const fieldId = useFieldControlId();
  const errorId = useFieldErrorId();
  const bad = invalid ?? fieldInvalid;
  return {
    bad,
    id: id ?? fieldId,
    "aria-invalid": bad || undefined,
    "aria-describedby": [describedBy, errorId].filter(Boolean).join(" ") || undefined,
  };
}

// Single-line input with a FIXED HEIGHT per size (--control-h-*), the same as
// Button and Select; theme.css evens out the native date/time inputs too.
// Inside a <Field error="…"> it turns red on its own. Forwards its ref.
export const Input = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
    /** Red border; inside a Field with `error` it is set automatically. */
    invalid?: boolean;
    size?: ControlSize;
  }
>(function Input({ className = "", invalid, size = "md", id, "aria-describedby": describedBy, ...props }, ref) {
  const { bad, ...field } = useFieldProps(id, invalid, describedBy);
  return <input {...props} {...field} ref={ref} className={`${inputBase} ${INPUT_SIZES[size]} ${bad ? invalidCls : ""} ${className}`} />;
});

// Text area with the same skin as Input, free height (min-h + resize), or
// `grow`: it gets taller with each line (CSS field-sizing, no script) up to
// half the screen's height, then scrolls with the app's scrollbar.
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    /** Red border; inside a Field with `error` it is set automatically. */
    invalid?: boolean;
    /** Grows with its content instead of the resize handle, then scrolls. */
    grow?: boolean;
  }
>(function Textarea({ className = "", invalid, grow = false, id, "aria-describedby": describedBy, ...props }, ref) {
  const { bad, ...field } = useFieldProps(id, invalid, describedBy);
  const height = grow ? "[field-sizing:content] max-h-[50dvh] resize-none overflow-y-auto custom-scrollbar scroll-no-gutter" : "resize-y";
  return (
    <textarea
      {...props}
      {...field}
      ref={ref}
      className={`${inputBase} rounded-xl px-3 py-2 text-sm min-h-[64px] leading-relaxed ${height} ${bad ? invalidCls : ""} ${className}`}
    />
  );
});
