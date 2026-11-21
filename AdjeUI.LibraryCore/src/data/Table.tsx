"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useScrollEdges } from "../controls/useScrollEdges";

// Standard table: wrapper with horizontal scroll + consistent styles for the
// header (muted, left-aligned), cells (px-2 py-2) and row separators.
// Used with regular <thead>/<tbody>/<tr>/<th>/<td>, no classes:
//
//   <Table minWidth={540}>
//     <thead><tr><th>Date</th><th className="text-right">Amount</th></tr></thead>
//     <tbody><tr><td>…</td></tr></tbody>
//   </Table>
//
// Wider than its box, it scrolls sideways, and a vertical hairline marks each
// side that has more to show, so cut-off cells do not look like a mistake.
//
// `stickyFirst` pins the first column (the row's name) while the rest scroll
// under it; the left line is then drawn on that column's edge, which is where
// the hidden content actually is. The pinned cells take `--card` as their
// background: pass `stickyBg` when the table sits on another surface.
//
// `scrollY` makes its own box scroll down too, with the header pinned, so the
// sideways bar stays in sight however long the table: give the wrapper a
// height (`wrapperClassName`, e.g. "min-h-0 flex-1" in a flex column). A
// hairline under the header and over the bottom marks rows hidden above and
// below, as the side ones do.
export function Table({
  children,
  minWidth = 520,
  className = "",
  wrapperClassName = "",
  stickyFirst = false,
  stickyBg = "var(--card)",
  scrollY = false,
}: {
  children: ReactNode;
  /** Below this width (px) the table scrolls sideways. */
  minWidth?: number;
  /** Classes on the <table>. */
  className?: string;
  /** Classes on the scroll box around it (margins, borders). */
  wrapperClassName?: string;
  /** Pin the first column while the rest scroll under it. */
  stickyFirst?: boolean;
  /** Background of the pinned cells when the table is not on --card. */
  stickyBg?: string;
  /** Scroll down inside its own box as well, the header pinned (the wrapper needs a height). */
  scrollY?: boolean;
}) {
  const { ref, measure, start, end, above, below, bar, sideBar } = useScrollEdges<HTMLDivElement>();
  // The pinned column's width, for the left line drawn on its edge; the cell
  // watched is picked again whenever the rows change.
  const [pinW, setPinW] = useState(0);
  useEffect(() => {
    const box = ref.current;
    if (!stickyFirst || !box) return setPinW(0);
    let watched: HTMLElement | null = null;
    const ro = new ResizeObserver(() => setPinW(watched?.offsetWidth ?? 0));
    const pick = () => {
      const cell = box.querySelector<HTMLElement>("tbody tr > :first-child") ?? box.querySelector<HTMLElement>("tr > :first-child");
      if (cell === watched) return;
      if (watched) ro.unobserve(watched);
      watched = cell;
      if (cell) ro.observe(cell);
      setPinW(cell?.offsetWidth ?? 0);
    };
    pick();
    const mo = new MutationObserver(pick);
    mo.observe(box, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [stickyFirst, ref]);
  // Pinned 1px past the edge: at a fractional position, what scrolls under it would peek out by a hairline.
  const sticky = stickyFirst
    ? "[&_tr>*:first-child]:sticky [&_tr>*:first-child]:-left-px [&_tr>*:first-child]:z-[2] [&_tr>*:first-child]:bg-[var(--sticky-bg)]"
    : "";
  // The header rides on top of the rows (and its pinned corner on top of both); the header and its rows take the
  // background too, so the seams between header rows, at fractional positions, hide what scrolls under them.
  // Rows hidden above: a hairline on the header's own bottom edge (separate borders let the row group draw it).
  const pinnedHead = scrollY
    ? `[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-[3] [&_thead]:bg-[var(--sticky-bg)] [&_thead_tr]:bg-[var(--sticky-bg)] [&_thead_th]:bg-[var(--sticky-bg)] [&_thead_tr>*:first-child]:z-[4] ${above ? "[&_thead]:shadow-[0_1px_0_var(--border)]" : ""}`
    : "";
  return (
    <div
      className={`relative ${scrollY ? "flex flex-col" : ""} ${wrapperClassName}`}
      style={stickyFirst || scrollY ? ({ "--sticky-bg": stickyBg } as CSSProperties) : undefined}
    >
      {/* code-scroll: thin bars (custom-scrollbar hides overflow-x). */}
      <div ref={ref} onScroll={measure} className={`${scrollY ? "min-h-0 flex-1 overflow-auto" : "overflow-x-auto overflow-y-hidden"} code-scroll`}>
        <table
          className={`w-full text-[13px] [&_th]:font-medium [&_th]:text-left [&_th]:text-muted [&_th]:px-2 [&_th]:py-2 [&_th]:whitespace-nowrap [&_td]:px-2 [&_td]:py-2 [&_tbody_tr]:border-t [&_tbody_tr]:border-[var(--border)] ${sticky} ${pinnedHead} ${className}`}
          style={{ minWidth }}
        >
          {children}
        </table>
      </div>
      {start && <span aria-hidden className="pointer-events-none absolute top-0 z-[3] w-px bg-[var(--border)]" style={{ left: stickyFirst ? pinW : 0, bottom: bar }} />}
      {end && <span aria-hidden className="pointer-events-none absolute top-0 z-[3] w-px bg-[var(--border)]" style={{ right: sideBar, bottom: bar }} />}
      {scrollY && below && <span aria-hidden className="pointer-events-none absolute left-0 z-[3] h-px bg-[var(--border)]" style={{ right: sideBar, bottom: bar }} />}
    </div>
  );
}
