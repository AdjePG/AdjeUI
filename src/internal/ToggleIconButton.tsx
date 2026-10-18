"use client";

import type { ReactNode } from "react";

// Small square toggle (28px) with an accent frame while on: the rich-text
// toolbar and the code block's reader options.
export function ToggleIconButton({
  active,
  onClick,
  label,
  disabled,
  keepFocus = false,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  /** aria-label and tooltip. */
  label: string;
  disabled?: boolean;
  /** Do not take the focus on press (keeps the caret in an editor). */
  keepFocus?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={keepFocus ? (e) => e.preventDefault() : undefined}
      onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border text-[13px] transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-[var(--accent-blue)] bg-[var(--hover)] text-[var(--accent-blue)]"
          : "border-transparent text-muted hover:bg-[var(--hover)]"
      }`}
    >
      {children}
    </button>
  );
}
