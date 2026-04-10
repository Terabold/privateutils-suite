import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Robust Audio Engine hook that manages AudioContext lifecycle,
 * ObjectURL cleanup using stable references, and playback state.
 */
export const useAudioEngine = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const urlsRef = useRef<Set<string>>(new Set());

  // Cleanup Engine: Revokes URLs only on unmount or explicit cleanup
  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const cleanupUrls = useCallback(() => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current.clear();
  }, []);

  const createSafeUrl = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.add(url);
    return url;
  }, []);

  const handleFileChange = useCallback(async (f: File | undefined) => {
    if (!f) return;
    
    // Cleanup previous context safely
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== "closed") {
        await audioCtxRef.current.close().catch(() => {});
      }
      audioCtxRef.current = null;
    }
    
    cleanupUrls();
    setFile(f);
    const url = createSafeUrl(f);
    setObjectUrl(url);
    setAudioBuffer(null);
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentTime(0);

    return { file: f, url };
  }, [cleanupUrls, createSafeUrl]);

  return {
    file,
    setFile,
    audioBuffer,
    setAudioBuffer,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    objectUrl,
    setObjectUrl,
    audioCtxRef,
    audioRef,
    isPlayingRef,
    handleFileChange,
    createSafeUrl,
    cleanupUrls,
  };
};
