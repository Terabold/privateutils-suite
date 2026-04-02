import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Scissors, RefreshCw, CloudUpload, Play, Pause, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
// @ts-ignore
import gifshot from "gifshot";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";
import VideoTimeline from "@/components/VideoTimeline";

const VideoToGif = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTarget, setProgressTarget] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, 0]);

  // Smooth Playhead Logic
  const [displayTime, setDisplayTime] = useState(0);
  const rAFRef = useRef<number>();

  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    toast.success("Stage Ready for GIF Rendering");
  };

  // Progress Smoothing Engine (Professional Crawl)
  useEffect(() => {
    if (progress < progressTarget) {
      const timeout = setTimeout(() => setProgress(p => Math.min(p + 1, progressTarget)), 30);
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

    try {
      const start = range[0];
      const length = range[1] - range[0];

      if (length <= 0) {
        toast.error("Invalid range for GIF.");
        setProcessing(false);
        return;
      }

      // Renaming "Simulation Stage" to "Baking Engine" logic internally as per user request
      gifshot.createGIF({
        video: [videoUrl],
        offset: start,
        numFrames: Math.round(10 * length), // target 10fps
        interval: 0.1,
        sampleInterval: 5,
        width: 480,
        height: 270,
        gifWidth: 480,
        gifHeight: 270,
        progressCallback: (prog: number) => {
          setProgressTarget(Math.round(prog * 100));
        },
      }, (obj: any) => {
        if (!obj.error) {
          const a = document.createElement("a");
          a.href = obj.image;
          a.download = `${file.name.replace(/\.[^.]+$/, "")}_moment.gif`;
          a.click();
          setProgressTarget(100);
          setProgress(100);
          toast.success("GIF Master Exported!");
        } else {
          toast.error("GIF rendering error.");
        }
        setProcessing(false);
      });
    } catch (e) {
      toast.error("GIF rendering failed.");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-video transition-all duration-300">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <main className="container mx-auto max-w-[1400px] px-6 py-4">
        <div className="flex flex-col gap-10">
          <header className="flex items-center gap-6 mb-2">
            <Link to="/">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-display uppercase italic text-shadow-glow">
                Video to <span className="text-primary italic">GIF</span>
              </h1>
              <p className="text-muted-foreground mt-1 font-bold uppercase tracking-[0.2em] opacity-40 text-[9px]">Professional GIF Rendering Studio</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-8">
              {!file ? (
                <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[600px] flex flex-col items-center justify-center relative bg-muted/5 rounded-[32px] shadow-inner p-10 select-none">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => !processing && inputRef.current?.click()}
                    className={`relative w-full h-full flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-primary/20 text-center transition-all ${!processing ? "cursor-pointer py-48 bg-background/50 hover:bg-primary/5 shadow-inner" : "py-48 opacity-50"}`}
                  >
                    <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                      <CloudUpload className="h-10 w-10 text-primary" />
                    </div>
                    <div className="px-6 space-y-1">
                      <p className="text-4xl font-bold text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Hub Artifact</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-40 italic mt-2">Drag or click to browse (MP4, MOV, WebM)</p>
                      <KbdShortcut />
                    </div>
                    <label htmlFor="gif-upload-input" className="sr-only">Upload Video for GIF</label>
                    <input id="gif-upload-input" name="gif-upload-input" ref={inputRef} type="file" className="hidden" accept="video/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                  </div>
                </Card>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
                  <Card className="glass-morphism border-primary/10 rounded-[32px] overflow-hidden bg-black shadow-2xl relative border border-border/50 max-w-2xl w-full mx-auto group">
                    <video
                      ref={videoRef}
                      src={videoUrl!}
                      onLoadedMetadata={(e) => {
                        setDuration(e.currentTarget.duration);
                        setRange([0, Math.min(e.currentTarget.duration, 5)]);
                      }}
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      className="w-full max-h-[40vh] object-contain"
                      crossOrigin="anonymous"
                    />

                    {/* Reset Button (Integrated into Workbench) */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 font-sans">
                      <Button
                        onClick={() => { setFile(null); setVideoUrl(null); }}
                        variant="destructive"
                        size="sm"
                        className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                      >
                        Reset Stage
                      </Button>
                    </div>
                  </Card>

                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="glass-morphism border-primary/5 bg-primary/5 p-6 rounded-[32px] space-y-6 shadow-xl studio-gradient border border-border/20">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
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

                          <div className="px-5 py-3 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-md">
                            <span className="text-2xl font-bold italic tracking-tighter text-primary font-mono">
                              {displayTime.toFixed(3)}s
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground/40 tracking-widest uppercase italic ml-2">
                              / {duration.toFixed(3)}s
                            </span>
                          </div>
                        </div>

                        <div className="hidden md:flex flex-col items-end">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1 italic opacity-60">High-Fidelity Editor</p>
                          <div className="flex gap-2">
                            {['NATIVE', 'LANCZOS', 'GIF'].map(tag => (
                              <span key={tag} className="text-[8px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 tracking-tighter italic">{tag}</span>
                            ))}
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

            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl border-border/20">
                <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Range Selection</h2>
                </div>
                <CardContent className="p-8 space-y-10">
                  <div className="space-y-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none block px-1">Precise Selection (Seconds)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/5 p-4 rounded-2xl border border-border/50 text-center relative group/mark overflow-hidden">
                        <p className="text-[9px] font-bold uppercase opacity-40 mb-1">Start Point</p>
                        <p className="text-xl font-bold italic tracking-tighter text-primary">{range[0].toFixed(3)}s</p>
                        <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-center bg-background/90 opacity-0 group-hover/mark:opacity-100 transition-opacity border-t border-border/50">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRange([currentTime, Math.max(currentTime + 0.1, range[1])])}
                            className="h-6 w-full text-[8px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
                          >
                            Mark In
                          </Button>
                        </div>
                      </div>
                      <div className="bg-muted/5 p-4 rounded-2xl border border-border/50 text-center relative group/mark overflow-hidden">
                        <p className="text-[9px] font-bold uppercase opacity-40 mb-1">End Point</p>
                        <p className="text-xl font-bold italic tracking-tighter text-primary">{range[1].toFixed(3)}s</p>
                        <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-center bg-background/90 opacity-0 group-hover/mark:opacity-100 transition-opacity border-t border-border/50">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRange([Math.min(range[0], currentTime - 0.1), currentTime])}
                            className="h-6 w-full text-[8px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
                          >
                            Mark Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-30 italic">Lanczos Scaling • 10 FPS • No Banding</p>

                  <div className="space-y-4">
                    {processing && (
                      <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-end mb-3">
                          <span className="text-[9px] font-bold uppercase tracking-widest leading-none text-primary/40 italic">Baking Engine : Active</span>

                          <span className="text-xl font-bold tracking-tighter italic text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 w-full bg-primary/10" />
                      </div>
                    )}

                    <Button
                      id="render-gif-btn"
                      name="render-gif-btn"
                      onClick={renderGif}
                      disabled={processing}
                      className="w-full h-16 text-md font-bold rounded-2xl gap-3 shadow-2xl shadow-primary/20 italic uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-95 border-b-4 active:border-b-0 active:translate-y-1"
                    >
                      <RefreshCw className={`h-5 w-5 ${processing ? "animate-spin" : ""}`} />
                      {processing ? "Baking Artifact..." : "Render to GIF"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="px-6">
                <AdPlaceholder format="rectangle" className="opacity-40 grayscale group-hover:grayscale-0 transition-all border-border/50" />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VideoToGif;
