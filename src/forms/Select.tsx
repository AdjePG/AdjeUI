"use client";

import { useId, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useFieldErrorId, useFieldInvalid, useFieldLabelId } from "./Field";
import { INPUT_SIZES } from "./Input";
import type { ControlSize } from "../controls/Button";
import { Popover } from "../overlays/Popover";

// Custom select (same look in every app and OS). The trigger measures
// --control-h-* like Input and Button; the list opens in a Popover, so no
// overflow parent clips it. Inside a <Field error="…"> it turns red on its own.
// Every option is one template, [icon] label [check]: as soon as one option
// has an icon, every row keeps the slot so the labels line up.
export type SelectOption<T extends string = string> = { value: T; label: string; icon?: ReactNode };

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

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  className = "",
  placeholder,
  invalid,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  /** Classes on the wrapper (usually its width). */
  className?: string;
  /** Shown muted when no option matches `value` (otherwise "—"). */
  placeholder?: string;
  /** Red border; inside a Field with `error` it is set automatically. */
  invalid?: boolean;
  size?: ControlSize;
}) {
  const fieldInvalid = useFieldInvalid();
  const labelId = useFieldLabelId();
  const errorId = useFieldErrorId();
  const bad = invalid ?? fieldInvalid;
  const triggerId = useId();

  const current = options.find((o) => o.value === value);
  const withIcons = options.some((o) => o.icon != null);

  return (
    <Popover
      sheet={false}
      align="stretch"
      role="listbox"
      className={className}
      // 18rem tall: eight options with their gaps fit before a scrollbar appears.
      panelClassName="min-w-[170px] [--popover-max-h:18rem]"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          id={triggerId}
          // The Field's label, then the chosen value.
          aria-labelledby={labelId ? `${labelId} ${triggerId}` : undefined}
          aria-describedby={errorId}
          aria-invalid={bad || undefined}
          onClick={toggle}
          className={`flex w-full items-center justify-between gap-2 border bg-[var(--field-bg,var(--background))] transition ${INPUT_SIZES[size]} ${
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
      )}
    >
      {({ close }) => (
        // 4px between options, as in Menu.
        <div className="flex flex-col gap-1 p-1">
          {options.map((o) => {
            const on = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => {
                  onChange(o.value);
                  close();
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
    </Popover>
  );
}
