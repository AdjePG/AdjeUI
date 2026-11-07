"use client";

import { ReactNode } from "react";
import { ScrollArrows } from "./ScrollArrows";
import type { ControlSize } from "./Button";
import { useFieldLabelId } from "../forms/Field";

// Group of mutually exclusive buttons (filters, views). The active option
// carries the app gradient. For sub-pages use Tabs. Sizes match Button, Input
// and Select. If it does not fit, arrows appear at the ends instead of a
// scrollbar; `max-w-full` lets it shrink without overflowing its parent.

const SIZES: Record<ControlSize, { height: string; text: string; sides: string; radius: string }> = {
  sm: { height: "h-[var(--control-h-sm)]", text: "text-[12px]", sides: "px-2.5", radius: "rounded-lg" },
  md: { height: "h-[var(--control-h)]", text: "text-[13px]", sides: "px-3.5", radius: "rounded-xl" },
  lg: { height: "h-[var(--control-h-lg)]", text: "text-[15px]", sides: "px-[18px]", radius: "rounded-xl" },
};

export type SegmentedOption<T extends string = string> = {
  value: T;
  /** No label → a square icon button named by `title`. */
  label?: ReactNode;
  icon?: ReactNode;
  title?: string;
};

export function Segmented<T extends string = string>({
  value,
  onChange,
  options,
  size = "md",
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentedOption<T>[];
  size?: ControlSize;
  className?: string;
}) {
  const t = SIZES[size];
  const labelId = useFieldLabelId();
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      // The arrows' veil takes the control's own fill.
      className={`inline-flex max-w-full shrink-0 overflow-hidden border border-[var(--border)] bg-[var(--field-bg,var(--background))] [--scroll-veil:var(--field-bg,var(--background))] ${t.radius} ${t.text} ${className}`}
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
                aria-pressed={active}
                aria-label={o.label == null ? o.title : undefined}
                className={`inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap transition ${t.height} ${
                  o.label == null ? "aspect-square px-0" : t.sides
                } ${active ? "bg-app-gradient text-white" : "hover:bg-[var(--hover)]"}`}
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
