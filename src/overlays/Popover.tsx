"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Popover anclado a un disparador: se cierra con clic fuera o Escape. Sirve
// para selectores (de sitio, de cuenta), campanitas y menús de usuario.
//
//   <Popover placement="top" trigger={({ open, toggle }) => <button onClick={toggle}>…</button>}>
//     <Menu title="Cuenta" items={[…]} />
//   </Popover>
//
// El panel se pinta en <body> con un portal y posición fija calculada desde el
// disparador (13 sep 2026; antes iba en absoluto dentro del árbol). Así NINGÚN
// contenedor con overflow lo recorta —tablas con scroll horizontal, tarjetas,
// paneles pegajosos—, que era el motivo de los menús cortados por la mitad.
// Se recoloca al hacer scroll o cambiar el tamaño, y si no cabe por abajo se
// abre hacia arriba (y al revés).
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
  const anclaRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width?: number } | null>(null);

  const colocar = useCallback(() => {
    const ancla = anclaRef.current;
    const panel = panelRef.current;
    if (!ancla || !panel) return;
    const r = ancla.getBoundingClientRect();
    const alto = panel.offsetHeight;
    const ancho = width ?? (align === "stretch" ? r.width : panel.offsetWidth);
    const margen = 6;
    const hueco = 8;

    // Vertical: la preferida si cabe; si no, la otra; si tampoco, la que más espacio tenga.
    const cabeAbajo = r.bottom + margen + alto <= window.innerHeight - hueco;
    const cabeArriba = r.top - margen - alto >= hueco;
    let abajo = placement === "bottom" ? cabeAbajo || !cabeArriba : !cabeArriba && cabeAbajo;
    if (!cabeAbajo && !cabeArriba) abajo = window.innerHeight - r.bottom >= r.top;
    let top = abajo ? r.bottom + margen : r.top - margen - alto;
    top = Math.max(hueco, Math.min(top, window.innerHeight - hueco - alto));

    // Horizontal: alineado al disparador y dentro de la ventana.
    let left = align === "end" ? r.right - ancho : r.left;
    left = Math.max(hueco, Math.min(left, window.innerWidth - hueco - ancho));

    setPos({ top, left, width: width ?? (align === "stretch" ? r.width : undefined) });
  }, [align, placement, width]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    colocar();
  }, [open, colocar]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (anclaRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    // Scroll de cualquier contenedor (fase de captura) y cambios de tamaño.
    document.addEventListener("scroll", colocar, true);
    window.addEventListener("resize", colocar);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
      document.removeEventListener("scroll", colocar, true);
      window.removeEventListener("resize", colocar);
    };
  }, [open, colocar]);

  const close = () => setOpen(false);
  const toggle = () => setOpen((o) => !o);

  return (
    <div ref={anclaRef} className={`relative ${className}`}>
      {trigger({ open, toggle, close })}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            className={`fixed z-[80] card overflow-hidden blue-shadow toast-in ${panelClassName}`}
            style={{
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              width: pos?.width ?? width,
              // Hasta medir, invisible: evita el parpadeo en la esquina.
              visibility: pos ? "visible" : "hidden",
            }}
          >
            {typeof children === "function" ? children({ close }) : children}
          </div>,
          document.body,
        )}
    </div>
  );
}
