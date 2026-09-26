"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Overline } from "../primitives/Overline";

// Collapsible section (FAQs, hints, advanced options…). It is drawn like a
// folding panel (26 Sep 2026): the icon, the name as an Overline with an
// optional line under it saying what is inside, and at the end a chevron that
// turns over — one arrow travelling to where it is going, not two icons
// swapping. The whole header is the button; the chevron lights up with it.
// The content folds with an animation instead of popping in and out.
//
// While it moves, the content is clipped (that is what makes the fold); once
// open it is NOT, so a Select or anything else that opens inside it is never
// cut off (an overflow-hidden on the box showed two options out of four).
// Closed, it is hidden as well, so its fields cannot be tabbed into.
export function Collapsible({
  title,
  icon,
  summary,
  children,
  defaultOpen = false,
}: {
  title: ReactNode;
  icon?: ReactNode;
  /** A line under the title saying what is inside ("Legend, size, axes…"). */
  summary?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [moving, setMoving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  function toggle() {
    setOpen((o) => !o);
    setMoving(true);
    // A timer and not transitionend: with reduced motion there is no
    // transition, and nothing would ever say it had finished.
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMoving(false), 220);
  }

  return (
    <div className="rounded-xl border border-[var(--border)]">
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
        className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div
          className={`min-h-0 ${open && !moving ? "" : "overflow-hidden"}`}
          style={!open && !moving ? { visibility: "hidden" } : undefined}
          aria-hidden={!open}
        >
          <div className="px-3.5 pb-3.5 pt-1 text-[13px] leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
