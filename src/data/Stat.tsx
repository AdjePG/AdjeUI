"use client";

import { ReactNode } from "react";
import { Card } from "../primitives/Card";
import { HelpTip } from "../overlays/HelpTip";
import { TONE_COLOR } from "../tokens/tone";

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
  /** Small line under the value. */
  hint?: ReactNode;
  /** Colour of the value; "accent" = gradient text. */
  tone?: "neutral" | "positive" | "negative" | "accent";
  /** HelpTip next to the label. */
  help?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-1">
      <div className="text-[13px] text-muted flex items-center gap-1.5">
        {icon && <span className="inline-flex">{icon}</span>}
        {label}
        {help && <HelpTip>{help}</HelpTip>}
      </div>
      <div
        className={`text-2xl font-bold tracking-tight ${tone === "accent" ? "app-gradient-text" : ""}`}
        style={tone === "positive" || tone === "negative" ? { color: TONE_COLOR[tone] } : undefined}
      >
        {value}
      </div>
      {hint && <div className="text-[12px] text-muted">{hint}</div>}
    </Card>
  );
}
