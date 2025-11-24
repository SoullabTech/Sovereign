// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // ✅ Ensures compatibility with SDKs like OpenAI
    setupFiles: ["./test-env.ts"], // ✅ Loads .env.test before tests
    include: ["src/**/*.{test,spec}.{ts,tsx}"], // 🎯 Focus on TS test files
    exclude: [
      "node_modules",
      "dist",
      ".idea",
      ".git",
      ".cache",
      "**/__mocks__/**",
      "**/__fixtures__/**", // Optional: ignore test fixture data
    ],
    reporters: process.env.CI ? ["default", "junit"] : ["default"], // 🧪 CI-friendly
    coverage: {
      provider: "v8",
      all: true,
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/__tests__/**", "**/__mocks__/**"],
      reporter: ["text", "html", "json"],
      reportsDirectory: "./coverage",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@services": path.resolve(__dirname, "src/services"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@types": path.resolve(__dirname, "src/types"),
    },
  },
});
