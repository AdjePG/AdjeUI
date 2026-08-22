"use client";

import { ReactNode } from "react";

// Superficie base: fondo --card, borde y radio de 16px (clase .card de theme.css).
// glow añade la sombra de identidad de la app (--blue-shadow).
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
    <div className={`card p-4 sm:p-5 ${glow ? "blue-shadow" : ""} ${className}`}>{children}</div>
  );
}
