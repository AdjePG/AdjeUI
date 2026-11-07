"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDismiss } from "../internal/layers";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect";
import { useMediaQuery } from "../internal/useMediaQuery";

// Panel anchored to a trigger: closes on outside click or Escape. Used for
// pickers, notification bells, user menus and the Select list.
//
//   <Popover placement="top" trigger={({ open, toggle }) => <button onClick={toggle}>…</button>}>
//     <Menu title="Account" items={[…]} />
//   </Popover>
//
// The panel is portalled into <body> with a fixed position computed from the
// trigger, so no overflow container clips it; it follows scrolls and resizes
// and opens upwards when it does not fit below. On a phone it becomes a
// BOTTOM SHEET (full width, over a scrim): anchoring needs a pointer that can
// aim and room around the trigger, and a thumb has neither.

const SHEET_QUERY = "(max-width: 639.98px)";

export function Popover({
  trigger,
  children,
  placement = "bottom",
  align = "stretch",
  width,
  className = "",
  panelClassName = "",
  sheet = true,
  role = "dialog",
}: {
  trigger: (p: { open: boolean; toggle: () => void; close: () => void }) => ReactNode;
  children: ReactNode | ((p: { close: () => void }) => ReactNode);
  /** Preferred side; it flips when there is no room. */
  placement?: "top" | "bottom";
  /** "stretch" = same width as the trigger. */
  align?: "start" | "end" | "stretch";
  /** Fixed panel width (px); overrides align="stretch". */
  width?: number;
  /** Classes on the anchor wrapper. */
  className?: string;
  /** Classes on the panel. Its max height is `--popover-max-h` (default: the window). */
  panelClassName?: string;
  /** false = stay anchored to the trigger on a phone too. */
  sheet?: boolean;
  /** ARIA role of the panel ("listbox" for a list of values). */
  role?: "dialog" | "listbox" | "menu";
}) {
  const [open, setOpen] = useState(false);
  // Read in JS, not CSS: on a sheet there is no position to compute.
  const narrow = useMediaQuery(SHEET_QUERY);
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

    const next = { top, left, width: width ?? (align === "stretch" ? r.width : undefined) };
    setPos((p) => (p && p.top === next.top && p.left === next.left && p.width === next.width ? p : next));
  }, [align, placement, width]);

  useIsoLayoutEffect(() => {
    if (!open || asSheet) {
      setPos(null);
      return;
    }
    place();
  }, [open, asSheet, place]);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useDismiss([anchorRef, panelRef], close, open);

  // Follow scrolls of any container (capture) and resizes, once per frame.
  useEffect(() => {
    if (!open || asSheet) return;
    let raf = 0;
    const schedule = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          place();
        });
    };
    document.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [open, asSheet, place]);

  const body = typeof children === "function" ? children({ close }) : children;

  return (
    <div ref={anchorRef} className={`relative ${className}`}>
      {trigger({ open, toggle, close })}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          asSheet ? (
            <>
              {/* The scrim makes it a sheet: the rest is out of play, and it is a big target to dismiss. */}
              <div className="drawer-fade fixed inset-0 z-[79] bg-black/45" onClick={close} aria-hidden />
              <div
                ref={panelRef}
                role={role}
                aria-modal={role === "dialog" || undefined}
                // Its own scrollbar with no gutter: the platform's landed on
                // the rounded corner, and a sheet opens at its final size.
                // No grab bar: the sheet cannot be dragged.
                className={`sheet-in custom-scrollbar scroll-no-gutter fixed inset-x-0 bottom-0 z-[80] card max-h-[80vh] overscroll-contain !rounded-b-none !rounded-t-2xl pb-[env(safe-area-inset-bottom)] ${panelClassName}`}
              >
                {body}
              </div>
            </>
          ) : (
            <div
              ref={panelRef}
              role={role}
              className={`fixed z-[80] card custom-scrollbar scroll-no-gutter max-h-[var(--popover-max-h,calc(100dvh-16px))] overscroll-contain blue-shadow toast-in ${panelClassName}`}
              style={{
                top: pos?.top ?? 0,
                left: pos?.left ?? 0,
                width: pos?.width ?? width,
                // Invisible until measured: avoids the flicker in the corner.
                visibility: pos ? "visible" : "hidden",
              }}
            >
              {body}
            </div>
          ),
          document.body,
        )}
    </div>
  );
}
