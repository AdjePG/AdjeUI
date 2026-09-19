"use client";

import { ReactNode } from "react";
import { Card } from "../primitives/Card";
import { HelpTip } from "../overlays/HelpTip";

// Indicator card (KPI): label + large value + optional hint.
export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
  help,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "neutral" | "positive" | "negative" | "accent";
  help?: ReactNode;
  icon?: ReactNode;
}) {
  const color =
    tone === "positive"
      ? "text-[var(--positive)]"
      : tone === "negative"
      ? "text-[var(--negative)]"
      : tone === "accent"
      ? "app-gradient-text"
      : "";
  return (
    <Card className="flex flex-col gap-1">
      <div className="text-[13px] text-muted flex items-center gap-1.5">
        {icon && <span className="inline-flex">{icon}</span>}
        {label}
        {help && <HelpTip>{help}</HelpTip>}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
      {hint && <div className="text-[12px] text-muted">{hint}</div>}
    </Card>
  );
}
