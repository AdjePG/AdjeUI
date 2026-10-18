"use client";

import { useState } from "react";

// A person (or an organisation): their picture, or their initials on a colour
// when there is none or it fails to load.

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const SIZES: Record<AvatarSize, string> = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-[12px]",
  lg: "w-12 h-12 text-[15px]",
  xl: "w-14 h-14 text-xl",
  "2xl": "w-20 h-20 text-2xl",
  "3xl": "w-24 h-24 text-3xl",
};

/** "Ada Lovelace" → "AL"; "Ada" → "A". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export type AvatarProps = {
  /** Used for the initials and the image's alt text. */
  name: string;
  /** Image URL. Falls back to the initials if missing or broken. */
  src?: string | null;
  /** Background behind the initials: any CSS colour or gradient (`palette("teal", 600)`). Default: the app gradient. */
  color?: string;
  /** xs 20 · sm 24 · md 32 · lg 48 · xl 56 · 2xl 80 · 3xl 96 px. */
  size?: AvatarSize;
  shape?: "circle" | "square";
  /** The name is written next to it: hide the avatar from screen readers. */
  decorative?: boolean;
  className?: string;
};

export function Avatar({ name, src, color, size = "md", shape = "circle", decorative = false, className = "" }: AvatarProps) {
  const [broken, setBroken] = useState<string | null>(null);
  const base = `${SIZES[size]} ${shape === "circle" ? "rounded-full" : "rounded-lg"} shrink-0 ${className}`;
  if (src && broken !== src) {
    return <img src={src} alt={decorative ? "" : name} onError={() => setBroken(src)} className={`${base} object-cover bg-[var(--hover)]`} />;
  }
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      className={`${base} ${color ? "" : "bg-app-gradient"} inline-flex select-none items-center justify-center font-bold text-white`}
      style={color ? { background: color } : undefined}
    >
      {initials(name)}
    </span>
  );
}

/** Overlapping avatars with a "+N" chip for the ones that do not fit. */
export function AvatarStack({
  items,
  max = 4,
  size = "md",
  shape = "circle",
  className = "",
}: {
  items: (Pick<AvatarProps, "name" | "src" | "color"> & { key?: string })[];
  /** Avatars shown before the "+N" chip. */
  max?: number;
  size?: AvatarSize;
  shape?: "circle" | "square";
  className?: string;
}) {
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  const ring = "ring-2 ring-[var(--card)]";
  return (
    <span className={`inline-flex items-center ${className}`}>
      {shown.map((it, i) => (
        <Avatar
          key={it.key ?? i}
          name={it.name}
          src={it.src}
          color={it.color}
          size={size}
          shape={shape}
          className={`${ring} ${i > 0 ? "-ml-2" : ""}`}
        />
      ))}
      {rest > 0 && (
        <span
          title={items
            .slice(max)
            .map((it) => it.name)
            .join(", ")}
          className={`${SIZES[size]} ${shape === "circle" ? "rounded-full" : "rounded-lg"} ${ring} -ml-2 inline-flex shrink-0 items-center justify-center bg-[color-mix(in_srgb,var(--foreground)_10%,var(--card))] font-semibold text-[var(--foreground)]`}
        >
          +{rest}
        </span>
      )}
    </span>
  );
}
