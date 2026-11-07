// The colour of each meaning. Components that take a `tone` read it from
// here, so "negative" is the same red everywhere.
export type Tone = "neutral" | "accent" | "positive" | "negative" | "warning";

export const TONE_COLOR: Record<Tone, string> = {
  neutral: "var(--foreground)",
  accent: "var(--accent-blue)",
  positive: "var(--positive)",
  negative: "var(--negative)",
  warning: "var(--warning)",
};
