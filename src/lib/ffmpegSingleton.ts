import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

export const ffmpeg = new FFmpeg();
let loadPromise: Promise<boolean> | null = null;

export const preloadFFmpeg = () => {
  if (ffmpeg.loaded || loadPromise) return;
  loadPromise = (async () => {
    try {
      const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return true;
    } catch { return false; }
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
