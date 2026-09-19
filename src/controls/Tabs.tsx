"use client";

import { ReactNode } from "react";
import { ScrollArrows } from "./ScrollArrows";

// Text tab bar with a gradient underline on the active one (browser/YouTube
// style). For sub-pages; for filters/toggles use Segmented.
//
// When there are more tabs than fit, arrows appear at both ends instead of a
// scrollbar (13 Sep 2026).
export function Tabs({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label?: ReactNode; icon?: ReactNode; title?: string }[];
  className?: string;
}) {
  return (
    <ScrollArrows className={className}>
      <div className="flex w-max items-center gap-1 pb-0.5">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              title={o.title}
              className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm font-semibold transition ${
                active ? "text-[var(--foreground)]" : "text-muted hover:text-[var(--foreground)]"
              }`}
            >
              {o.icon}
              {o.label}
              {active && (
                <span
                  className="absolute left-2 right-2 bottom-0 h-[3px] rounded-full"
                  style={{ background: "var(--app-gradient)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </ScrollArrows>
  );
}
