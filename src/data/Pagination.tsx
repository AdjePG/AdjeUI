"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

// Paginación de listas: total + anterior/siguiente.
export function Pagination({
  page,
  pageCount,
  total,
  onPage,
  noun = "resultados",
}: {
  page: number; // 1-indexed
  pageCount: number;
  total: number;
  onPage: (p: number) => void;
  noun?: string;
}) {
  if (pageCount <= 1) {
    return <div className="text-[13px] text-muted mt-3 pt-2 border-t border-[var(--border)]">{total} {noun}</div>;
  }
  return (
    <div className="flex items-center justify-between gap-2 text-[13px] text-muted mt-3 pt-2 border-t border-[var(--border)]">
      <span>{total} {noun}</span>
      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded-lg hover:bg-[var(--hover)] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-1">
          Página <b className="text-[var(--foreground)]">{page}</b> de {pageCount}
        </span>
        <button
          className="p-1.5 rounded-lg hover:bg-[var(--hover)] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          aria-label="Siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
