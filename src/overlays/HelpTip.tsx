"use client";

import { ReactNode, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";

// Tooltip de ayuda (¿qué es esto?). Solo hover/focus. El contenido puede ser
// texto o JSX con formato (<p>, <ul><li>, <b>…): se estiliza solo (.help-body).
export function HelpTip({ children, label }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number; width: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  // Posición calculada al abrir y ANCLADA al viewport (position: fixed), así el
  // globo nunca se sale por el borde derecho: se centra bajo el icono pero se
  // recorta a [8px, ancho-8px]. Fixed además escapa del recorte de las tarjetas.
  function show() {
    if (timer.current) clearTimeout(timer.current);
    const el = ref.current;
    if (el && typeof window !== "undefined") {
      const r = el.getBoundingClientRect();
      const width = Math.min(272, window.innerWidth - 16);
      let left = r.left + r.width / 2 - width / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
      setCoords({ left, top: r.bottom + 8, width });
    }
    setOpen(true);
  }
  function hide() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <span
      ref={ref}
      className="relative inline-flex align-middle"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span
        tabIndex={0}
        role="button"
        aria-label={label ?? "Más información"}
        className={`inline-flex items-center justify-center rounded-full transition-colors outline-none ${
          open ? "text-[var(--accent-blue)]" : "text-muted hover:text-[var(--accent-blue)]"
        }`}
      >
        <HelpCircle size={14} strokeWidth={2.25} />
      </span>
      {open && coords && (
        <span
          role="tooltip"
          className="fixed z-50 text-left cursor-default toast-in"
          style={{ left: coords.left, top: coords.top, width: coords.width }}
        >
          <span
            className="block rounded-2xl overflow-hidden"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "0 16px 40px -10px rgba(0,0,0,0.5)",
            }}
          >
            <span className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--accent-blue)]">
              <HelpCircle size={12} strokeWidth={2.5} /> {label ?? "¿Qué es esto?"}
            </span>
            <span className="help-body block px-3.5 pb-3 pt-0.5 text-[13px] leading-relaxed text-[var(--foreground)]">
              {children}
            </span>
          </span>
        </span>
      )}
    </span>
  );
}
