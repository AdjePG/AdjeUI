"use client";

// Editor de chips/tags: escribe y pulsa Enter (o coma) para añadir. Valida
// límites (nº máximo y longitud por chip) marcando en rojo lo que se pasa.
import { useState } from "react";
import { X } from "lucide-react";
import { useFieldInvalid } from "./Field";

export function ChipEditor({
  values,
  onChange,
  max,
  maxLen,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  max?: number; // máx nº de chips
  maxLen?: number; // máx caracteres por chip
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const fieldInvalid = useFieldInvalid();

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

  return (
    <div
      className={`w-full rounded-xl border bg-[var(--background)] px-2 py-1.5 text-sm flex flex-wrap items-center gap-1.5 focus-within:border-[var(--accent-blue)] ${
        over || fieldInvalid ? "border-[var(--negative)]" : "border-[var(--border)]"
      }`}
    >
      {values.map((v, i) => {
        const tooLong = maxLen != null && v.length > maxLen;
        const overIdx = max != null && i >= max;
        const bad = tooLong || overIdx;
        return (
          <span
            key={`${v}-${i}`}
            title={tooLong ? `Demasiado largo: ${v.length}/${maxLen} caracteres` : overIdx ? `Máximo ${max}` : undefined}
            className={`inline-flex items-center gap-1 rounded-full pl-2.5 pr-1 py-0.5 text-[12px] font-medium ${
              bad ? "bg-[var(--negative)]/15 text-[var(--negative)]" : "bg-[var(--hover)]"
            }`}
          >
            {v}
            {maxLen != null && tooLong && <b className="text-[10px]">({v.length})</b>}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-[var(--hover)]"
              aria-label={`Quitar ${v}`}
            >
              <X size={11} />
            </button>
          </span>
        );
      })}
      <input
        className="flex-1 min-w-[110px] bg-transparent outline-none py-0.5 px-1"
        value={draft}
        placeholder={values.length ? "" : placeholder ?? "Escribe y pulsa Enter…"}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
      />
    </div>
  );
}
