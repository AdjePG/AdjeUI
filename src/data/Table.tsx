"use client";

import { ReactNode } from "react";

// Standard table: wrapper with horizontal scroll + consistent styles for the
// header (muted, left-aligned), cells (px-2 py-2) and row separators.
// Used with regular <thead>/<tbody>/<tr>/<th>/<td>, no classes:
//
//   <Table minWidth={540}>
//     <thead><tr><th>Date</th><th className="text-right">Amount</th></tr></thead>
//     <tbody><tr><td>…</td></tr></tbody>
//   </Table>
export function Table({
  children,
  minWidth = 520,
  className = "",
}: {
  children: ReactNode;
  minWidth?: number;
  className?: string;
}) {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table
        className={`w-full text-[13px] [&_th]:font-medium [&_th]:text-left [&_th]:text-muted [&_th]:px-2 [&_th]:py-2 [&_th]:whitespace-nowrap [&_td]:px-2 [&_td]:py-2 [&_tbody_tr]:border-t [&_tbody_tr]:border-[var(--border)] ${className}`}
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  );
}
