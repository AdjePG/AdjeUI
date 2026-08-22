"use client";

import { ReactNode } from "react";

// Tabla estándar: envoltorio con scroll horizontal + estilos consistentes de
// cabecera (muted, a la izquierda), celdas (px-2 py-2) y separadores de fila.
// Se usa con <thead>/<tbody>/<tr>/<th>/<td> normales, sin clases:
//
//   <Table minWidth={540}>
//     <thead><tr><th>Fecha</th><th className="text-right">Importe</th></tr></thead>
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
