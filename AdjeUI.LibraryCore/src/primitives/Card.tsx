"use client";

import { ReactNode } from "react";

// Base surface: --card background, border and 16px radius (.card class from theme.css).
export function Card({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  /** Adds the app's identity shadow (--blue-shadow). */
  glow?: boolean;
}) {
  return (
    <div className={`card p-4 sm:p-5 ${glow ? "blue-shadow" : ""} ${className}`}>{children}</div>
  );
}
