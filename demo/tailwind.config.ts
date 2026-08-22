import type { Config } from "tailwindcss";
import path from "path";

// Rutas absolutas con barras normales para que los globs funcionen igual en
// Windows y en Unix.
const p = (rel: string) => path.join(__dirname, rel).replace(/\\/g, "/");

export default {
  content: [p("./**/*.{ts,tsx,html}"), p("../src/**/*.{ts,tsx}")],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
