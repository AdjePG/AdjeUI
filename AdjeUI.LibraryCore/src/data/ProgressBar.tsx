"use client";

import { TONE_COLOR } from "../tokens/tone";

// Thin progress bar (budgets, goals, file uploads).
// Uses the app gradient by default; tone makes it semantic.
export function ProgressBar({
  value,
  max = 100,
  tone = "accent",
  className = "",
}: {
  value: number;
  max?: number;
  tone?: "accent" | "positive" | "negative";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = tone === "accent" ? undefined : TONE_COLOR[tone];
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`h-2 w-full rounded-full overflow-hidden bg-[var(--hover)] ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${fill ? "" : "bg-app-gradient"}`}
        style={{ width: `${pct}%`, background: fill }}
      />
    </div>
  );
}
