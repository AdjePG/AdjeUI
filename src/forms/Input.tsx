"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useFieldInvalid } from "./Field";
import type { ControlSize } from "../controls/Button";

// Shared skin of the fields (border, background, focus), WITHOUT size.
const inputBase =
  "w-full border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--accent-blue)] disabled:opacity-50 disabled:cursor-not-allowed";

// Base class of the inputs in md size (compatibility: the apps used it
// directly on native elements). WITHOUT height: the height is set by Input
// (fixed) and Textarea (minimum).
export const inputCls = `${inputBase} rounded-xl px-3 py-2 text-sm`;

// Sizes: the SAME heights, radii and typography as Button (--control-h-*
// tokens), so an input and the button next to it measure the same.
export const INPUT_SIZES: Record<ControlSize, string> = {
  sm: "h-[var(--control-h-sm)] px-2.5 text-[13px] rounded-lg",
  md: "h-[var(--control-h)] px-3 text-sm rounded-xl",
  lg: "h-[var(--control-h-lg)] px-3.5 text-[15px] rounded-xl",
};

const invalidCls = "!border-[var(--negative)]";

// Single-line input with a FIXED HEIGHT per size (--control-h-*), the same as
// Button and Select: never one control taller than another. Also covers
// type="date"/"time"/… (the native one comes with different heights; here it
// is evened out, see theme.css). Inside a <Field error="…"> it turns red on its own.
//   <Input size="sm" … /> next to <Button size="sm">…</Button>
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

// Text area with the same skin as Input, free height (min-h + resize).
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
