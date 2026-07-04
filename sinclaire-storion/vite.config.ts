import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Vite config tuned for Tauri desktop packaging.
// https://tauri.app/start/frontend/vite/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Tauri loads assets from a relative path inside the bundle.
  base: "./",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  clearScreen: false,
  css: {
    // Tailwind is handled by the @tailwindcss/vite plugin above. Pin an
    // (empty) inline PostCSS config so Vite does NOT search parent
    // directories and accidentally load the host repo's postcss.config.
    postcss: { plugins: [] },
  },
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    target: "es2021",
    sourcemap: false,
    outDir: "dist",
  },
});
