import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, Terminal, CloudUpload, Activity, ShieldCheck, Settings2, FileType, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { usePasteFile } from "@/hooks/usePasteFile";
import { toast } from "sonner";
import { fetchFile } from "@ffmpeg/util";
import { imageDataToBmp } from "@/utils/bmpEncoder";
import { getFFmpeg, resetFFmpeg, ffmpeg as ffmpegInstance } from "@/lib/ffmpegSingleton";

const FFMPEG_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB

const UniversalMediaConverter = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [detectedMime, setDetectedMime] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (inputFile: File | undefined) => {
    let f = inputFile;
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    const isTs = ext === 'ts' || ext === 'm2ts';
    if (isTs && !f.type.startsWith('video/')) {
      f = new File([f], f.name, { type: 'video/mp2t' });
    }

    if (f.type.startsWith('video/') && f.size > 500 * 1024 * 1024) {
      toast.error("Video exceeds 500MB limit.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFile(f);
    setIsLargeFile((f.type.startsWith('video/') || f.type.startsWith('audio/')) && f.size > FFMPEG_SIZE_LIMIT);
    setOriginalSize(f.size);
    setResultUrl(null);
    setResultSize(0);
    setDetectedMime("");
    setTargetFormat("");
    setProgress(0);
    toast.success(`${f.name} staged for processing`);
    if (inputRef.current) inputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  usePasteFile(handleFile);

  const convertToWebmNative = async (file: File): Promise<Blob> => {
    const rawBlob = await new Promise<Blob>((resolve, reject) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.volume = 0;
      video.onloadedmetadata = () => {
        const stream = (video as any).captureStream(30);
        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp8,opus",
          videoBitsPerSecond: 2_500_000,
        });
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          URL.revokeObjectURL(video.src);
          resolve(new Blob(chunks, { type: "video/webm" }));
        };
        video.ontimeupdate = () => {
          setProgress(Math.round((video.currentTime / video.duration) * 45));
        };
        video.onended = () => recorder.stop();
        video.onerror = reject;
        recorder.start(250);
        video.play();
      };
      video.onerror = reject;
    });

    toast.info("Fixing WebM duration metadata...");
    setProgress(50);
    const ffmpeg = await getFFmpeg();
    if (!ffmpeg) return rawBlob;
    const inputData = new Uint8Array(await rawBlob.arrayBuffer());
    await ffmpeg.writeFile('webm_raw.webm', inputData);
    try {
      await ffmpeg.exec(['-i', 'webm_raw.webm', '-c', 'copy', 'webm_fixed.webm']);
    } catch (e: any) {
      if (!e?.message?.includes('Aborted')) throw e;
    }
    setProgress(90);
    let fixedData: any;
    try {
      fixedData = await ffmpeg.readFile('webm_fixed.webm');
    } catch {
      return rawBlob;
    }
    try { await ffmpeg.deleteFile('webm_raw.webm'); } catch (_) { }
    try { await ffmpeg.deleteFile('webm_fixed.webm'); } catch (_) { }
    return new Blob([fixedData], { type: 'video/webm' });
  };

  const convertFile = async () => {
    if (!file || !targetFormat) return;
    setProcessing(true);
    setProgress(0);
    setResultUrl(null);

    const imageFormats = ['png', 'jpg', 'webp', 'bmp'];
    const isNativeImage = imageFormats.includes(targetFormat);

    if (isNativeImage) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas context failed");
            ctx.drawImage(img, 0, 0);

            if (targetFormat === 'bmp') {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const blob = imageDataToBmp(imageData);
              finishNative(blob);
            } else {
              const mime = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
              canvas.toBlob((blob) => {
                if (blob) finishNative(blob);
              }, mime, 0.9);
            }
          };
        };

        const finishNative = (blob: Blob) => {
          setResultUrl(URL.createObjectURL(blob));
          setResultSize(blob.size);
          setDetectedMime(blob.type);
          setProgress(100);
          setTimeout(() => {
            setProcessing(false);
            toast.success("Artifact Generated via Native Pipeline");
          }, 300);
        };

        reader.readAsDataURL(file);
        return;
      } catch (err: any) {
        setProcessing(false);
        toast.error(`Native Fault: ${err.message}`);
        return;
      }
    }

    if (targetFormat === 'webm') {
      try {
        const blob = await convertToWebmNative(file);
        setResultUrl(URL.createObjectURL(blob));
        setResultSize(blob.size);
        setProgress(100);
        setProcessing(false);
        toast.success("Artifact Generated via Native Pipeline");
        return;
      } catch (err: any) {
        toast.error(`Native WebM Fault: ${err.message}`);
        setProcessing(false);
        return;
      }
    }

    let inputName = "";
    let outputName = "";

    try {
      if (!ffmpegInstance.loaded) {
        toast.info("Loading engine from CDN, this may take a moment...");
      }
      const ffmpeg = await getFFmpeg();
      if (!ffmpeg) throw new Error("Failed to load processing engine.");
      inputName = `input_${file.name.replace(/\s+/g, '_')}`;
      // Switch 'aac' to 'm4a' container (still using AAC codec) to provide a seekable index for browsers
      const actualOutputFormat = targetFormat === 'aac' ? 'm4a' : targetFormat;
      outputName = `output.${actualOutputFormat}`;

      // Use deep probing to ensure source headers are perfectly understood by the WASM engine
      let args = ['-analyzeduration', '100M', '-probesize', '100M', '-i', inputName];

      const isVideoFile = file.type.startsWith('video/');
      const srcExt = file.name.split('.').pop()?.toLowerCase();
      // TS conversion is sensitive to timestamps; disabling stream copy for TS to force a clean re-encode with generated PTS
      const canStreamCopy =
        (srcExt === 'mp4' && ['mkv', 'mov'].includes(targetFormat)) ||
        (srcExt === 'mkv' && ['mp4', 'mov'].includes(targetFormat)) ||
        (srcExt === 'mov' && ['mp4', 'mkv'].includes(targetFormat)) ||
        (srcExt === 'ts' && ['mp4', 'mkv'].includes(targetFormat)) ||
        (srcExt === 'm2ts' && ['mp4', 'mkv'].includes(targetFormat));

      if (canStreamCopy) {
        args.push('-c:v', 'copy', '-c:a', 'copy', '-copyts', '-avoid_negative_ts', 'make_zero');
        if (targetFormat === 'ts') args.push('-f', 'mpegts');
      } else {
        switch (targetFormat) {
          case 'mp4':
            args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'aac');
            break;
          case 'mkv':
            args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac');
            break;
          case 'mov':
            args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-f', 'mov');
            break;
          case 'ts':
            // High sync flags: genpts, global headers, and eliminate B-frames (-bf 0) for stable duration
            args.push('-fflags', '+genpts', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-copyts', '-avoid_negative_ts', 'make_zero', '-flags', '+global_header', '-bf', '0', '-f', 'mpegts');
            break;
          case 'mp3':
            args.push('-c:a', 'libmp3lame', '-ab', '192k');
            break;
          case 'wav':
            args.push('-c:a', 'pcm_s16le');
            break;
          case 'ogg':
            args.push('-c:a', 'libvorbis', '-q:a', '4');
            break;
          case 'flac':
            args.push('-c:a', 'flac');
            break;
          case 'aac':
          case 'm4a':
            // Added -fflags +genpts and explicit sample rate to prevent duration drift
            args.splice(0, 0, '-fflags', '+genpts');
            args.push('-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-movflags', '+faststart', '-write_id3v1', '1');
            break;
        }
      }

      args.push(outputName);

      let requiresPadding = false;
      const logHandler = ({ message }: { message: string }) => {
        console.log('[FFmpeg]', message);
        if (message.includes("not divisible by") || message.includes("width and height must be a multiple of")) {
          requiresPadding = true;
        }
      };

      const progressHandler = ({ progress }: { progress: number }) => {
        if (progress >= 0 && progress <= 1) {
          setProgress(Math.round(progress * 100));
        }
      };

      ffmpeg.on('log', logHandler);
      ffmpeg.on('progress', progressHandler);

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      let code = 0;
      try {
        code = await ffmpeg.exec(args);
      } catch (execErr: any) {
        const isAbort = execErr?.message?.includes("Aborted") || execErr?.message?.includes("abort");
        if (!isAbort) throw execErr;
      }

      if (code !== 0) {
        if (requiresPadding && isVideoFile) {
          const padFilter = "pad=ceil(iw/2)*2:ceil(ih/2)*2";
          const outIdx = args.indexOf(outputName);
          args.splice(outIdx, 0, '-filter:v', padFilter);
          try {
            code = await ffmpeg.exec(args);
          } catch (execErr: any) {
            const isAbort = execErr?.message?.includes("Aborted") || execErr?.message?.includes("abort");
            if (!isAbort) throw execErr;
            code = 0;
          }
        }
      }

      let data: any;
      try {
        data = await ffmpeg.readFile(outputName);
      } catch {
        throw new Error("Output file could not be read. Conversion may have failed silently.");
      }

      const mimeMap: Record<string, string> = {
        'mp4': 'video/mp4', 'webm': 'video/webm', 'mkv': 'video/x-matroska',
        'ts': 'video/mp2t', 'mov': 'video/quicktime',
        'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'flac': 'audio/flac',
        'm4a': 'audio/mp4', 'aac': 'audio/aac', 'ogg': 'audio/ogg'
      };

      const blob = new Blob([data as any], { type: mimeMap[targetFormat] || 'application/octet-stream' });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
      setDetectedMime(blob.type);
      setProgress(100);

      setTimeout(() => {
        setProcessing(false);
        toast.success("Artifact Generated via FFmpeg Pipeline");
      }, 500);

      ffmpeg.off('log', logHandler);
      ffmpeg.off('progress', progressHandler);

    } catch (err: any) {
      console.error("[Conversion Error]", err);
      if (err?.message?.includes("memory") || err?.message?.includes("bounds")) {
        await resetFFmpeg();
        toast.error("Device memory exhausted. Try a smaller file or close other tabs.");
      } else {
        toast.error(err?.message || "Conversion failed.");
      }
      setProcessing(false);
    } finally {
      if (ffmpegInstance.loaded) {
        try {
          if (inputName) await ffmpegInstance.deleteFile(inputName);
          if (outputName) await ffmpegInstance.deleteFile(outputName);
        } catch (_) { }
      }
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.[^.]+$/, "")}_converted.${targetFormat}`;
    a.click();
  };

  const srcExt = file?.name.split('.').pop()?.toLowerCase() || "";
  const VIDEO_EXTS = ['mp4', 'mkv', 'mov', 'ts', 'm2ts', 'webm'];
  const AUDIO_EXTS = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma'];
  const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'tiff'];

  const isVideo = file?.type.startsWith("video/") || VIDEO_EXTS.includes(srcExt);
  const isAudio = !isVideo && (file?.type.startsWith("audio/") || AUDIO_EXTS.includes(srcExt));
  const isImage = !isVideo && !isAudio && (file?.type.startsWith("image/") || IMAGE_EXTS.includes(srcExt));

  let formats = isVideo ? ["mp4", "mkv", "mov", "ts", "webm"] :
    isAudio ? ["mp3", "wav", "ogg", "flac", "m4a", "aac"] :
      isImage ? ["png", "jpg", "webp", "bmp"] : [];

  const filteredFormats = formats.filter(f => f !== srcExt && f !== 'gif');

  const isWebmNative = targetFormat === 'webm' && file?.type.startsWith('video/');
  const willStreamCopy = !isWebmNative && (
    (srcExt === 'mp4' && ['mkv', 'mov', 'ts'].includes(targetFormat)) ||
    (srcExt === 'mkv' && ['mp4', 'mov'].includes(targetFormat)) ||
    (srcExt === 'mov' && ['mp4', 'mkv'].includes(targetFormat)) ||
    (srcExt === 'ts' && ['mp4', 'mkv'].includes(targetFormat)) ||
    (srcExt === 'm2ts' && ['mp4', 'mkv'].includes(targetFormat))
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow overflow-visible">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  Universal Media <span className="text-primary italic">Engine</span>
                </h1>
                <p className="text-muted-foreground mt-1 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">High-Efficiency Browser-Native Conversion Engine</p>
              </div>
            </header>

            {/* Mobile Inline Ad removed for brevity as it is part of StickyAnchorAd below or separate logic */}

            <div className="flex flex-col lg:flex-row gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className={`w-full transition-all duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] space-y-8 ${file ? 'lg:w-[58.333%]' : 'lg:w-[66.666%]'}`}>
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl relative bg-card">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                    </div>
                    {file && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFile(null);
                          setResultUrl(null);
                          setProcessing(false);
                          setProgress(0);
                        }}
                        variant="destructive"
                        size="sm"
                        className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Asset</span>
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-6 lg:p-10 relative h-[530px] flex flex-col">
                    <AnimatePresence mode="wait" initial={false}>
                      {!file ? (
                        <>
                          <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                            onClick={() => !processing && inputRef.current?.click()}
                            className="relative w-full h-[450px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center cursor-pointer bg-primary/5 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.02] shadow-inner transition-all duration-300 group/upload"
                          >
                            <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover/upload:scale-110 transition-all">
                              <CloudUpload className="h-10 w-10 text-primary" />
                            </div>
                            <div className="px-6 space-y-2">
                              <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Artifact</p>
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-50">Drag master or click</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 italic pt-2">Max video size: 500MB</p>
                            </div>
                          </motion.div>
                          <input ref={inputRef} id="media-converter-upload-input" name="media-converter-upload-input" type="file" accept="video/*,image/*,audio/*,.mov,.mkv,.ts,.m2ts" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
                        </>
                      ) : (
                        <motion.div
                          key="processing"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="relative group w-full bg-background/40 p-10 rounded-2xl border border-primary/10 shadow-inner overflow-x-clip min-h-[450px] flex flex-col items-center justify-center studio-gradient backdrop-blur-3xl"
                        >
                          {processing ? (
                            <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                              <div className="h-24 w-24 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-8 shadow-2xl border border-primary/20 relative">
                                <RefreshCw className="h-10 w-10 animate-spin" />
                                <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse -z-10 rounded-full" />
                              </div>
                              <div className="space-y-4 max-w-sm">
                                <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Baking Bitstream</p>
                                <div className="space-y-4">
                                  <div className="flex justify-between items-end px-1">
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Temporal capture active</span>
                                    <span className="text-2xl font-black text-primary tracking-tighter italic leading-none">{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-2 bg-primary/10 shadow-inner" />
                                </div>
                              </div>
                            </div>
                          ) : resultUrl ? (
                            <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                              <div className="h-24 w-24 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl border border-emerald-500/20">
                                <ShieldCheck className="h-10 w-10" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Production Complete</p>
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-4">Artifact generated with 1:1 fidelity</p>
                              </div>
                              <Button onClick={download} className="mt-8 h-14 px-10 gap-3 text-sm font-black rounded-xl uppercase italic shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95">
                                <Download className="h-5 w-5" /> Export Artifact
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                              <div className="h-24 w-24 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-8 shadow-2xl border border-primary/20">
                                <Activity className="h-10 w-10 animate-spin-slow" />
                              </div>
                              <div className="space-y-2 max-w-md">
                                <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Artifact Scoped</p>
                                <p className="text-xs font-black text-primary truncate italic uppercase opacity-80 mt-2">{file.name}</p>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-4">{(file.size / 1024 / 1024).toFixed(2)} MB • READY FOR DISPATCH</p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </div>

              <aside className={`w-full transition-all duration-700 h-fit ${file ? 'lg:w-[41.666%]' : 'lg:w-[33.333%]'}`}>
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3">
                    <Settings2 className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary italic">Process Geometry</h3>
                  </div>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 italic leading-none px-1">Source Type</label>
                        <div className="flex items-center gap-3 bg-background/40 h-14 px-4 rounded-xl border border-primary/5">
                          <FileType className="h-5 w-5 text-primary opacity-60" />
                          <span className="text-sm font-black uppercase tracking-tighter text-foreground truncate">{file?.type?.split('/')[1] || "Waiting"}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 italic leading-none px-1">Target Spec</label>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              disabled={processing || !file}
                              className="w-full h-14 bg-background border-primary/10 rounded-xl font-black uppercase tracking-tighter text-sm shadow-inner px-4 flex items-center justify-between hover:bg-background/80"
                            >
                              <span className="truncate">{targetFormat ? targetFormat.toUpperCase() : "SET FORMAT"}</span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-morphism border-primary/20 min-w-[var(--radix-dropdown-menu-trigger-width)]">
                            {filteredFormats.map(fmt => (
                              <DropdownMenuItem
                                key={fmt}
                                onClick={() => setTargetFormat(fmt)}
                                className="font-black py-3 text-sm uppercase tracking-widest cursor-pointer text-center justify-center"
                              >
                                {fmt.toUpperCase()}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <Button
                      onClick={convertFile}
                      disabled={!targetFormat || processing || !file}
                      className="w-full gap-3 h-14 text-base font-black rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase italic"
                    >
                      <Terminal className="h-6 w-6" />
                      {processing ? "Baking Artifact..." : "Finalize Production"}
                    </Button>
                  </CardContent>
                </Card>
              </aside>
            </div>

            <ToolExpertSection
              title="Universal Media Engine"
              accent="blue"
              overview="When I designed the Universal Media Engine, my goal was to break the 'Upload to Transcode' cycle. This tool provides an industrial-grade interface for converting complex video and audio artifacts without relying on an external server cluster. It is built to maintain confidentiality for proprietary media workflows."
              steps={[
                "Upload your source media artifact (Video or Audio) to the local conversion engine.",
                "Select your target container format and codec parameters from the rendering matrix.",
                "The engine initializes a dedicated WebAssembly instance to handle the media stream.",
                "Download your converted file directly from the browser's heap memory once the progress bar reaches 100%.",
                "Your original and converted files are purged from RAM immediately upon closing the session."
              ]}
              technicalImplementation="The architecture of this converter is powered by ffmpeg.wasm, a direct WebAssembly port of the FFmpeg source code. I built a singleton orchestrator to manage the WASM lifecycle, preventing memory leaks and ensuring efficient resource allocation. By utilizing the SharedArrayBuffer API, the engine performs multi-threaded transcoding, bringing near-native processing speeds to the Browser Sandbox. The output is generated as a local Blob URL, bypassing the need for any backend storage."
              privacyGuarantee="The Privacy & Security Guarantee for this tool is absolute: zero network ingress or egress for your media data. I implemented this because traditional converters often log your filenames and metadata. Here, the entire transcode happens in your volatile hardware RAM. Once you exit the tab, the heap is garbage-collected, and the temporary virtual file system is vaporized."
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default UniversalMediaConverter;
