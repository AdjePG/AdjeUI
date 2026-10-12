"use client";

import { ReactNode } from "react";

// Base surface: --card background, border and 16px radius (.card class from theme.css).
// glow adds the app's identity shadow (--blue-shadow).
export function Card({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    // --card-pad says how much padding it has, for whatever inside has to
    // reach its edge (a Table with `bleed`; 12 Oct 2026).
    <div className={`card p-4 [--card-pad:1rem] sm:p-5 sm:[--card-pad:1.25rem] ${glow ? "blue-shadow" : ""} ${className}`}>{children}</div>
  );
}
