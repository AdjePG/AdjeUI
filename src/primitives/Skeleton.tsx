"use client";

// Placeholder de carga con brillo animado. Dale forma con className
// (p. ej. "h-4 w-32", "h-24 w-full", "w-9 h-9 rounded-full").
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`skeleton block rounded-lg ${className}`} />;
}
