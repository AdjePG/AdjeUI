"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useFieldInvalid } from "./Field";
import { INPUT_SIZES } from "./Input";
import type { ControlSize } from "../controls/Button";

// Custom select (same look in every app and OS). The trigger measures
// --control-h-* according to `size` (sm/md/lg), just like Input and Button.
// Inside a <Field error="…"> it turns red on its own.
//
// Every option is the same template (26 Sep 2026): [icon] label [check]. An
// option may bring an `icon`; as soon as one does, EVERY row keeps the slot,
// so the labels line up in one column whether or not a row has its own, and
// the trigger shows the chosen option's icon beside its label.
export type SelectOption = { value: string; label: string; icon?: ReactNode };

/** The icon slot: one fixed box, so every row starts its label at the same x. */
function OptionIcon({ icon, on }: { icon?: ReactNode; on: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:max-h-4 [&>svg]:max-w-4 ${
        on ? "text-[var(--accent-blue)]" : "text-muted"
      }`}
    >
      {icon}
    </span>
  );
}

export function Select({
  value,
  onChange,
  options,
  className = "",
  placeholder,
  invalid,
  size = "md",
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
  invalid?: boolean;
  size?: ControlSize;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fieldInvalid = useFieldInvalid();
  const bad = invalid ?? fieldInvalid;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const current = options.find((o) => o.value === value);
  const withIcons = options.some((o) => o.icon != null);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-invalid={bad || undefined}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 border bg-[var(--background)] transition ${INPUT_SIZES[size]} ${
          bad
            ? "border-[var(--negative)]"
            : open
            ? "border-[var(--accent-blue)]"
            : "border-[var(--border)] hover:border-[var(--accent-blue)]"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {withIcons && current && <OptionIcon icon={current.icon} on />}
          <span className={`truncate ${!current && placeholder ? "text-muted" : ""}`}>{current?.label ?? placeholder ?? "—"}</span>
        </span>
        <ChevronDown size={14} className={`text-muted shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        // 4px between options, as in Menu (26 Sep 2026); 18rem tall, so eight
        // options fit with the gaps before a scrollbar appears.
        <div className="absolute z-50 mt-1.5 flex w-full min-w-[170px] flex-col gap-1 card p-1 blue-shadow max-h-72 overflow-y-auto custom-scrollbar scroll-no-gutter toast-in">
          {options.map((o) => {
            const on = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-[var(--hover)] transition ${
                  on ? "font-semibold" : ""
                }`}
              >
                {withIcons && <OptionIcon icon={o.icon} on={on} />}
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {on && <Check size={14} className="text-[var(--accent-blue)] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
