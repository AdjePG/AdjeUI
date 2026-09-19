import type { Config } from "tailwindcss";
import path from "path";

// Absolute paths with forward slashes so the globs work the same on
// Windows and on Unix.
const p = (rel: string) => path.join(__dirname, rel).replace(/\\/g, "/");

export default {
  content: [p("./**/*.{ts,tsx,html}"), p("../src/**/*.{ts,tsx}")],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
