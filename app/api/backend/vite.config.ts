import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    root: ".", // Ensure Vite uses the project root
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"), // This resolves to the 'src' directory
        "@components": path.resolve(__dirname, "src/components"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@contexts": path.resolve(__dirname, "src/contexts"),
        "@routes": path.resolve(__dirname, "src/routes"), // If you have a routes directory
      },
    },
    build: {
      sourcemap: false,
      outDir: "dist",
      assetsDir: "assets",
      target: "esnext",
      minify: "esbuild",
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        input: path.resolve(__dirname, "index.html"),
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            framer: ["framer-motion"],
            supabase: ["@supabase/supabase-js"],
            vendor: ["react-router-dom", "classnames", "zustand"],
          },
        },
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: "http://localhost:4000", // Adjust for your backend API if necessary
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 5173,
      open: true,
      headers: {
        "x-powered-by": "Golden-Spiral-Portal",
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV ?? "development"),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test-utils/setupTests.ts",
      exclude: [
        "node_modules",
        "dist",
        ".idea",
        ".git",
        ".cache",
        "tests/playwright/**",
      ],
    },
  };
});
