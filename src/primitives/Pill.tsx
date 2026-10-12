"use client";

import { ReactNode } from "react";

// Rounded badge/label. Without a color it uses the neutral surface; with one,
// it tints the background at 13% and the text at 100%. Accepts hex or var():
// the usual thing is to pass a fixed-palette token, e.g. color={palette("green", 600)}.
export function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      // The text's line is exactly its size (leading-none), the same as an
      // 11px icon beside it: with the usual 16.5px line the two were centred
      // half a pixel apart, and at a zoom other than 100 % the browser rounded
      // them to different pixels — the icon looked lower than the word (12 Oct
      // 2026). The padding keeps the pill 20px tall.
      className="inline-flex items-center gap-1 rounded-full px-2 py-[4.5px] text-[11px] font-semibold leading-none"
      style={{
        background: color ? `color-mix(in srgb, ${color} 13%, transparent)` : "var(--hover)",
        color: color ?? "var(--foreground)",
      }}
    >
      {children}
    </span>
  );
}
