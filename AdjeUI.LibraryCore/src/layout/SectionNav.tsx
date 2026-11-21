"use client";

import type { ReactNode } from "react";
import { PlainButton } from "../controls/PlainButton";

export type SectionNavItem<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  /** Red: the section that deletes or leaves something. */
  danger?: boolean;
  /** A line before it, setting it apart from those above (the danger one). */
  apart?: boolean;
};

// The sections of a settings page, as a list beside them: a column on a wide
// screen, a row that scrolls sideways on a phone. One is open at a time.
//
//   <SectionNav value={section} onChange={setSection} items={[{ value: "profile", label: "Profile", icon: <User size={16} /> }, …]} />
export function SectionNav<T extends string>({
  value,
  onChange,
  items,
  label = "Sections",
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  items: SectionNavItem<T>[];
  /** Its accessible name. */
  label?: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="no-scrollbar flex gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
        {items.map((it) => {
          const active = it.value === value;
          return (
            <li key={it.value} className={`shrink-0 ${it.apart ? "md:mt-2 md:border-t md:border-[var(--border)] md:pt-2" : ""}`}>
              <PlainButton
                onClick={() => onChange(it.value)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active ? "bg-[var(--hover)] font-semibold" : "hover:bg-[var(--hover)]"
                } ${it.danger ? "text-[var(--negative)]" : active ? "text-[var(--foreground)]" : "text-muted hover:text-[var(--foreground)]"}`}
              >
                {it.icon && <span className="flex shrink-0 [&>svg]:h-4 [&>svg]:w-4">{it.icon}</span>}
                {it.label}
              </PlainButton>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
