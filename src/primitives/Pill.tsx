"use client";

import { ReactNode } from "react";

// Rounded badge/label. Without a color it uses the neutral surface; with one,
// it tints the background at 13% and the text at 100%. Accepts hex or var():
// the usual thing is to pass a fixed-palette token, e.g. color={palette("green", 600)}.
export function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{
        background: color ? `color-mix(in srgb, ${color} 13%, transparent)` : "var(--hover)",
        color: color ?? "var(--foreground)",
      }}
    >
      {children}
    </span>
  );
}
