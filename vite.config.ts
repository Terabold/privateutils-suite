import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "/",
  server: {
    host: "127.0.0.1",
    port: 8899,
    strictPort: true,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "framer-motion",
      "lucide-react",
      "jspdf",
      "jszip",
      "html-to-image",
    ],
  },
  cacheDir: ".vite-cache",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});