"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Copy, Hash, Palette } from "lucide-react";
import { porLineas, tokenizar, type TipoToken } from "./resaltado";

// Bloque de código. Es un ELEMENTO, no formato de texto: por eso no vive
// dentro del editor enriquecido sino como pieza propia.
//
// Quien LEE manda sobre cómo lo ve (14 sep 2026): puede encender el color y
// los números de línea con dos botones, con el mismo aspecto que los de la
// barra del texto enriquecido. Son preferencias de lectura, no del autor.
//
// El color lo pone un resaltador propio y sin dependencias (resaltado.ts) que
// devuelve tokens y pinta React: no hay HTML inyectado.

const COLOR: Record<TipoToken, string | undefined> = {
  txt: undefined,
  str: "var(--code-str)",
  com: "var(--code-com)",
  num: "var(--code-num)",
  kw: "var(--code-kw)",
  fn: "var(--code-fn)",
  pun: "var(--code-pun)",
};

function BotonLectura({
  activo,
  onClick,
  label,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={activo}
      onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition ${
        activo
          ? "border-[var(--accent-blue)] bg-[var(--hover)] text-[var(--accent-blue)]"
          : "border-transparent text-muted hover:bg-[var(--hover)]"
      }`}
    >
      {children}
    </button>
  );
}

export function CodeBlock({
  code,
  language,
  copiable = true,
  colorPorDefecto = true,
  numerosPorDefecto = false,
  className = "",
}: {
  code: string;
  /** Etiqueta del lenguaje ("js", "python"…). También elige las reglas de color. */
  language?: string;
  copiable?: boolean;
  colorPorDefecto?: boolean;
  numerosPorDefecto?: boolean;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const [color, setColor] = useState(colorPorDefecto);
  const [numeros, setNumeros] = useState(numerosPorDefecto);

  const lineas = useMemo(() => porLineas(tokenizar(code, language)), [code, language]);
  const ancho = String(lineas.length).length;

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
    <div className={`overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--hover)] ${className}`}>
      <div className="flex items-center gap-1 border-b border-[var(--border)] px-2 py-1">
        {language && (
          <span className="px-1.5 font-mono text-[11px] uppercase tracking-wide text-muted">{language}</span>
        )}
        <span className="flex-1" />
        <BotonLectura activo={color} onClick={() => setColor(!color)} label="Colorear el código">
          <Palette size={14} />
        </BotonLectura>
        <BotonLectura activo={numeros} onClick={() => setNumeros(!numeros)} label="Números de línea">
          <Hash size={14} />
        </BotonLectura>
        {copiable && (
          <button
            type="button"
            onClick={copiar}
            title="Copiar el código"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted transition hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
          >
            {copiado ? <Check size={12} className="text-[var(--positive)]" /> : <Copy size={12} />}
            {copiado ? "Copiado" : "Copiar"}
          </button>
        )}
      </div>

      {/* La barra de desplazamiento se VE: antes iba con .sin-scrollbar y una
          línea larga no había forma de alcanzarla salvo con rueda horizontal. */}
      <pre className="codigo-scroll overflow-x-auto py-3 text-[13px] leading-[1.6]">
        <code className="block min-w-max font-mono">
          {lineas.map((linea, i) => (
            <span key={i} className="flex">
              {numeros && (
                // Pegado a la izquierda: al desplazarse en horizontal el número
                // se queda, que es justo para lo que sirve.
                <span
                  className="sticky left-0 shrink-0 select-none bg-[var(--hover)] pl-3.5 pr-3 text-right text-muted/70"
                  style={{ minWidth: `${ancho + 3}ch` }}
                  aria-hidden
                >
                  {i + 1}
                </span>
              )}
              <span className={numeros ? "pr-3.5" : "px-3.5"}>
                {linea.length ? (
                  linea.map((tk, j) => (
                    <span key={j} style={color && COLOR[tk.t] ? { color: COLOR[tk.t] } : undefined}>
                      {tk.v}
                    </span>
                  ))
                ) : (
                  <br />
                )}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
