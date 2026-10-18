"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { Overline } from "../primitives/Overline";

// Help tooltip ("what is this?"). Hover/focus only. The content can be text or
// formatted JSX (<p>, <ul><li>, <b>…): it gets styled on its own (.help-body).
export function HelpTip({
  children,
  label,
}: {
  children: ReactNode;
  /** aria-label of the icon and heading of the bubble. Default "More info" / "What is this?". */
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number; width: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  // Fixed to the viewport (escapes the cards' clipping) and computed on open,
  // so a scroll would leave it behind: any scroll closes it.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("scroll", close, true);
    return () => document.removeEventListener("scroll", close, true);
  }, [open]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Centred under the icon but clamped to [8px, width-8px].
  function show() {
    if (timer.current) clearTimeout(timer.current);
    const el = ref.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const width = Math.min(272, window.innerWidth - 16);
      const left = Math.max(8, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 8));
      setCoords({ left, top: r.bottom + 8, width });
    }
    setOpen(true);
  }
  function hide() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <span
      ref={ref}
      className="relative inline-flex align-middle"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span
        tabIndex={0}
        role="button"
        aria-label={label ?? "More info"}
        className={`inline-flex items-center justify-center rounded-full transition-colors outline-none ${
          open ? "text-[var(--accent-blue)]" : "text-muted hover:text-[var(--accent-blue)]"
        }`}
      >
        <HelpCircle size={14} strokeWidth={2.25} />
      </span>
      {open && coords && (
        <span
          role="tooltip"
          className="fixed z-50 text-left cursor-default toast-in"
          style={{ left: coords.left, top: coords.top, width: coords.width }}
        >
          <span className="block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)]">
            <Overline tone="current" className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-1 text-[var(--accent-blue)]">
              <HelpCircle size={12} strokeWidth={2.5} /> {label ?? "What is this?"}
            </Overline>
            <span className="help-body block px-3.5 pb-3 pt-0.5 text-[13px] leading-relaxed text-[var(--foreground)]">
              {children}
            </span>
          </span>
        </span>
      )}
    </span>
  );
}
