"use client";

import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, MoreHorizontal } from "lucide-react";
import { Button, ButtonVariant } from "./Button";

// Action bar that adapts to the available width: it shows the buttons that
// fit and stores the rest in a "···" menu. That way the header never wraps to
// two rows or leaves half-visible buttons. Usage: <Toolbar leading={<Select.../>} items={[...]} />.
//   - leading: fixed control that does NOT collapse (e.g. the year selector).
//   - pinned:  the always-visible button (e.g. the main "Add" action).
//   - the rest collapse into the "···" menu in order, left to right.
export type ToolbarItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  title?: string;
  active?: boolean; // toggle-style button (gets a check mark in the menu)
  pinned?: boolean; // never collapses; anchored at the end
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
      title="More actions"
      aria-label="More actions"
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

    // If the pinned button with its label does not fit even with everything
    // else in the "···", it goes icon-only. That way the page TITLE is never clipped.
    const compact = leadW + (nonPinned.length ? overflowW : 0) + pinFullW > avail;
    const pinW = compact ? pinIconW : pinFullW;
    setPinnedCompact(compact);

    // Do they all fit without needing a menu?
    if (leadW + pinW + total <= avail) {
      setVisibleCount(nonPinned.length);
      return;
    }
    // Room has to be reserved for the "···": add as many as fit, in order.
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
      {/* Invisible measurer: always at full size, to know what fits */}
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

      {/* Real row */}
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
