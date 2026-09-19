"use client";

import { ReactNode } from "react";

// Standard button. The HEIGHT is fixed per size (--control-h-* tokens from
// theme.css) so no button is ever taller than another one or than an input.
export type ButtonVariant = "primary" | "ghost" | "outline" | "danger";
export type ControlSize = "sm" | "md" | "lg";

const SIZES: Record<ControlSize, string> = {
  sm: "h-[var(--control-h-sm)] px-3 text-[13px] rounded-lg",
  md: "h-[var(--control-h)] px-4 text-sm rounded-xl",
  lg: "h-[var(--control-h-lg)] px-5 text-[15px] rounded-xl",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "text-white blue-shadow hover:opacity-90",
  ghost: "hover:bg-[var(--hover)]",
  outline: "border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover)]",
  danger: "text-[var(--negative)] border border-[var(--negative)] hover:bg-[var(--negative)]/10",
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  title,
  full = false,
  loading = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  size?: ControlSize;
  className?: string;
  disabled?: boolean;
  title?: string;
  full?: boolean; // takes the full width (w-full)
  loading?: boolean; // spinner + disabled
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`${base} ${SIZES[size]} ${VARIANTS[variant]} ${full ? "w-full" : ""} ${className}`}
      style={variant === "primary" ? { background: "var(--app-gradient)" } : undefined}
    >
      {loading && (
        <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
