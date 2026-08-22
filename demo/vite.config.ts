import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Demo/escaparate de AdjeUI: `npm run demo` desde la raíz del repo.
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: { port: 4400 },
});
