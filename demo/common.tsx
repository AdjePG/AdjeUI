import type { ReactNode } from "react";

// Pieces shared by every section of the demo.

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

// Dashed frame for examples that need a container.
export function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`w-full border border-dashed border-[var(--border)] rounded-xl ${className}`}>{children}</div>;
}

export const SITES = [
  { id: "academy", name: "Adrià's Academy", detail: "your academy" },
  { id: "learning", name: "My learning", detail: "your courses as a student" },
];
