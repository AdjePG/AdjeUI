import type { ReactNode } from "react";

// Piezas que comparten todas las secciones de la demo.

export function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-3 scroll-mt-20">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-[13px] text-muted">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export function Block({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{name}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

// Marco punteado para ejemplos que necesitan un contenedor.
export function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`w-full border border-dashed border-[var(--border)] rounded-xl ${className}`}>{children}</div>;
}

export const SITES = [
  { id: "academia", nombre: "Academia Adrià", detalle: "tu academia" },
  { id: "aprendizaje", nombre: "Mi aprendizaje", detalle: "tus cursos como alumno" },
];
