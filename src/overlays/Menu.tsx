"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";
import { formatShortcut, useEsMac } from "./shortcuts";

// Lista de acciones, normalmente dentro de un Popover. Vive en su propio
// archivo desde el 13 sep 2026 (antes iba pegado al Popover, y son dos cosas
// distintas: el Popover es una capa, el Menu es una lista).

export type MenuAction = {
  key?: string;
  label: ReactNode;
  hint?: ReactNode; // texto secundario debajo de la etiqueta
  icon?: ReactNode;
  onClick?: () => void;
  active?: boolean; // marcado con check (selección actual)
  danger?: boolean; // en rojo (salir, eliminar)
  disabled?: boolean;
  // Combinación de teclas ("mod+d", "shift+delete"…). El menú la PINTA; para
  // que funcione de verdad, engánchala con useShortcuts donde vivan las
  // acciones — el menú cerrado no puede escuchar nada.
  shortcut?: string;
};

// Línea divisoria: separa grupos de acciones dentro del mismo menú (lo de
// siempre antes de un "Eliminar").
export type MenuSeparator = { separator: true; key?: string };

export type MenuItem = MenuAction | MenuSeparator;

function esSeparador(it: MenuItem): it is MenuSeparator {
  return (it as MenuSeparator).separator === true;
}

// `onPick` se llama después del onClick del item: úsalo para cerrar el popover.
export function Menu({ title, items, onPick }: { title?: ReactNode; items: MenuItem[]; onPick?: () => void }) {
  const mac = useEsMac();
  return (
    <div className="p-1">
      {title && (
        <span className="block px-2.5 pb-1 pt-1.5 text-[9.5px] font-semibold uppercase tracking-widest text-muted">{title}</span>
      )}
      {items.map((it, i) => {
        if (esSeparador(it)) {
          return <hr key={it.key ?? `sep-${i}`} className="my-1 border-0 border-t border-[var(--border)]" />;
        }
        return (
          <button
            key={it.key ?? i}
            type="button"
            disabled={it.disabled}
            onClick={() => {
              it.onClick?.();
              onPick?.();
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
              it.active ? "bg-[var(--hover)]" : "hover:bg-[var(--hover)]"
            } ${it.danger ? "text-[var(--negative)]" : ""}`}
          >
            {it.icon && <span className={`inline-flex shrink-0 ${it.danger ? "" : "text-muted"}`}>{it.icon}</span>}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{it.label}</span>
              {it.hint && <span className="block truncate text-[11px] text-muted">{it.hint}</span>}
            </span>
            {it.shortcut && (
              <kbd className="shrink-0 rounded border border-[var(--border)] px-1.5 py-0.5 font-sans text-[10.5px] leading-none text-muted">
                {formatShortcut(it.shortcut, mac)}
              </kbd>
            )}
            {it.active && <Check size={14} className="shrink-0 text-[var(--accent-blue)]" />}
          </button>
        );
      })}
    </div>
  );
}
