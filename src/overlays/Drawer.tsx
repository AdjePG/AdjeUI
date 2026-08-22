"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { IconChip } from "../primitives/IconChip";

// Panel lateral (editores, paneles de IA). `footer` es la ZONA DE ACCIONES:
// barra fija abajo, siempre visible aunque el contenido haga scroll. Pásale
// los botones (guardar/cancelar); no los metas en children.
export function Drawer({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 drawer-fade" onClick={onClose} />
      <div
        className={`relative h-full w-full ${wide ? "sm:w-[640px]" : "sm:w-[440px]"} max-w-full bg-[var(--secondary)] border-l border-[var(--border)] shadow-2xl flex flex-col drawer-in`}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] shrink-0">
          <h3 className="font-semibold flex items-center gap-2">
            {icon && <IconChip>{icon}</IconChip>}
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[var(--hover)] inline-flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--border)] bg-[var(--secondary)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
