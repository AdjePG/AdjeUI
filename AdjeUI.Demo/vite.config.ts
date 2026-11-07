import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// AdjeUI demo/showcase: `npm run demo` from the repo root.
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  // PORT allows starting on another port (e.g. two previews at once).
  server: { port: Number(process.env.PORT) || 4400 },
});
