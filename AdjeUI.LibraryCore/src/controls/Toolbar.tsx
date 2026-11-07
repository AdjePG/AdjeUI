"use client";

import { ReactNode, useCallback, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button, ButtonVariant } from "./Button";
import { Popover } from "../overlays/Popover";
import { Menu } from "../overlays/Menu";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect";

// Action bar that adapts to the available width: it shows the buttons that
// fit and moves the rest, in order, into a "···" menu, so a header never wraps
// or shows half a button.
//   <Toolbar leading={<Select…/>} items={[…]} />
export type ToolbarItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  /** Default "outline". */
  variant?: ButtonVariant;
  disabled?: boolean;
  title?: string;
  /** Toggle-style action: gets a check mark in the menu. */
  active?: boolean;
  /** Never collapses; anchored at the end (goes icon-only if even that does not fit). */
  pinned?: boolean;
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
  // Measures --control-h like the Buttons beside it (IconButton is 32px).
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
  /** Fixed control at the start that never collapses (a year selector). */
  leading?: ReactNode;
  items: ToolbarItem[];
  className?: string;
}) {
  const nonPinned = items.filter((i) => !i.pinned);
  const pinned = items.filter((i) => i.pinned);

  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(nonPinned.length);
  const [pinnedCompact, setPinnedCompact] = useState(false);

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

    // The pinned button goes icon-only if its label does not fit even with
    // everything else in the "···": the page title is never clipped.
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

  useIsoLayoutEffect(() => {
    recompute();
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(row);
    return () => ro.disconnect();
  }, [recompute, items.length]);

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
        <Popover
          align="end"
          width={224}
          className="shrink-0"
          trigger={({ open, toggle }) => <OverflowButton active={open} onClick={toggle} />}
        >
          {({ close }) => (
            <Menu
              items={overflowed.map((it) => ({
                key: it.key,
                label: it.label,
                icon: it.icon,
                onClick: it.onClick,
                disabled: it.disabled,
                active: it.active,
              }))}
              onPick={close}
            />
          )}
        </Popover>
      )}
      {pinned.map((it) => (
        <ToolbarButton key={it.key} item={it} compact={pinnedCompact} />
      ))}
    </div>
  );
}
