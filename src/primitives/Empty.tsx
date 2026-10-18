"use client";

import { ReactNode } from "react";

// Centered empty state (no results, no data yet).
export function Empty({
  icon,
  title,
  children,
}: {
  /** Drawn at 36px. */
  icon?: ReactNode;
  title: string;
  /** A hint under the title. */
  children?: ReactNode;
}) {
  return (
    <div className="text-center py-10 text-muted">
      {icon && <div className="mb-2 inline-flex text-muted [&>svg]:w-9 [&>svg]:h-9">{icon}</div>}
      <div className="font-semibold text-[var(--foreground)]">{title}</div>
      {children && <div className="text-[13px] mt-1">{children}</div>}
    </div>
  );
}
