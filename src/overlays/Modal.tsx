"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

// Diálogo centrado. `footer` es la ZONA DE ACCIONES: pásale los botones
// (crear/guardar/cancelar) y se pintan en una barra propia separada del
// contenido, igual en todos los diálogos. No los metas en children.
//
//   <Modal … footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button>
//                     <Button onClick={save}>Guardar</Button></>}>
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto custom-scrollbar"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`card w-full ${wide ? "max-w-3xl" : "max-w-lg"} my-8 blue-shadow flex flex-col`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[var(--hover)] inline-flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 pb-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[var(--border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
