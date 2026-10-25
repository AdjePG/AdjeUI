"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useFieldControlId, useFieldErrorId, useFieldInvalid } from "./Field";
import { IconButton } from "../controls/IconButton";
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

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & { invalid?: boolean; size?: ControlSize };

// A password Input with an eye at its end: it shows what is typed, and hides it
// again. Every Input prop but `type`; forwards its ref.
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type">>(function PasswordInput({ className = "", ...props }, ref) {
  const [shown, setShown] = useState(false);
  return (
    <span className="relative block w-full">
      <Input {...props} ref={ref} type={shown ? "text" : "password"} className={`pr-10 ${className}`} />
      <IconButton
        label={shown ? "Hide password" : "Show password"}
        size="sm"
        onClick={() => setShown((s) => !s)}
        disabled={props.disabled}
        className="absolute right-1 top-1/2 -translate-y-1/2"
      >
        {shown ? <EyeOff size={15} /> : <Eye size={15} />}
      </IconButton>
    </span>
  );
});

// Text area with the same skin as Input, free height (min-h + resize).
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    /** Red border; inside a Field with `error` it is set automatically. */
    invalid?: boolean;
  }
>(function Textarea({ className = "", invalid, id, "aria-describedby": describedBy, ...props }, ref) {
  const { bad, ...field } = useFieldProps(id, invalid, describedBy);
  return (
    <textarea
      {...props}
      {...field}
      ref={ref}
      className={`${inputBase} rounded-xl px-3 py-2 text-sm min-h-[64px] resize-y leading-relaxed ${bad ? invalidCls : ""} ${className}`}
    />
  );
});
