"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useFieldInvalid } from "./Field";

// Select personalizado (mismo aspecto en todas las apps y sistemas). El
// disparador mide --control-h, igual que Input y Button. Dentro de un
// <Field error="…"> se pinta en rojo solo.
export function Select({
  value,
  onChange,
  options,
  className = "",
  placeholder,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
  invalid?: boolean;
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

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-invalid={bad || undefined}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full h-[var(--control-h)] items-center justify-between gap-2 rounded-xl border px-3 text-sm bg-[var(--background)] transition ${
          bad
            ? "border-[var(--negative)]"
            : open
            ? "border-[var(--accent-blue)]"
            : "border-[var(--border)] hover:border-[var(--accent-blue)]"
        }`}
      >
        <span className={`truncate ${!current && placeholder ? "text-muted" : ""}`}>
          {current?.label ?? placeholder ?? "—"}
        </span>
        <ChevronDown size={14} className={`text-muted shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[170px] card p-1 blue-shadow max-h-64 overflow-y-auto custom-scrollbar toast-in">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-[var(--hover)] transition ${
                o.value === value ? "font-semibold" : ""
              }`}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check size={14} className="text-[var(--accent-blue)] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
