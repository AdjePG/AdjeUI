"use client";

import { ReactNode } from "react";

// Rounded badge/label. Without a color it uses the neutral surface; with one,
// it tints the background at 13% and the text (nudged towards the text colour). Accepts hex or var():
// the usual thing is to pass a fixed-palette token, e.g. color={palette("green", 600)}.
// `solid` (12 Oct 2026): the same tint on an opaque base, for a pill laid
// over a picture or a pattern — the plain one is see-through.
export function Pill({ children, color, solid = false }: { children: ReactNode; color?: string; solid?: boolean }) {
  return (
    <span
      // The text's line is exactly its size (leading-none), the same as an
      // 11px icon beside it: with the usual 16.5px line the two were centred
      // half a pixel apart, and at a zoom other than 100 % the browser rounded
      // them to different pixels — the icon looked lower than the word (12 Oct
      // 2026). The padding keeps the pill 20px tall.
      className="inline-flex items-center gap-1 rounded-full px-2 py-[4.5px] text-[11px] font-semibold leading-none"
      style={{
        background: color
          ? `color-mix(in srgb, ${color} 13%, ${solid ? "var(--card)" : "transparent"})`
          : solid
            ? "color-mix(in srgb, var(--foreground) 7%, var(--card))"
            : "var(--hover)",
        // The word nudged towards the text colour (13 Oct 2026): a strong
        // colour on its own 13% tint read poorly in dark mode (red on dark
        // red, about 3:1). Nearly half-way there in dark mode (about 4.7:1),
        // barely in light mode, where it already read well.
        color: color
          ? `light-dark(color-mix(in srgb, ${color} 85%, var(--foreground)), color-mix(in srgb, ${color} 55%, var(--foreground)))`
          : "var(--foreground)",
      }}
    >
      {children}
    </span>
  );
}
