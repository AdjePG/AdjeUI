"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Fila que no cabe (13 sep 2026): en vez de una barra de desplazamiento —fea,
// distinta en cada sistema y que en Mac ni se ve hasta que la tocas— aparecen
// dos flechas en los extremos. Cada una se muestra SOLO si queda contenido por
// ese lado, así que en cuanto cabe todo desaparecen las dos y no queda rastro.
//
// Envuelve cualquier fila horizontal:
//   <ScrollArrows><div className="flex gap-2">…</div></ScrollArrows>
//
// Lo usan Tabs y Segmented por dentro; también vale suelto.

export function ScrollArrows({
  children,
  className = "",
  paso = 140,
}: {
  children: ReactNode;
  className?: string;
  /** Píxeles que avanza cada pulsación. */
  paso?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [izq, setIzq] = useState(false);
  const [der, setDer] = useState(false);

  const medir = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // 1px de margen: los navegadores redondean y si no, la flecha derecha se
    // queda encendida para siempre al final del recorrido.
    setIzq(el.scrollLeft > 1);
    setDer(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    medir();
    // Hay que mirar tanto el contenedor (cambia de ancho) como el contenido
    // (cambian los items): con solo uno, las flechas se quedan desfasadas.
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    window.addEventListener("resize", medir);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [medir]);

  function mover(dir: -1 | 1) {
    ref.current?.scrollBy({ left: dir * paso, behavior: "smooth" });
  }

  return (
    <div className={`relative min-w-0 ${className}`}>
      <div ref={ref} onScroll={medir} className="sin-scrollbar overflow-x-auto overscroll-x-contain">
        {children}
      </div>

      {izq && <Flecha lado="izq" onClick={() => mover(-1)} />}
      {der && <Flecha lado="der" onClick={() => mover(1)} />}
    </div>
  );
}

// La flecha va sobre un velo degradado hacia el fondo, para que el contenido
// no se corte a hachazo limpio por debajo.
function Flecha({ lado, onClick }: { lado: "izq" | "der"; onClick: () => void }) {
  const izquierda = lado === "izq";
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 z-10 flex items-center ${izquierda ? "left-0 pr-6" : "right-0 pl-6"}`}
      style={{
        background: `linear-gradient(to ${izquierda ? "right" : "left"}, var(--card) 55%, transparent)`,
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={izquierda ? "Desplazar a la izquierda" : "Desplazar a la derecha"}
        onClick={onClick}
        className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-muted shadow-sm transition hover:text-[var(--foreground)]"
      >
        {izquierda ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </div>
  );
}
