// The arithmetic of Calendar, apart so it can be tested without a browser: day keys, the six weeks a month
// shows, and a day's fill.

/** A slice of a day's fill, from the top; without `percent` the bands share what is left. "transparent" leaves it empty. */
export type CalendarBand = { color: string; percent?: number };

/** A local day as "YYYY-MM-DD", the key a CalendarDay is found by. */
export function calendarKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

/** The 42 days a month shows: six weeks from the Monday on or before its 1st. */
export function monthGrid(month: Date): Date[] {
  const first = firstOfMonth(month);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

/** A colour at `fill` % over the cell. */
export const tint = (color: string, fill: number) => (color === "transparent" ? "transparent" : `color-mix(in srgb, transparent, ${color} ${fill}%)`);

/** Stacked bands as a gradient: sized ones take their share (scaled down past 100 %), the rest share what is left. */
export function bandsFill(bands: CalendarBand[], fill: number): string {
  const claimed = bands.reduce((n, b) => n + Math.max(0, b.percent ?? 0), 0);
  const unsized = bands.filter((b) => b.percent == null).length;
  const spare = Math.max(0, 100 - claimed);
  const scale = claimed > 100 ? 100 / claimed : 1;
  let at = 0;
  const stops = bands.map((b) => {
    const share = b.percent != null ? Math.max(0, b.percent) * scale : unsized && spare ? spare / unsized : 100 / bands.length;
    const end = Math.min(100, at + share);
    const stop = `${tint(b.color, fill)} ${at.toFixed(2)}% ${end.toFixed(2)}%`;
    at = end;
    return stop;
  });
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}
