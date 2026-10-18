"use client";

import { ReactNode } from "react";
import type { LinkLike } from "../internal/link";

// Standard button. The HEIGHT is fixed per size (--control-h-* tokens from
// theme.css) so no button is ever taller than another one or than an input.
// With `href` it renders a link that looks the same (never a button inside a link).
export type ButtonVariant = "primary" | "ghost" | "outline" | "danger";
export type ControlSize = "sm" | "md" | "lg";

const SIZES: Record<ControlSize, string> = {
  sm: "h-[var(--control-h-sm)] px-3 text-[13px] rounded-lg",
  md: "h-[var(--control-h)] px-4 text-sm rounded-xl",
  lg: "h-[var(--control-h-lg)] px-5 text-[15px] rounded-xl",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-app-gradient text-white blue-shadow hover:opacity-90",
  ghost: "hover:bg-[var(--hover)]",
  outline: "border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover)]",
  danger: "text-[var(--negative)] border border-[var(--negative)] hover:bg-[color-mix(in_srgb,var(--negative)_10%,transparent)]",
};

// leading-none: the word's line is its own size, like the icon beside it, so
// both centre on the same pixel at any zoom; the height comes from --control-h.
const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold leading-none whitespace-nowrap transition disabled:opacity-40 disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:pointer-events-none shrink-0";

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
  href,
  target,
  LinkComponent,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  size?: ControlSize;
  className?: string;
  disabled?: boolean;
  title?: string;
  /** Takes the full width (w-full). */
  full?: boolean;
  /** Spinner + disabled, while an action runs. */
  loading?: boolean;
  /** Renders a link styled as this button. */
  href?: string;
  /** Link target; "_blank" also sets rel="noopener noreferrer". */
  target?: string;
  /** The link component for `href` (next/link). Default: "a". */
  LinkComponent?: LinkLike;
}) {
  const cls = `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${full ? "w-full" : ""} ${className}`;
  const content = (
    <>
      {loading && <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-r-transparent animate-spin" />}
      {children}
    </>
  );
  if (href != null) {
    const A: LinkLike = LinkComponent ?? "a";
    const off = disabled || loading;
    return (
      <A
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        onClick={onClick}
        title={title}
        aria-disabled={off || undefined}
        tabIndex={off ? -1 : undefined}
        className={cls}
      >
        {content}
      </A>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} title={title} className={cls}>
      {content}
    </button>
  );
}
