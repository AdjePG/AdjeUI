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
//
// On a phone it stops being anchored at all and becomes a BOTTOM SHEET: full
// width, stuck to the bottom edge, over a scrim (20 Sep 2026). Anchoring needs
// a pointer that can aim and room around the trigger; a thumb has neither.
// `sheet={false}` opts out for the cases where the panel must stay glued to its
// trigger (a field's own dropdown, for instance).
export function Popover({
  trigger,
  children,
  placement = "bottom",
  align = "stretch",
  width,
  className = "",
  panelClassName = "",
  sheet = true,
}: {
  trigger: (p: { open: boolean; toggle: () => void; close: () => void }) => ReactNode;
  children: ReactNode | ((p: { close: () => void }) => ReactNode);
  placement?: "top" | "bottom";
  align?: "start" | "end" | "stretch"; // stretch = same width as the trigger
  width?: number; // fixed panel width (px); overrides align="stretch"
  className?: string;
  panelClassName?: string;
  /** false = stay anchored to the trigger on a phone too. Default: true. */
  sheet?: boolean;
}) {
  const [open, setOpen] = useState(false);
  // Below `sm` the panel is a bottom sheet. Read with a media query and not
  // with a CSS class because the position is computed in JS: on a sheet there
  // is nothing to compute, and measuring the trigger would be wasted work.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639.98px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const asSheet = sheet && narrow;
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
    if (!open || asSheet) {
      setPos(null);
      return;
    }
    place();
  }, [open, asSheet, place]);

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
          asSheet ? (
            <>
              {/* The scrim is what makes it a sheet and not a box floating at
                  the bottom: it darkens the page, says the rest is out of play
                  and gives the thumb a huge target to dismiss with. */}
              <div className="drawer-fade fixed inset-0 z-[79] bg-black/45" onClick={close} aria-hidden />
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                // The sheet's own scrollbar and not the platform's: the panel
                // is 12px from the edge of a phone and the grey system bar
                // with its two arrows landed on top of the rounded corner. No
                // reserved gutter either — a sheet opens at its final size, so
                // there is nothing to stop from jumping (22 Sep 2026).
                className={`sheet-in custom-scrollbar scroll-no-gutter fixed inset-x-0 bottom-0 z-[80] card max-h-[80vh] overscroll-contain !rounded-b-none !rounded-t-2xl pb-[env(safe-area-inset-bottom)] ${panelClassName}`}
              >
                {/* No grab bar. It was drawn to say "this came up from the
                    bottom", but the sheet cannot be dragged: a handle that
                    does not drag is a control that lies, and the first thing
                    anyone asked about it was what it was for (22 Sep 2026).
                    The scrim and the slide up say where it came from. */}
                {typeof children === "function" ? children({ close }) : children}
              </div>
            </>
          ) : (
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
            </div>
          ),
          document.body,
        )}
    </div>
  );
}
