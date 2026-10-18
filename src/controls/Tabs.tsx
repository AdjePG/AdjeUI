"use client";

import { ScrollArrows } from "./ScrollArrows";
import type { SegmentedOption } from "./Segmented";

// Text tab bar with a gradient underline on the active one (browser/YouTube
// style). For sub-pages; for filters/toggles use Segmented. When the tabs do
// not fit, arrows appear at both ends instead of a scrollbar.
export function Tabs<T extends string = string>({
  value,
  onChange,
  options,
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
}) {
  return (
    <ScrollArrows className={className}>
      <div role="tablist" className="flex w-max items-center gap-1 pb-0.5">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(o.value)}
              title={o.title}
              aria-label={o.label == null ? o.title : undefined}
              className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm font-semibold transition ${
                active ? "text-[var(--foreground)]" : "text-muted hover:text-[var(--foreground)]"
              }`}
            >
              {o.icon}
              {o.label}
              {active && <span className="bg-app-gradient absolute left-2 right-2 bottom-0 h-[3px] rounded-full" />}
            </button>
          );
        })}
      </div>
    </ScrollArrows>
  );
}
