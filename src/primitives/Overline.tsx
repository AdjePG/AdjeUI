"use client";

import { ReactNode } from "react";

// The small uppercase caption that names a group: "STRUCTURE", "MODULE 1",
// "LAYOUT", the title over a menu, the label of a field that is not an input.
//
// It is a COMPONENT and not a string of classes (22 Sep 2026). It never was
// one: every place that wanted this look wrote out
// `text-[11px] font-semibold uppercase tracking-widest text-muted` by hand —
// twenty-five times in one app alone, at 9.5, 10 and 11px depending on the
// day — so no two were quite the same and improving them meant finding all of
// them first.
//
// The recipe is 12px / 600 / 0.06em, not 11px / 600 / 0.1em. Two things were
// wrong with the copies. At 11px the system font (Segoe UI on Windows, and it
// is Windows that these are read on) falls into its hardest hinting and the
// stems come out uneven — the "pixelated" look. And `tracking-widest` is
// 0.1em, which on eight capitals pulls the word apart into eight separate
// marks instead of one shape you recognise. A pixel up and a third of the
// tracking off fixes both, and nobody can tell it got bigger.
// The same recipe as a class string, for the places that cannot be a component
// because they are not a box of text: an input you type a module name into, a
// button that IS the caption. Same idea as `inputCls`.
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
  return (
    <Tag className={`${overlineCls} ${tone === "muted" ? "text-muted" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
