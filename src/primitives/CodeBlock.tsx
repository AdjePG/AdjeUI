"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// Bloque de código (14 sep 2026). Es un ELEMENTO, no formato de texto: por eso
// no vive dentro del editor enriquecido sino como pieza propia, con su lenguaje
// y su caja. En una app de programación se usa a todas horas y merece lo suyo:
// tipografía monoespaciada, el código sin reflujo (scroll horizontal, nunca
// partir una línea por la mitad) y un botón de copiar, que es lo primero que
// hace cualquiera que lo ve.
//
// Sin resaltado de sintaxis a propósito: eso pide una librería aparte y se
// puede añadir después sin tocar nada de lo guardado.

export function CodeBlock({
  code,
  language,
  copiable = true,
  className = "",
}: {
  code: string;
  /** Etiqueta del lenguaje ("js", "python"…). Solo informativa. */
  language?: string;
  copiable?: boolean;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {
      /* sin portapapeles no pasa nada: el código sigue seleccionable */
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--hover)] ${className}`}>
      {(language || copiable) && (
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-1.5">
          {language && (
            <span className="font-mono text-[11px] uppercase tracking-wide text-muted">{language}</span>
          )}
          {copiable && (
            <button
              type="button"
              onClick={copiar}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted transition hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
            >
              {copiado ? <Check size={12} className="text-[var(--positive)]" /> : <Copy size={12} />}
              {copiado ? "Copiado" : "Copiar"}
            </button>
          )}
        </div>
      )}
      <pre className="sin-scrollbar overflow-x-auto px-3.5 py-3 text-[13px] leading-[1.55]">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
