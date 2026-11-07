"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useFieldControlId, useFieldErrorId, useFieldInvalid } from "./Field";

// Chip/tag editor: type and press Enter (or comma) to add; Backspace on an
// empty draft removes the last one. Duplicates are ignored (case-insensitive)
// and chips beyond the limits are marked in red.
export function ChipEditor({
  values,
  onChange,
  max,
  maxLen,
  placeholder,
  invalid,
  className = "",
}: {
  values: string[];
  onChange: (v: string[]) => void;
  /** Max number of chips. */
  max?: number;
  /** Max characters per chip. */
  maxLen?: number;
  placeholder?: string;
  /** Red border; inside a Field with `error` it is set automatically. */
  invalid?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState("");
  const fieldInvalid = useFieldInvalid();
  const inputId = useFieldControlId();
  const errorId = useFieldErrorId();

  function commit() {
    const parts = draft
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const seen = new Set(values.map((v) => v.toLowerCase()));
    const next = [...values];
    for (const p of parts) {
      if (!seen.has(p.toLowerCase())) {
        next.push(p);
        seen.add(p.toLowerCase());
      }
    }
    onChange(next);
    setDraft("");
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  const over = max != null && values.length > max;
  const bad = over || (invalid ?? fieldInvalid);

  return (
    <div
      className={`w-full rounded-xl border bg-[var(--field-bg,var(--background))] px-2 py-1.5 text-sm flex flex-wrap items-center gap-1.5 focus-within:border-[var(--accent-blue)] ${
        bad ? "border-[var(--negative)]" : "border-[var(--border)]"
      } ${className}`}
    >
      {values.map((v, i) => {
        const tooLong = maxLen != null && v.length > maxLen;
        const overIdx = max != null && i >= max;
        const chipBad = tooLong || overIdx;
        return (
          <span
            key={`${v}-${i}`}
            title={tooLong ? `Too long: ${v.length}/${maxLen} characters` : overIdx ? `Max ${max}` : undefined}
            className={`inline-flex items-center gap-1 rounded-full pl-2.5 pr-1 py-0.5 text-[12px] font-medium ${
              chipBad ? "bg-[color-mix(in_srgb,var(--negative)_15%,transparent)] text-[var(--negative)]" : "bg-[var(--hover)]"
            }`}
          >
            {v}
            {maxLen != null && tooLong && <b className="text-[10px]">({v.length})</b>}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-[var(--hover)]"
              aria-label={`Remove ${v}`}
            >
              <X size={11} />
            </button>
          </span>
        );
      })}
      <input
        id={inputId}
        aria-invalid={bad || undefined}
        aria-describedby={errorId}
        className="flex-1 min-w-[110px] bg-transparent outline-none py-0.5 px-1"
        value={draft}
        placeholder={values.length ? "" : placeholder ?? "Type and press Enter…"}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
      />
    </div>
  );
}
