"use client";

import { ReactNode } from "react";
import { ScrollArrows } from "./ScrollArrows";
import type { ControlSize } from "./Button";

// Group of mutually exclusive buttons (filters, views). The active option
// carries the app gradient. For sub-pages use Tabs.
//
// Sizes sm / md / lg like Button, Input and Select: a Segmented sitting next
// to a small button has to measure the same as it does.
//
// If it does not fit the container width it shows no scrollbar: two arrows
// appear at the ends instead (13 Sep 2026). `max-w-full` is what lets it
// shrink without overflowing the parent.

const SIZES: Record<ControlSize, { height: string; text: string; sides: string; radius: string }> = {
  sm: { height: "h-[var(--control-h-sm)]", text: "text-[12px]", sides: "px-2.5", radius: "rounded-lg" },
  md: { height: "h-[var(--control-h)]", text: "text-[13px]", sides: "px-3.5", radius: "rounded-xl" },
  lg: { height: "h-[var(--control-h-lg)]", text: "text-[15px]", sides: "px-[18px]", radius: "rounded-xl" },
};

export function Segmented({
  value,
  onChange,
  options,
  size = "md",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label?: ReactNode; icon?: ReactNode; title?: string }[];
  size?: ControlSize;
  className?: string;
}) {
  const t = SIZES[size];
  return (
    <div
      className={`inline-flex max-w-full shrink-0 overflow-hidden border border-[var(--border)] ${t.radius} ${t.text} ${className}`}
    >
      <ScrollArrows step={120} className="w-full">
        <div className="flex w-max">
          {options.map((o) => {
            const active = value === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange(o.value)}
                title={o.title}
                // Icon only (26 Sep 2026): a square, named by its title.
                aria-label={o.label == null ? o.title : undefined}
                className={`inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap transition ${t.height} ${
                  o.label == null ? "aspect-square px-0" : t.sides
                } ${
                  active ? "text-white" : "hover:bg-[var(--hover)]"
                }`}
                style={active ? { background: "var(--app-gradient)" } : undefined}
              >
                {o.icon}
                {o.label}
              </button>
            );
          })}
        </div>
      </ScrollArrows>
    </div>
  );
}
