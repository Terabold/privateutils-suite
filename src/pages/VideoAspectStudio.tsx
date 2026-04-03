import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, RefreshCw, CloudUpload, Terminal, Minimize2, Maximize2, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";
import VideoTimeline from "@/components/VideoTimeline";
import { cn } from "@/lib/utils";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const RATIOS = [
  { id: "16:9", label: "16:9 Desktop", w: 16, h: 9, aspect: 16 / 9 },
  { id: "9:16", label: "9:16 Mobile", w: 9, h: 16, aspect: 9 / 16 },
  { id: "1:1", label: "1:1 Square", w: 1, h: 1, aspect: 1 / 1 },
  { id: "4:5", label: "4:5 Portrait", w: 4, h: 5, aspect: 4 / 5 },
];

const VideoAspectStudio = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ratioId, setRatioId] = useState("9:16");
  const [mode, setMode] = useState<"pad" | "crop">("pad");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const loadingRef = useRef(false);
  const rAFRef = useRef<number>();

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) return true;
    if (loadingRef.current) return false;

    loadingRef.current = true;
    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return true;
    } catch (error) {
      console.error("FFmpeg Load Error:", error);
      toast.error("WASM Engine failed to initialize.");
      return false;
    } finally {
      loadingRef.current = false;
    }
  };

  const currentRatio = RATIOS.find(r => r.id === ratioId) || RATIOS[1];

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(f);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
    setCurrentTime(0);
    setDisplayTime(0);
    setProgress(0);
    toast.success("Ready for Aspect Remapping");
  };

  usePasteFile(handleFile);

  useEffect(() => {
    const update = () => {
      if (videoRef.current && !videoRef.current.paused) {
        setDisplayTime(videoRef.current.currentTime);
      }
      rAFRef.current = requestAnimationFrame(update);
    };
    rAFRef.current = requestAnimationFrame(update);
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, []);

  useEffect(() => {
    setDisplayTime(currentTime);
  }, [currentTime]);

  const processVideo = async () => {
    if (!file || !videoUrl) return;
    setProcessing(true);
    setProgress(0);

    let inputName = "";
    let outputName = "";

    try {
      const loaded = await loadFFmpeg();
      if (!loaded) return;
      const ffmpeg = ffmpegRef.current;

      inputName = `input_${file.name.replace(/\s+/g, '_')}`;
      outputName = `output.mp4`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      ffmpeg.on('progress', ({ progress }) => {
        const perc = Math.min(100, Math.round(progress * 100));
        setProgress(perc);
      });

      const targetAspect = currentRatio.aspect;
      let filter = "";

      if (mode === "pad") {
        filter = `pad='max(iw,ih*${targetAspect})':'max(ih,iw/${targetAspect})':(ow-iw)/2:(oh-ih)/2:black`;
      } else {
        filter = `crop='if(gt(ih*${targetAspect},iw),iw,ih*${targetAspect})':'if(gt(iw/${targetAspect},ih),ih,iw/${targetAspect})'`;
      }

      await ffmpeg.exec([
        '-i', inputName,
        '-vf', filter,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'ultrafast',
        '-crf', '28',
        '-threads', '1',
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as any], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.[^.]+$/, "")}_aspect_${ratioId.replace(':', 'x')}.mp4`;
      a.click();

      toast.success("Social Artifact Baked Successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Native remapping failed.");
    } finally {
      if (ffmpegRef.current && ffmpegRef.current.loaded) {
        try {
          if (inputName) await ffmpegRef.current.deleteFile(inputName);
          if (outputName) await ffmpegRef.current.deleteFile(outputName);
        } catch (cleanupErr) {
          console.warn("WASM RAM cleanup suppressed:", cleanupErr);
        }
      }
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 theme-video overflow-x-hidden">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
          <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
          <div className="p-8 rounded-2xl border-2 border-dashed border-primary/5 bg-primary/5 text-center mt-12 studio-gradient">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Verified Ad Space</p>
          </div>
        </aside>

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow overflow-visible">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-[0.8]">
                  Aspect <span className="text-primary italic">Studio</span>
                </h1>
                <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.3em] opacity-40 text-[10px]">Social Media Aspect Ratio Remapping Engine</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-8 space-y-8 flex flex-col items-center w-full">
                {!file ? (
                  <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[500px] w-full flex flex-col items-center justify-center relative bg-muted/5 rounded-3xl shadow-2xl p-10 select-none animate-in fade-in zoom-in-95 duration-500">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => !processing && inputRef.current?.click()}
                      className={cn(
                        "relative w-full h-[500px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all",
                        !processing ? "cursor-pointer bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner" : "opacity-50"
                      )}
                    >
                      <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                        <CloudUpload className="h-10 w-10 text-primary" />
                      </div>
                      <div className="px-6 space-y-1">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Artifact</p>
                        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-40 italic mt-2">MP4, MOV, WebM Artifacts Supported</p>
                      </div>
                      <label htmlFor="aspect-upload-input" className="sr-only">Upload Video for Aspect Remapping</label>
                      <input id="aspect-upload-input" name="aspect-upload-input" ref={inputRef} type="file" className="hidden" accept="video/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-8 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-300">
                    <Card className="glass-morphism border-primary/10 rounded-[32px] overflow-hidden bg-black shadow-2xl relative border-border/50 w-full max-w-4xl flex items-center justify-center p-3 min-h-[40vh]">
                      <div className="relative w-full h-full flex items-center justify-center cursor-crosshair active:cursor-grabbing">
                        {/* Reset Stage Button - Integrated with Frame Container */}
                        <div className="absolute top-8 right-8 z-20 flex gap-2 p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                          <Button
                            onClick={() => { setFile(null); setVideoUrl(null); }}
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl"
                          >
                            <RefreshCw className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="w-full h-full flex items-center justify-center overflow-hidden transition-all duration-500 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5"
                          style={{
                            aspectRatio: `${currentRatio.w} / ${currentRatio.h}`,
                            maxHeight: '45vh',
                            maxWidth: '100%',
                            height: 'auto',
                            width: 'auto'
                          }}
                        >
                          <video
                            ref={videoRef}
                            src={videoUrl!}
                            className={cn(
                              "w-full h-full transition-all duration-300",
                              mode === 'pad' ? "object-contain" : "object-cover"
                            )}
                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                            crossOrigin="anonymous"
                          />
                        </div>
                      </div>
                      <div className="absolute top-8 left-8 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-primary">Live Projection : {ratioId}</div>
                    </Card>

                    <div className="w-full space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="glass-morphism border-primary/5 bg-primary/5 p-3 rounded-[20px] space-y-3 shadow-2xl border-border/20">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex bg-black/20 p-1.5 rounded-xl border border-white/5 backdrop-blur-md shrink-0 shadow-inner">
                            <Button variant="ghost" size="icon" onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 0.0333) }} className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors">
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                if (videoRef.current?.paused) {
                                  videoRef.current.play();
                                  setIsPlaying(true);
                                } else {
                                  videoRef.current?.pause();
                                  setIsPlaying(false);
                                }
                              }}
                              className="h-9 w-14 bg-primary text-primary-foreground rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all mx-1.5"
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 0.0333) }} className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grow flex items-center justify-between bg-black/40 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold italic tracking-tighter text-primary font-mono">{displayTime.toFixed(3)}s</span>
                              <span className="text-[10px] font-bold text-muted-foreground/30 tracking-[0.2em] uppercase italic">/ {duration.toFixed(3)}s</span>
                            </div>
                            <p className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40 italic">Stage Monitor</p>
                          </div>
                        </div>

                        <div className="w-full">
                          <VideoTimeline
                            videoRef={videoRef}
                            src={videoUrl}
                            currentTime={currentTime}
                            duration={duration}
                            onSeek={(t) => {
                              if (videoRef.current) videoRef.current.currentTime = t;
                              setCurrentTime(t);
                            }}
                            showRange={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-[32px] overflow-hidden shadow-xl border-border/20">
                  <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Mapping System</h2>
                  </div>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block px-1 italic">Target Aspect Ratio</p>
                      <div className="grid grid-cols-2 gap-2">
                        {RATIOS.map(r => (
                          <button
                            key={r.id}
                            disabled={processing}
                            onClick={() => setRatioId(r.id)}
                            className={cn(
                              "p-3 rounded-2xl border-2 transition-all text-left group scale-active",
                              ratioId === r.id ? 'bg-primary/10 border-primary shadow-xl shadow-primary/10' : 'bg-muted/5 border-border/20 text-muted-foreground hover:bg-muted/10',
                              processing && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <p className={cn("text-xs font-black uppercase tracking-tighter italic", ratioId === r.id && 'text-primary')}>{r.id}</p>
                            <p className="text-[7px] font-black opacity-30 uppercase tracking-widest mt-0.5 leading-none italic">{r.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block px-1 italic">Remapping Mode</p>
                      <div className="flex gap-2">
                        <button
                          disabled={processing}
                          onClick={() => setMode("pad")}
                          className={cn(
                            "flex-1 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group scale-active",
                            mode === "pad" ? 'bg-primary/10 border-primary text-primary shadow-xl shadow-primary/10' : 'bg-muted/5 border-border/20 text-muted-foreground hover:bg-muted/10',
                            processing && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Minimize2 className="h-4 w-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest italic">Padded</span>
                        </button>
                        <button
                          disabled={processing}
                          onClick={() => setMode("crop")}
                          className={cn(
                            "flex-1 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group scale-active",
                            mode === "crop" ? 'bg-primary/10 border-primary text-primary shadow-xl shadow-primary/10' : 'bg-muted/5 border-border/20 text-muted-foreground hover:bg-muted/10',
                            processing && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Maximize2 className="h-4 w-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest italic">Cropped</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <AnimatePresence mode="wait">
                        {processing ? (
                          <motion.div
                            key="processing-hud"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="bg-background/50 p-6 rounded-3xl border border-primary/20 backdrop-blur-xl shadow-2xl"
                          >
                            <div className="flex flex-col items-center gap-6 text-center">
                              <div className="h-14 w-14 bg-primary/20 rounded-2xl flex items-center justify-center animate-pulse shadow-glow">
                                <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tighter italic text-shadow-glow">Baking Social Artifact</h3>
                              </div>
                              <div className="w-full space-y-3">
                                <Progress value={progress} className="h-1.5" />
                                <p className="text-[10px] font-black italic text-primary tracking-widest text-right">{progress}% COMPLETE</p>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="export-btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                          >
                            <Button
                              onClick={processVideo}
                              className="w-full h-16 text-lg font-black rounded-[24px] gap-3 shadow-xl shadow-primary/10 italic uppercase bg-primary text-primary-foreground border-b-4 border-primary-foreground/20 active:border-b-0 active:translate-y-1 transition-all hover:scale-[1.01] relative overflow-hidden group/btn"
                            >
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                              <RefreshCw className="h-5 w-5 relative z-10" />
                              <span className="relative z-10">Export Asset</span>
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-tight opacity-40 italic">High-precision aspect isolation utilizing native GPU-accelerated drawing buffers.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>

                <div className="px-6 pb-6">
                  <AdPlaceholder format="rectangle" className="opacity-40 grayscale group-hover:grayscale-0 transition-all border-border/50" />
                </div>
              </aside>
            </div>
          </div>
        </main>

        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-right-8 duration-1000">
          <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
          <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
          <div className="p-8 rounded-2xl border-2 border-dashed border-primary/5 bg-primary/5 text-center mt-12 studio-gradient">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Verified Ad Space</p>
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default VideoAspectStudio;
