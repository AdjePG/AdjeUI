"use client";

/**
 * A busy circle: something is loading. It takes the current text colour (muted on a page, the
 * button's own inside a Button). `size` in px. `label` names it for screen readers; null when
 * something around it already says it (a loading Button).
 */
export function Spinner({ size = 16, label = "Loading", className = "" }: { size?: number; label?: string | null; className?: string }) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      className={`spinner inline-block shrink-0 rounded-full border-2 border-current border-r-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
