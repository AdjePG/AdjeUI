"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";

// Tarjeta seleccionable (categoría, tipo de activo, paso de un alta). Elegida
// se marca con borde en degradado — el mismo lenguaje que ChoiceOption, y se
// distingue del borde normal también en tema oscuro, cosa que el acento plano
// no conseguía.
export function PickCard({
  selected,
  onClick,
  icon,
  label,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition ${
        selected ? "borde-degradado" : "border-[var(--border)] hover:bg-[var(--hover)]"
      } ${className}`}
    >
      {icon}
      <span className="truncate text-sm font-semibold">{label}</span>
      {selected && <Check size={15} className="ml-auto shrink-0 text-[var(--accent-blue)]" />}
    </button>
  );
}
