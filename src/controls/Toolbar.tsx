"use client";

import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, MoreHorizontal } from "lucide-react";
import { Button, ButtonVariant } from "./Button";

// Barra de acciones que se adapta al ancho disponible: muestra los botones que
// caben y guarda el resto en un menú "···". Así el header nunca parte a dos filas
// ni deja botones a medias. Uso: <Toolbar leading={<Select…/>} items={[…]} />.
//   - leading: control fijo que NO colapsa (p. ej. el selector de año).
//   - pinned:  el botón siempre visible (p. ej. la acción principal "Añadir").
//   - el resto colapsa al menú "···" por orden, de izquierda a derecha.
export type ToolbarItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  title?: string;
  active?: boolean; // botón tipo interruptor (se marca en el menú)
  pinned?: boolean; // nunca colapsa; se ancla al final
};

const GAP = 8; // = gap-2

function ToolbarButton({ item, compact }: { item: ToolbarItem; compact?: boolean }) {
  return (
    <Button
      variant={item.variant ?? "outline"}
      onClick={item.onClick}
      disabled={item.disabled}
      title={item.title ?? item.label}
      className={`shrink-0 ${compact ? "!px-2.5" : ""}`}
    >
      {item.icon}
      {!compact && item.label}
    </Button>
  );
}

function OverflowButton({ active, onClick }: { active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Más acciones"
      aria-label="Más acciones"
      className={`inline-flex h-[var(--control-h)] w-[var(--control-h)] shrink-0 items-center justify-center rounded-xl border border-[var(--border)] transition ${
        active ? "bg-[var(--hover)]" : "bg-[var(--card)] hover:bg-[var(--hover)]"
      }`}
    >
      <MoreHorizontal size={18} />
    </button>
  );
}

export function Toolbar({
  leading,
  items,
  className = "",
}: {
  leading?: ReactNode;
  items: ToolbarItem[];
  className?: string;
}) {
  const nonPinned = items.filter((i) => !i.pinned);
  const pinned = items.filter((i) => i.pinned);

  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(nonPinned.length);
  const [pinnedCompact, setPinnedCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const recompute = useCallback(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;
    const avail = row.clientWidth;
    const w = (el: HTMLElement | null) => (el ? el.offsetWidth : 0);
    const leadEl = measure.querySelector<HTMLElement>("[data-tb='leading']");
    const overflowEl = measure.querySelector<HTMLElement>("[data-tb='overflow']");
    const itemEls = Array.from(measure.querySelectorAll<HTMLElement>("[data-tb='item']"));
    const pinEls = Array.from(measure.querySelectorAll<HTMLElement>("[data-tb='pin']"));
    const pinIconEls = Array.from(measure.querySelectorAll<HTMLElement>("[data-tb='pin-compact']"));

    const leadW = leadEl ? w(leadEl) + GAP : 0;
    const overflowW = overflowEl ? w(overflowEl) + GAP : 0;
    const pinFullW = pinEls.reduce((s, el) => s + w(el) + GAP, 0);
    const pinIconW = pinIconEls.reduce((s, el) => s + w(el) + GAP, 0);
    const itemW = itemEls.map((el) => w(el) + GAP);
    const total = itemW.reduce((a, b) => a + b, 0);

    // Si el botón anclado con su etiqueta no cabe ni dejando todo lo demás en el
    // "···", pasa a solo-icono. Así el TÍTULO de la página nunca se recorta.
    const compact = leadW + (nonPinned.length ? overflowW : 0) + pinFullW > avail;
    const pinW = compact ? pinIconW : pinFullW;
    setPinnedCompact(compact);

    // ¿Caben todos sin necesidad de menú?
    if (leadW + pinW + total <= avail) {
      setVisibleCount(nonPinned.length);
      return;
    }
    // Hay que reservar sitio para el "···": metemos los que quepan por orden.
    let acc = leadW + pinW + overflowW;
    let k = 0;
    for (const iw of itemW) {
      if (acc + iw <= avail) {
        acc += iw;
        k++;
      } else break;
    }
    setVisibleCount(k);
  }, [nonPinned.length]);

  useLayoutEffect(() => {
    recompute();
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(row);
    return () => ro.disconnect();
  }, [recompute, items.length]);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  const shown = nonPinned.slice(0, visibleCount);
  const overflowed = nonPinned.slice(visibleCount);

  return (
    <div ref={rowRef} className={`relative flex w-full min-w-0 items-center justify-end gap-2 ${className}`}>
      {/* Medidor invisible: siempre a tamaño completo, para saber qué cabe */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none absolute -z-10 flex items-center gap-2 opacity-0"
        style={{ left: -99999, top: 0 }}
      >
        {leading && <div data-tb="leading">{leading}</div>}
        {nonPinned.map((it) => (
          <div data-tb="item" key={it.key}>
            <ToolbarButton item={it} />
          </div>
        ))}
        <div data-tb="overflow">
          <OverflowButton />
        </div>
        {pinned.map((it) => (
          <div data-tb="pin" key={it.key}>
            <ToolbarButton item={it} />
          </div>
        ))}
        {pinned.map((it) => (
          <div data-tb="pin-compact" key={it.key}>
            <ToolbarButton item={it} compact />
          </div>
        ))}
      </div>

      {/* Fila real */}
      {leading}
      {shown.map((it) => (
        <ToolbarButton key={it.key} item={it} />
      ))}
      {overflowed.length > 0 && (
        <div className="relative shrink-0" ref={menuRef}>
          <OverflowButton active={menuOpen} onClick={() => setMenuOpen((o) => !o)} />
          {menuOpen && (
            <div className="absolute right-0 z-50 mt-1.5 w-56 card p-1 blue-shadow toast-in">
              {overflowed.map((it) => (
                <button
                  key={it.key}
                  type="button"
                  disabled={it.disabled}
                  onClick={() => {
                    setMenuOpen(false);
                    it.onClick?.();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-[var(--hover)] disabled:opacity-40"
                >
                  {it.icon && <span className="inline-flex shrink-0 text-muted">{it.icon}</span>}
                  <span className="flex-1">{it.label}</span>
                  {it.active && <Check size={14} className="shrink-0 text-[var(--accent-blue)]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {pinned.map((it) => (
        <ToolbarButton key={it.key} item={it} compact={pinnedCompact} />
      ))}
    </div>
  );
}
