"use client";

import { ReactNode } from "react";
import { IconChip } from "../primitives/IconChip";
import { HelpTip } from "../overlays/HelpTip";

// Título de sección dentro de una Card: chip + título + subtítulo + acciones.
export function SectionTitle({
  icon,
  title,
  subtitle,
  help,
  right,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  help?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h2 className="text-[17px] font-semibold flex items-center gap-2.5">
          {icon && <IconChip>{icon}</IconChip>}
          {title}
          {help && <HelpTip>{help}</HelpTip>}
        </h2>
        {subtitle && <p className="text-[13px] text-muted mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
