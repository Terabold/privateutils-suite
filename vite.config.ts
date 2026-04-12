import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ command, mode }) => {
  const isSsrBuild = process.env.VITE_SSR_BUILD === "true";

  return {
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
        // Mock Browser-only libraries during SSR build
        ...(isSsrBuild ? {
          "@ffmpeg/ffmpeg": path.resolve(__dirname, "./src/lib/ffmpegMock.ts"),
          "@ffmpeg/util": path.resolve(__dirname, "./src/lib/ffmpegMock.ts"),
        } : {}),
      },
    },
    ssr: {
      noExternal: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
    },
    build: {
      emptyOutDir: true,
      minify: 'esbuild',
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
              if (id.includes('framer-motion')) return 'vendor-framer';
              if (id.includes('@ffmpeg')) return 'vendor-ffmpeg';
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html-to-image')) return 'vendor-document';
            }
          },
        },
      },
    },
  };
});