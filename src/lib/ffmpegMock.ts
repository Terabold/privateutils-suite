// SSR-only mock to prevent "@ffmpeg/ffmpeg: ffmpeg.wasm does not support nodejs" error
export class FFmpeg {
  loaded = false;
  load = async () => {};
  terminate = () => {};
  on = () => {};
  off = () => {};
  writeFile = async () => {};
  readFile = async () => new Uint8Array();
  deleteFile = async () => {};
  exec = async () => 0;
}
export const fetchFile = async () => new Uint8Array();
export const toBlobURL = async () => "";
