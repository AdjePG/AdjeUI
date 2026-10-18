"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Overline } from "../primitives/Overline";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect";

// Folding panel (FAQs, hints, advanced options…): icon, the title as an
// Overline with an optional summary line, and a chevron that turns over. The
// whole header is the button. The content is clipped only while it moves, so
// anything that opens inside an open panel is never cut off; closed, it is
// hidden, so its fields cannot be tabbed into. A rule under the header fades
// in with the fold and keeps its 1px in both states, so nothing jumps.
export function Collapsible({
  title,
  icon,
  summary,
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  className = "",
}: {
  title: ReactNode;
  icon?: ReactNode;
  /** A line under the title saying what is inside ("Legend, size, axes…"). */
  summary?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Controlled: for a panel that closes itself (after picking something
   *  inside, or a click outside). Without it, it keeps its own state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Extra classes on the box (a background, when it sits over content). */
  className?: string;
}) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const [moving, setMoving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  // Clipped while it moves, whoever opens or closes it; set before paint, or
  // the content spills out of the box for one frame.
  const first = useRef(true);
  useIsoLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setMoving(true);
    // A timer and not transitionend: with reduced motion there is no
    // transition, and nothing would ever say it had finished.
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMoving(false), 220);
  }, [open]);

  function toggle() {
    if (openProp === undefined) setInner(!open);
    onOpenChange?.(!open);
  }

  return (
    <div className={`rounded-xl border border-[var(--border)] ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="group flex w-full items-center gap-2 rounded-[11px] px-3 py-2 text-left"
      >
        {icon && <span className="inline-flex shrink-0 text-muted [&>svg]:h-[15px] [&>svg]:w-[15px]">{icon}</span>}
        <span className="min-w-0 flex-1">
          <Overline className="block truncate">{title}</Overline>
          {summary && <span className="block truncate text-[11px] text-muted">{summary}</span>}
        </span>
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition group-hover:bg-[var(--hover)] group-hover:text-[var(--foreground)]">
          <ChevronUp size={15} className={`transition-transform duration-200 ${open ? "" : "rotate-180"}`} />
        </span>
      </button>
      <div
        aria-hidden
        className={`h-px transition-colors duration-200 ease-out motion-reduce:transition-none ${open ? "bg-[var(--border)]" : "bg-transparent"}`}
      />
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div
          className={`min-h-0 ${open && !moving ? "" : "overflow-hidden"}`}
          style={!open && !moving ? { visibility: "hidden" } : undefined}
          aria-hidden={!open}
        >
          <div className="px-3.5 pb-3.5 pt-3 text-[13px] leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
