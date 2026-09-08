"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

// Popover anclado a un disparador: se cierra con clic fuera o Escape. Sirve
// para selectores (de sitio, de cuenta), campanitas y menús de usuario.
//
//   <Popover placement="top" trigger={({ open, toggle }) => <button onClick={toggle}>…</button>}>
//     <Menu title="Cuenta" items={[…]} />
//   </Popover>
//
// El panel se posiciona en absoluto respecto al disparador (ancho del
// disparador por defecto), así que el contenedor no debe recortar (overflow).
export function Popover({
  trigger,
  children,
  placement = "bottom",
  align = "stretch",
  width,
  className = "",
  panelClassName = "",
}: {
  trigger: (p: { open: boolean; toggle: () => void; close: () => void }) => ReactNode;
  children: ReactNode | ((p: { close: () => void }) => ReactNode);
  placement?: "top" | "bottom";
  align?: "start" | "end" | "stretch"; // stretch = mismo ancho que el disparador
  width?: number; // ancho fijo del panel (px); ignora align="stretch"
  className?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const close = () => setOpen(false);
  const toggle = () => setOpen((o) => !o);

  const pos = placement === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5";
  const side =
    width != null
      ? align === "end"
        ? "right-0"
        : "left-0"
      : align === "stretch"
      ? "left-0 right-0"
      : align === "end"
      ? "right-0"
      : "left-0";

  return (
    <div ref={ref} className={`relative ${className}`}>
      {trigger({ open, toggle, close })}
      {open && (
        <div
          role="dialog"
          className={`absolute z-50 ${pos} ${side} card overflow-hidden blue-shadow toast-in ${panelClassName}`}
          style={width != null ? { width } : undefined}
        >
          {typeof children === "function" ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}

// ---------------- Menu ----------------

export type MenuItem = {
  key?: string;
  label: ReactNode;
  hint?: ReactNode; // texto secundario debajo de la etiqueta
  icon?: ReactNode;
  onClick?: () => void;
  active?: boolean; // marcado con check (selección actual)
  danger?: boolean; // en rojo (salir, eliminar)
  disabled?: boolean;
};

// Lista de acciones para dentro de un Popover (o suelta). `onPick` se llama
// después del onClick del item: úsalo para cerrar el popover.
export function Menu({ title, items, onPick }: { title?: ReactNode; items: MenuItem[]; onPick?: () => void }) {
  return (
    <div className="p-1">
      {title && (
        <span className="block text-[9.5px] font-semibold uppercase tracking-widest text-muted px-2.5 pt-1.5 pb-1">{title}</span>
      )}
      {items.map((it, i) => (
        <button
          key={it.key ?? i}
          type="button"
          disabled={it.disabled}
          onClick={() => {
            it.onClick?.();
            onPick?.();
          }}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${
            it.active ? "bg-[var(--hover)]" : "hover:bg-[var(--hover)]"
          } ${it.danger ? "text-[var(--negative)]" : ""}`}
        >
          {it.icon && <span className={`inline-flex shrink-0 ${it.danger ? "" : "text-muted"}`}>{it.icon}</span>}
          <span className="flex-1 min-w-0">
            <span className="block truncate font-medium">{it.label}</span>
            {it.hint && <span className="block text-[11px] text-muted truncate">{it.hint}</span>}
          </span>
          {it.active && <Check size={14} className="shrink-0 text-[var(--accent-blue)]" />}
        </button>
      ))}
    </div>
  );
}
