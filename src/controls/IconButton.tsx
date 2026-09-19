"use client";

import { ReactNode } from "react";

// Square icon-only button (edit, delete, copy, close...), with the same look
// in every app. `label` is required for accessibility and doubles as the
// tooltip.
export function IconButton({
  onClick,
  label,
  children,
  tone = "neutral",
  size = "md",
  className = "",
  disabled,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  tone?: "neutral" | "danger" | "accent";
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
}) {
  const sizeCls = size === "sm" ? "w-7 h-7 rounded-lg" : "w-8 h-8 rounded-lg";
  const toneCls =
    tone === "danger"
      ? "text-muted hover:text-[var(--negative)]"
      : tone === "accent"
      ? "text-muted hover:text-[var(--accent-blue)]"
      : "text-muted hover:text-[var(--foreground)]";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`inline-flex items-center justify-center shrink-0 hover:bg-[var(--hover)] transition disabled:opacity-40 disabled:cursor-not-allowed ${sizeCls} ${toneCls} ${className}`}
    >
      {children}
    </button>
  );
}
