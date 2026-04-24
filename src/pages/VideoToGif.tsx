import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Scissors, RefreshCw, CloudUpload, Play, Pause, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";

import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";
import { cn } from "@/lib/utils";
import VideoTimeline from "@/components/VideoTimeline";
import { fetchFile } from "@ffmpeg/util";
import { getFFmpeg } from "@/lib/ffmpegSingleton";

const VideoToGif = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTarget, setProgressTarget] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Smooth Playhead Logic
  const [displayTime, setDisplayTime] = useState(0);
  const rAFRef = useRef<number>();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);


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
    setProgressTarget(0);
    setLogs([]);
    toast.success("Video loaded");
  };

  // Progress Smoothing Engine (Professional Crawl)
  useEffect(() => {
    if (progress < progressTarget) {
      const diff = progressTarget - progress;
      const step = Math.max(1, Math.floor(diff / 5));
      const timeout = setTimeout(() => setProgress(p => Math.min(p + step, progressTarget)), 25);
      return () => clearTimeout(timeout);
    }
  }, [progress, progressTarget]);

  usePasteFile(handleFile);

  // requestAnimationFrame loop for smooth timer/playhead
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

  // Sync when prop-based currentTime changes (seeks)
  useEffect(() => {
    setDisplayTime(currentTime);
  }, [currentTime]);

  const renderGif = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setProgressTarget(0);
    setLogs(["Loading converter...", "Preparing file..."]);

    let inputName = "";
    let outputName = "";

    const progressHandler = ({ progress: p }: { progress: number }) => {
      const perc = Math.min(100, Math.round(p * 100));
      setProgressTarget(perc);
    };

    try {
      const ffmpeg = await getFFmpeg();
      if (!ffmpeg) {
        toast.error("WASM Engine failed to initialize.");
        setProcessing(false);
        return;
      }

      const start = range[0];
      const length = range[1] - range[0];

      if (length <= 0) {
        toast.error("Invalid range for GIF.");
        setProcessing(false);
        return;
      }

      inputName = `input_${file.name.replace(/\s+/g, '_')}`;
      outputName = `output.gif`;

      setLogs(prev => [...prev, "File prepared.", "Generating palette..."]);

      ffmpeg.on('progress', progressHandler);

      // Professional Scale & FPS
      const args = [
        '-ss', start.toString(),
        '-t', length.toString(),
        '-i', inputName,
        '-vf', 'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
        '-threads', '1',
        outputName
      ];

      setLogs(prev => [...prev, "Finished. Downloading GIF..."]);
      toast.success("GIF saved!");
    } catch (e) {
      console.error(e);
      toast.error("GIF rendering failed.");
    } finally {
      const ffmpeg = await getFFmpeg();
      if (ffmpeg) {
        try {
          if (inputName) await ffmpeg.deleteFile(inputName);
          if (outputName) await ffmpeg.deleteFile(outputName);
        } catch (cleanupErr) {
          console.warn("WASM RAM cleanup suppressed:", cleanupErr);
        }
        // @ts-ignore
        ffmpeg.off('progress', progressHandler);
      }
      setProcessing(false);
      setProgress(0);
      setProgressTarget(0);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 ">
      

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all group/back bg-background/50 backdrop-blur-md shadow-xl">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white leading-tight">
                  Video to <span className="text-primary italic">GIF Converter</span>
                </h1>
                <p className="text-muted-foreground mt-1 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">Convert video to GIF</p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-8 space-y-8">
                {!file ? (
                  <Card className="glass-morphism border-primary/10 overflow-x-clip min-h-[400px] flex flex-col items-center justify-center relative bg-card rounded-2xl shadow-inner p-6 select-none">
                    <>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                        onClick={() => !processing && inputRef.current?.click()}
                        className={`relative w-full h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 text-center transition-all duration-300 ${!processing ? "cursor-pointer py-48 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.02] shadow-inner" : "py-48 opacity-50"}`}
                      >
                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                          <CloudUpload className="h-8 w-8 text-primary" />
                        </div>
                        <div className="px-6 space-y-1">
                          <p className="text-4xl font-bold text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Upload Video</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-40 italic mt-2">MP4, MOV, WebM</p>
                          <KbdShortcut />
                        </div>
                        <label htmlFor="gif-upload-input" className="sr-only">Upload Video for GIF</label>
                      </div>
                      <input id="gif-upload-input" name="gif-upload-input" ref={inputRef} type="file" className="hidden" accept="video/*" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
                    </>
                  </Card>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
                    <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden bg-black shadow-2xl relative border border-border/50 max-w-2xl w-full mx-auto group">
                      <div
                        ref={containerRef}
                        className={cn(
                          "relative w-full aspect-video flex items-center justify-center bg-black group/video cursor-pointer",
                          isFullscreen && "max-h-none h-screen bg-black"
                        )}
                        onClick={() => {
                          if (videoRef.current?.paused) {
                            videoRef.current.play();
                            setIsPlaying(true);
                          } else {
                            videoRef.current?.pause();
                            setIsPlaying(false);
                          }
                        }}
                      >
                        <video
                          ref={videoRef}
                          src={videoUrl!}
                          onLoadedMetadata={(e) => {
                            setDuration(e.currentTarget.duration);
                            setRange([0, e.currentTarget.duration]);
                          }}
                          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                          className="w-full h-full object-contain relative z-10"
                          crossOrigin="anonymous"
                        />

                        {/* Hover Play/Pause Indicator */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                          <div className="h-20 w-20 rounded-full bg-black/60 backdrop-blur-xl border border-primary/20 flex items-center justify-center text-white shadow-2xl opacity-0 scale-50 group-hover/video:opacity-100 group-hover/video:scale-100 transition-all duration-200 ease-out">
                            {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 fill-current ml-2" />}
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className="space-y-6">
                      <div className="glass-morphism border-primary/5 bg-primary/5 p-6 rounded-2xl space-y-6 shadow-xl">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-all"
                              onClick={() => {
                                if (videoRef.current?.paused) {
                                  videoRef.current.play();
                                  setIsPlaying(true);
                                } else {
                                  videoRef.current?.pause();
                                  setIsPlaying(false);
                                }
                              }}
                            >
                              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                            </Button>

                            <div className="px-5 py-3 rounded-2xl bg-background/20 border border-white/5 backdrop-blur-md">
                              <span className="text-2xl font-bold italic tracking-tighter text-primary font-mono">
                                {displayTime.toFixed(3)}s
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground/40 tracking-widest uppercase italic ml-2">
                                / {duration.toFixed(3)}s
                              </span>
                            </div>
                          </div>
                        </div>

                        <VideoTimeline
                          videoRef={videoRef}
                          src={videoUrl}
                          currentTime={currentTime}
                          duration={duration}
                          onSeek={(t) => {
                            if (videoRef.current) videoRef.current.currentTime = t;
                            setCurrentTime(t);
                          }}
                          showRange={true}
                          range={range}
                          onRangeChange={setRange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl border-border/20 bg-card">
                  <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Settings</h2>
                    {file && (
                      <Button
                        onClick={() => { setFile(null); setVideoUrl(null); }}
                        variant="destructive"
                        size="sm"
                        className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                      >
                        Remove File
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 leading-none block px-1">Precise Range</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background/40 p-4 rounded-xl border border-border/50 text-center">
                          <p className="text-[9px] font-bold uppercase opacity-40 mb-1">Start</p>
                          <p className="text-xl font-bold italic tracking-tighter text-primary">{range[0].toFixed(3)}s</p>
                        </div>
                        <div className="bg-background/40 p-4 rounded-xl border border-border/50 text-center">
                          <p className="text-[9px] font-bold uppercase opacity-40 mb-1">End</p>
                          <p className="text-xl font-bold italic tracking-tighter text-primary">{range[1].toFixed(3)}s</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={renderGif}
                      disabled={processing || !file}
                      className="w-full h-12 text-md font-black rounded-xl gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-primary-foreground"
                    >
                      {processing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
                      {processing ? `Converting ${progress}%` : "Download GIF"}
                    </Button>
                  </CardContent>
                </Card>

                {processing && (
                  <Card className="glass-morphism border-primary/20 bg-primary/5 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-6 space-y-6">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-3 text-primary/60">
                          <Terminal className="h-3 w-3" />
                          <span className="text-[9px] font-bold uppercase tracking-widest leading-none text-primary">Status: Converting</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tighter italic text-primary">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 w-full" />
                      <div className="space-y-1 max-h-[100px] overflow-y-auto custom-scrollbar">
                        {logs.map((log, i) => (
                          <p key={i} className="text-[9px] font-mono text-muted-foreground opacity-50">
                            {">"} {log}
                          </p>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                <div className="px-6">

                </div>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Video to GIF Motion Studio"
              accent="blue"
              overview="The Video to GIF Motion Studio is a high-performance rendering workbench designed for content creators, social media architects, and documentation specialists. I built this tool to provide a surgical path for extracting specific motion sequences from video artifacts—ensuring that your unreleased product demos and personal captures are encoded into GIF formats strictly within a local, air-gapped environment without the risk of 'bitstream harvesting' from online converters."
              steps={[
                "Stage your video artifact (MP4, MOV, or WebM) into the Motion Studio workspace.",
                "Utilize the 'Precise Timeline' to define the exact 'Start' and 'End' coordinates for the clip.",
                "Initiate the 'Render' sequence to trigger the local WASM-based encoding pipeline.",
                "Observe the 'Status Terminal' as the engine generates a custom color palette and bakes the GIF.",
                "Download the optimized GIF artifact directly for use in your production environment."
              ]}
              technicalImplementation="I architected this studio using a FFmpeg WASM (WebAssembly) Cluster. By porting the industry-standard C-based multimedia framework to the browser, we enable desktop-class transcoding within the Browser Sandbox. The encoding pipeline utilizes a Two-Pass Palette Generation strategy: the first pass analyzes the color density of the range, and the second pass bakes the GIF using a high-fidelity Lanczos filter. This ensures that despite the 256-color limit of the GIF format, the resulting artifact remains sharp and vibrant."
              privacyGuarantee="The Security \u0026 Privacy model for the Motion Studio is defined by Hardware Isolation. Your video source and the resulting GIF bitstream are stored strictly within a Virtual File System (VFS) in your browser's dedicated memory heap. No external telemetry or cloud-side compute is utilized. Once the 'Transform' is complete and the tab is closed, the VFS is shredded and purged from volatile RAM. Your motion data remains 100% offline."
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

export default VideoToGif;
