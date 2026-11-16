"use client";

import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import { X } from "lucide-react";
import { IconChip } from "../primitives/IconChip";
import { IconButton } from "../controls/IconButton";
import { useEscape } from "../internal/layers";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect";

// Side panel (editors, AI panels). `footer` is the ACTION ZONE: a bar fixed
// at the bottom, always visible even when the content scrolls. Pass it the
// buttons (save/cancel); don't put them in children.
//
// It opens with its content whole, never seen loading: while `loading` (the
// owner's data) or a part inside still loads (`useDrawerPending`), the panel is
// mounted but not shown, so each part keeps asking for its data; it slides in once
// all is there. Only the first load is waited for. Load the data ahead (when the
// pointer reaches what opens it) and it opens at once.

const PendingContext = createContext<((part: symbol, pending: boolean) => void) | null>(null);

/** Inside a Drawer: hold its content back while this part's data loads (outside one it does nothing). */
export function useDrawerPending(pending: boolean) {
  const report = useContext(PendingContext);
  const part = useRef(Symbol("part")).current;
  // Before paint, so the part is never seen half loaded.
  useIsoLayoutEffect(() => {
    report?.(part, pending);
    return () => report?.(part, false);
  }, [report, part, pending]);
}

export function Drawer({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  wide = false,
  loading = false,
}: {
  open: boolean;
  /** Escape, a click on the backdrop and the X call it. */
  onClose: () => void;
  title: string;
  /** Shown in an IconChip before the title. */
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** 640px instead of 440px (full width on a phone either way). */
  wide?: boolean;
  /** The owner's data is still loading: not shown until it (and every part inside) is ready. */
  loading?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEscape(onClose, open, [ref]);
  // The parts still loading, read at once (a ref) by the check below; the count re-renders it when they change.
  const pendingParts = useRef(new Set<symbol>());
  const [pendingCount, setPendingCount] = useState(0);
  const report = useCallback((part: symbol, pending: boolean) => {
    if (pendingParts.current.has(part) === pending) return;
    if (pending) pendingParts.current.add(part);
    else pendingParts.current.delete(part);
    setPendingCount(pendingParts.current.size);
  }, []);
  // Only the first load is waited for: once shown, a later refresh never hides what is being edited. Decided
  // after the parts inside have said whether they wait (their layout effects run first), before paint.
  const [shown, setShown] = useState(false);
  useIsoLayoutEffect(() => {
    if (!open) setShown(false);
    else if (!loading && pendingParts.current.size === 0) setShown(true);
  }, [open, loading, pendingCount]);
  if (!open) return null;
  // Hidden while it waits; the fade and the slide start the moment it shows.
  return (
    <div ref={ref} className={`fixed inset-0 z-50 flex justify-end ${shown ? "" : "invisible pointer-events-none"}`} role="dialog" aria-modal="true" aria-busy={!shown || undefined}>
      <div className={`absolute inset-0 bg-black/50 ${shown ? "drawer-fade" : ""}`} onClick={onClose} />
      <div
        className={`surface relative h-full w-full ${wide ? "sm:w-[640px]" : "sm:w-[440px]"} max-w-full bg-[var(--secondary)] border-l border-[var(--border)] shadow-2xl flex flex-col ${shown ? "drawer-in" : ""}`}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] shrink-0">
          <h3 className="font-semibold flex items-center gap-2">
            {icon && <IconChip>{icon}</IconChip>}
            {title}
          </h3>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <PendingContext.Provider value={report}>{children}</PendingContext.Provider>
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--border)] bg-[var(--secondary)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
