"use client";

import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

// Sección plegable (FAQs, detalles avanzados, guías). Cabecera con chevron
// que rota; el contenido se muestra/oculta sin animar la altura.
export function Collapsible({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold hover:bg-[var(--hover)] transition"
      >
        {icon && <span className="inline-flex text-muted [&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
        <span className="flex-1">{title}</span>
        <ChevronDown
          size={15}
          className={`text-muted shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 pt-0.5 text-[13px] leading-relaxed toast-in">{children}</div>
      )}
    </div>
  );
}
