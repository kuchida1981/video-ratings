import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
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
  })
);
