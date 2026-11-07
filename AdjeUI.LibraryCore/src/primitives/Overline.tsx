"use client";

import { ReactNode } from "react";

// The small uppercase caption that names a group: "STRUCTURE", "MODULE 1",
// the title over a menu, the label of a field that is not an input.
// 12px / 600 / 0.06em: at 11px the system font hints unevenly, and wider
// tracking pulls a word apart into separate letters.

/** The Overline recipe as a class string (no colour), for an input or a button that is the caption itself. */
export const overlineCls = "text-[12px] font-semibold uppercase tracking-[0.06em]";

export function Overline({
  children,
  className = "",
  tone = "muted",
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  /** "current" keeps the colour it inherits (over a coloured surface). */
  tone?: "muted" | "current";
  as?: "span" | "div" | "p" | "h2" | "h3" | "h4";
}) {
  return <Tag className={`${overlineCls} ${tone === "muted" ? "text-muted" : ""} ${className}`}>{children}</Tag>;
}
