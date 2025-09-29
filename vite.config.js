import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // 👈 habilita DOM simulado
    globals: true,        // 👈 para usar describe, it, expect sin importar
    setupFiles: "./src/setupTests.js", // 👈 archivo opcional de configuración
  },
});
