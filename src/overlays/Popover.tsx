"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Popover anchored to a trigger: closes on outside click or Escape. Used for
// pickers (site, account), notification bells and user menus.
//
//   <Popover placement="top" trigger={({ open, toggle }) => <button onClick={toggle}>…</button>}>
//     <Menu title="Account" items={[…]} />
//   </Popover>
//
// The panel is rendered into <body> through a portal with a fixed position
// computed from the trigger (13 Sep 2026; it used to be absolute inside the
// tree). That way NO container with overflow clips it —tables with horizontal
// scroll, cards, sticky panels—, which was the cause of menus cut in half.
// It repositions on scroll or resize, and if it doesn't fit below it opens
// upwards (and vice versa).
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
  align?: "start" | "end" | "stretch"; // stretch = same width as the trigger
  width?: number; // fixed panel width (px); overrides align="stretch"
  className?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width?: number } | null>(null);

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const r = anchor.getBoundingClientRect();
    const height = panel.offsetHeight;
    const panelWidth = width ?? (align === "stretch" ? r.width : panel.offsetWidth);
    const margin = 6;
    const gap = 8;

    // Vertical: the preferred side if it fits; else the other; else whichever has more room.
    const fitsBelow = r.bottom + margin + height <= window.innerHeight - gap;
    const fitsAbove = r.top - margin - height >= gap;
    let below = placement === "bottom" ? fitsBelow || !fitsAbove : !fitsAbove && fitsBelow;
    if (!fitsBelow && !fitsAbove) below = window.innerHeight - r.bottom >= r.top;
    let top = below ? r.bottom + margin : r.top - margin - height;
    top = Math.max(gap, Math.min(top, window.innerHeight - gap - height));

    // Horizontal: aligned to the trigger and kept inside the window.
    let left = align === "end" ? r.right - panelWidth : r.left;
    left = Math.max(gap, Math.min(left, window.innerWidth - gap - panelWidth));

    setPos({ top, left, width: width ?? (align === "stretch" ? r.width : undefined) });
  }, [align, placement, width]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    // Scroll of any container (capture phase) and resizes.
    document.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
      document.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  const close = () => setOpen(false);
  const toggle = () => setOpen((o) => !o);

  return (
    <div ref={anchorRef} className={`relative ${className}`}>
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
              // Invisible until measured: avoids the flicker in the corner.
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
