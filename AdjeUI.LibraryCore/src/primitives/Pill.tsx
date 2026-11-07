"use client";

import { ReactNode } from "react";

// Rounded badge/label. Without a colour it uses the neutral surface; with one
// it tints the background at 13% and the text. The usual colour is a palette
// token: color={palette("green", 600)}.
export function Pill({
  children,
  color,
  solid = false,
}: {
  children: ReactNode;
  /** Any CSS colour (hex or var()); normally `palette(name, 600)`. */
  color?: string;
  /** Opaque base under the tint, for a pill laid over a picture or a pattern. */
  solid?: boolean;
}) {
  return (
    <span
      // leading-none: the text's line is exactly its size, like an 11px icon
      // beside it, so both centre on the same pixel at any zoom.
      className="inline-flex items-center gap-1 rounded-full px-2 py-[4.5px] text-[11px] font-semibold leading-none"
      style={{
        background: color
          ? `color-mix(in srgb, ${color} 13%, ${solid ? "var(--card)" : "transparent"})`
          : solid
            ? "color-mix(in srgb, var(--foreground) 7%, var(--card))"
            : "var(--hover)",
        // The word is nudged towards the text colour: a strong colour on its
        // own 13% tint reads poorly in dark mode (about 3:1 instead of 4.7:1).
        color: color
          ? `light-dark(color-mix(in srgb, ${color} 85%, var(--foreground)), color-mix(in srgb, ${color} 55%, var(--foreground)))`
          : "var(--foreground)",
      }}
    >
      {children}
    </span>
  );
}
