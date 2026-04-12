import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

export const ffmpeg = typeof window !== "undefined" ? new FFmpeg() : {} as FFmpeg;

let loadPromise: Promise<boolean> | null = null;

export const preloadFFmpeg = () => {
  if (ffmpeg.loaded || loadPromise) return;
  loadPromise = (async () => {
    // Array of CDNs. It will try them in order.
    const cdns = [
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm", // Primary (Fastest)
      "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"             // Fallback
    ];

    for (const base of cdns) {
      try {
        console.log(`[FFmpeg] Attempting to load from: ${base}`);
        await ffmpeg.load({
          coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
        });
        console.log(`[FFmpeg] Successfully loaded from: ${base}`);
        return true; // Stop trying if successful
      } catch (error) {
        console.warn(`[FFmpeg] Failed to load from ${base}. Trying fallback...`);
      }
    }

    console.error("[FFmpeg] All CDNs failed to load.");
    return false;
  })();
};

export const getFFmpeg = async (): Promise<FFmpeg | null> => {
  if (ffmpeg.loaded) return ffmpeg;
  if (loadPromise) {
    const ok = await loadPromise;
    return ok ? ffmpeg : null;
  }
  preloadFFmpeg();
  const ok = await loadPromise!;
  return ok ? ffmpeg : null;
};

export const resetFFmpeg = async () => {
  if (ffmpeg.loaded) ffmpeg.terminate();
  loadPromise = null;
  preloadFFmpeg();
};