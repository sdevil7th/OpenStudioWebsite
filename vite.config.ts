import { previewRoutes, downloadDevBridge } from "./shared/preview-routes";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), downloadDevBridge(), previewRoutes()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          // Share the small SVG icon library instead of dozens of tiny network requests.
          if (normalizedId.includes("/node_modules/lucide-react/")) return "icons";

          if (
            normalizedId.includes("/node_modules/react/") ||
            normalizedId.includes("/node_modules/react-dom/") ||
            normalizedId.includes("/node_modules/react-router-dom/") ||
            normalizedId.includes("/node_modules/react-router/") ||
            normalizedId.includes("/node_modules/@remix-run/router/")
          ) {
            return "react-vendor";
          }

          // Let Rollup follow dynamic imports: shared helpers must not pull optional artwork into the entry.
        },
      },
    },
  },
});
