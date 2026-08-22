"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";

// Tarjeta seleccionable (categoría, tipo de activo): borde de acento + check
// al elegir. Mismo aspecto en todos los diálogos.
export function PickCard({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left border-2 transition ${
        selected ? "border-[var(--accent-blue)] bg-[var(--hover)]" : "border-[var(--border)] hover:bg-[var(--hover)]"
      }`}
    >
      {icon}
      <span className="text-sm font-semibold truncate">{label}</span>
      {selected && <Check size={15} className="ml-auto shrink-0 text-[var(--accent-blue)]" />}
    </button>
  );
}
