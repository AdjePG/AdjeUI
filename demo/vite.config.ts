import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Demo/escaparate de AdjeUI: `npm run demo` desde la raíz del repo.
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  // PORT permite arrancar en otro puerto (p. ej. dos previews a la vez).
  server: { port: Number(process.env.PORT) || 4400 },
});
