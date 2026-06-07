import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      exclude: [
        "src/pages/**",
        "src/components/**",
        "src/ui/**",
        "src/App.tsx",
        "src/main.tsx",
        "src/index.css",
        "src/hooks/**",
        "src/lib/**",
        "src/types/**",
        "*.config.*",
        "*.config.js",
      ],
      thresholds: {
        "src/api/**": {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75,
      },
    },
  },
});
