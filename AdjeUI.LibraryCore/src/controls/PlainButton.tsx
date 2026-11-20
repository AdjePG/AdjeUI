"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

// A button with no look of its own: a tree's item, a table's cell, a column head that opens a menu. The caller
// lays it out with `className`; it brings type="button" (never a form submit), the focus outline every control
// has and the disabled look. Anything that should look like a button is a Button or an IconButton.
export const PlainButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function PlainButton(
  { type = "button", className = "", ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={`disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...rest} />;
});
