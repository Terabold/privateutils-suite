import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Manually extend Vite's UserConfig to avoid importing the recursive Vitest heavy type tree
export default defineConfig({
  plugins: [react() as any],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
} as UserConfig & { test: any });
