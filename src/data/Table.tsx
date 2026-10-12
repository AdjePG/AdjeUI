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
// side that has more to show (26 Sep 2026): the cut-off cells no longer look
// like a mistake, and the line goes as soon as there is nothing more that way.
//
// `stickyFirst` pins the first column (the row's name) while the rest scroll
// under it; the left line is then drawn on that column's edge, which is where
// the hidden content actually is. The pinned cells take `--card` as their
// background: pass `stickyBg` when the table sits on another surface.
export function Table({
  children,
  minWidth = 520,
  className = "",
  stickyFirst = false,
  stickyBg = "var(--card)",
}: {
  children: ReactNode;
  minWidth?: number;
  className?: string;
  stickyFirst?: boolean;
  stickyBg?: string;
}) {
  const { ref, measure, start, end, bar } = useScrollEdges<HTMLDivElement>();
  // The pinned column's width: the left line is drawn on its edge, as one
  // element like the right one (a shadow per cell broke at every row and was
  // barely there).
  // Measured again whenever the table's rows change (11 Oct 2026): a table
  // whose header was rebuilt kept watching a cell no longer in it, and the
  // line fell to the left edge.
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
  const sticky = stickyFirst
    ? "[&_tr>*:first-child]:sticky [&_tr>*:first-child]:left-0 [&_tr>*:first-child]:z-[2] [&_tr>*:first-child]:bg-[var(--sticky-bg)]"
    : "";
  return (
    <div className="relative" style={stickyFirst ? ({ "--sticky-bg": stickyBg } as CSSProperties) : undefined}>
      {/* code-scroll, not custom-scrollbar (25 Sep 2026): custom-scrollbar is the
          vertical panels' bar and sets overflow-x: hidden, so a table wider than
          its box was cut off with no way across. This is the thin horizontal bar
          the code block wears. */}
      <div ref={ref} onScroll={measure} className="overflow-x-auto overflow-y-hidden code-scroll">
        <table
          className={`w-full text-[13px] [&_th]:font-medium [&_th]:text-left [&_th]:text-muted [&_th]:px-2 [&_th]:py-2 [&_th]:whitespace-nowrap [&_td]:px-2 [&_td]:py-2 [&_tbody_tr]:border-t [&_tbody_tr]:border-[var(--border)] ${sticky} ${className}`}
          style={{ minWidth }}
        >
          {children}
        </table>
      </div>
      {start && <span aria-hidden className="pointer-events-none absolute top-0 z-[3] w-px bg-[var(--border)]" style={{ left: stickyFirst ? pinW : 0, bottom: bar }} />}
      {end && <span aria-hidden className="pointer-events-none absolute right-0 top-0 z-[3] w-px bg-[var(--border)]" style={{ bottom: bar }} />}
    </div>
  );
}
