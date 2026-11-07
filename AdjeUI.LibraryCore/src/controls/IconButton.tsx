"use client";

import { CSSProperties, ReactNode } from "react";
import type { LinkLike } from "../internal/link";
import { TONE_COLOR, type Tone } from "../tokens/tone";

// Square icon-only button (edit, delete, copy, close...), muted until hover.
// `label` is required for accessibility and doubles as the tooltip. With
// `href` it renders a link that looks the same.

const HOVER_TONE: Record<"neutral" | "danger" | "accent", Tone> = { neutral: "neutral", danger: "negative", accent: "accent" };

export function IconButton({
  onClick,
  label,
  children,
  tone = "neutral",
  size = "md",
  className = "",
  disabled,
  href,
  target,
  LinkComponent,
  dot = false,
}: {
  onClick?: () => void;
  /** aria-label and tooltip. */
  label: string;
  children: ReactNode;
  /** Colour on hover. */
  tone?: "neutral" | "danger" | "accent";
  /** sm = 28px, md = 32px. */
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
  /** Renders a link styled as this button. */
  href?: string;
  /** Link target; "_blank" also sets rel="noopener noreferrer". */
  target?: string;
  /** The link component for `href` (next/link). Default: "a". */
  LinkComponent?: LinkLike;
  /** An accent dot on the corner: what it opens is not at its defaults (filters on). */
  dot?: boolean;
}) {
  const sizeCls = size === "sm" ? "w-7 h-7 rounded-lg" : "w-8 h-8 rounded-lg";
  const cls = `relative inline-flex items-center justify-center shrink-0 text-muted hover:bg-[var(--hover)] hover:text-[var(--icon-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:pointer-events-none ${sizeCls} ${className}`;
  const style = { "--icon-hover": TONE_COLOR[HOVER_TONE[tone]] } as CSSProperties;
  const body = (
    <>
      {children}
      {dot && <span aria-hidden className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[var(--accent-blue)]" />}
    </>
  );
  if (href != null) {
    const A: LinkLike = LinkComponent ?? "a";
    return (
      <A
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        onClick={onClick}
        aria-label={label}
        title={label}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        className={cls}
        style={style}
      >
        {body}
      </A>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} disabled={disabled} className={cls} style={style}>
      {body}
    </button>
  );
}
