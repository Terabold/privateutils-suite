import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, RefreshCw, CloudUpload, Terminal, Minimize2, Maximize2, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
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

const RATIOS = [
  { id: "16:9", label: "16:9 Desktop", w: 16, h: 9, aspect: 16/9 },
  { id: "9:16", label: "9:16 Mobile", w: 9, h: 16, aspect: 9/16 },
  { id: "1:1", label: "1:1 Square", w: 1, h: 1, aspect: 1/1 },
  { id: "4:5", label: "4:5 Portrait", w: 4, h: 5, aspect: 4/5 },
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [displayTime, setDisplayTime] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const rAFRef = useRef<number>();

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
    setLogs(["Initializing Native Baking Engine...", "Preparing High-Precision Canvas..."]);

    try {
      const media = document.createElement("video");
      media.src = videoUrl!;
      media.muted = true;
      media.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        media.onloadedmetadata = () => resolve(true);
        media.onerror = () => reject(new Error("Media failed to load"));
        // Timeout
        setTimeout(() => reject(new Error("Timeout")), 5000);
      });

      const targetAspect = currentRatio.aspect;
      // Target high-res for recording
      let targetW, targetH;
      if (currentRatio.w >= currentRatio.h) {
         targetW = 1280;
         targetH = Math.round(1280 / targetAspect);
      } else {
         targetH = 1280;
         targetW = Math.round(1280 * targetAspect);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("Canvas context failed");

      const stream = canvas.captureStream(30); // 30 FPS
      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=h264') 
        ? 'video/mp4;codecs=h264' 
        : 'video/webm;codecs=vp9';
      
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000 // 5Mbps
      });

      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const originalExt = file.name.split('.').pop();
        a.download = `${file.name.replace(/\.[^.]+$/, "")}_aspect_${ratioId.replace(':', 'x')}.${originalExt || 'mp4'}`;
        a.click();
        setProcessing(false);
        toast.success("Social Artifact Baked Successfully!");
      };

      // Start "Baking" process
      setLogs(prev => [...prev, "Starting Real-Time Render Sequence..."]);
      
      recorder.start();
      media.play();

      const renderFrame = () => {
        if (!recorderRef.current || recorderRef.current.state === "inactive") return;

        const videoAspect = media.videoWidth / media.videoHeight;
        let drawW, drawH, drawX, drawY;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (mode === "pad") {
          if (videoAspect > targetAspect) {
            drawW = canvas.width;
            drawH = canvas.width / videoAspect;
            drawX = 0;
            drawY = (canvas.height - drawH) / 2;
          } else {
            drawH = canvas.height;
            drawW = canvas.height * videoAspect;
            drawY = 0;
            drawX = (canvas.width - drawW) / 2;
          }
        } else {
          if (videoAspect > targetAspect) {
            drawH = canvas.height;
            drawW = canvas.height * videoAspect;
            drawY = 0;
            drawX = (canvas.width - drawW) / 2;
          } else {
            drawW = canvas.width;
            drawH = canvas.width / videoAspect;
            drawX = 0;
            drawY = (canvas.height - drawH) / 2;
          }
        }

        ctx.drawImage(media, drawX, drawY, drawW, drawH);
        
        const prog = Math.min(100, Math.round((media.currentTime / media.duration) * 100));
        setProgress(prog);

        if (media.ended || media.currentTime >= media.duration) {
          recorder.stop();
          media.pause();
          setLogs(prev => [...prev, "Bake Complete. Porting Artifact..."]);
        } else {
          requestAnimationFrame(renderFrame);
        }
      };

      renderFrame();

    } catch (e) {
      console.error(e);
      toast.error("Native remapping failed.");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-video transition-all duration-300 overflow-x-hidden">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <main className="container mx-auto max-w-[1400px] px-4 py-4">
        <div className="flex flex-col gap-8">
          <header className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div>
               <h1 className="text-2xl md:text-3xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-none">
                  Aspect <span className="text-primary italic">Studio</span>
               </h1>
               <p className="text-muted-foreground mt-1 font-black uppercase tracking-[0.2em] opacity-40 text-[8px]">Social Media Aspect Ratio Remapping Engine</p>
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
                    <div 
                      className="relative bg-black flex items-center justify-center overflow-hidden transition-all duration-500 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5"
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
                    <div className="absolute top-8 left-8 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-primary">Live Projection : {ratioId}</div>
                  </Card>

                  <div className="w-full space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                     <div className="glass-morphism border-primary/5 bg-primary/5 p-3 rounded-[20px] space-y-3 shadow-2xl studio-gradient border-border/20">
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
              <Card className="glass-morphism border-primary/10 rounded-[32px] overflow-hidden shadow-xl studio-gradient border-border/20">
                 <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between">
                   <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Mapping System</h2>
                   {file && (
                     <Button 
                       onClick={() => { setFile(null); setVideoUrl(null); }} 
                       variant="ghost" 
                       size="sm" 
                       className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all"
                     >
                       Reset
                     </Button>
                   )}
                 </div>
                 <CardContent className="p-4 space-y-6">
                    <div className="space-y-4">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none block px-1">Target Aspect Ratio</p>
                       <div className="grid grid-cols-2 gap-3">
                          {RATIOS.map(r => (
                            <button
                              key={r.id}
                              id={`ratio-${r.id.replace(':', '-')}`}
                              onClick={() => setRatioId(r.id)}
                              className={cn(
                                "p-4 rounded-[16px] border-2 transition-all text-left group scale-active",
                                ratioId === r.id ? 'bg-primary/10 border-primary shadow-xl shadow-primary/10' : 'bg-muted/5 border-border/20 text-muted-foreground hover:bg-muted/10'
                              )}
                            >
                               <p className={cn("text-md font-bold uppercase tracking-tighter", ratioId === r.id && 'text-primary')}>{r.id}</p>
                               <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest mt-0.5 italic">{r.label}</p>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none block px-1">Remapping Mode</p>
                       <div className="flex gap-3">
                          <button
                            id="mode-pad"
                            onClick={() => setMode("pad")}
                            className={cn(
                              "flex-1 p-4 rounded-[16px] border-2 transition-all flex flex-col items-center gap-2 group scale-active",
                              mode === "pad" ? 'bg-primary/10 border-primary text-primary shadow-xl shadow-primary/10' : 'bg-muted/5 border-border/20 text-muted-foreground hover:bg-muted/10'
                            )}
                          >
                             <Minimize2 className="h-5 w-5" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Padded</span>
                          </button>
                          <button
                            id="mode-crop"
                            onClick={() => setMode("crop")}
                            className={cn(
                              "flex-1 p-4 rounded-[16px] border-2 transition-all flex flex-col items-center gap-2 group scale-active",
                              mode === "crop" ? 'bg-primary/10 border-primary text-primary shadow-xl shadow-primary/10' : 'bg-muted/5 border-border/20 text-muted-foreground hover:bg-muted/10'
                            )}
                          >
                             <Maximize2 className="h-5 w-5" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Cropped</span>
                          </button>
                       </div>
                    </div>

                    <div className="space-y-4">
                      {processing && (
                        <div className="animate-in fade-in zoom-in-95 duration-300 bg-background/50 p-6 rounded-3xl border border-primary/20 backdrop-blur-xl studio-gradient">
                          <div className="flex justify-between items-end mb-4">
                             <div className="flex items-center gap-3 text-primary/60">
                                <Terminal className="h-3 w-3" />
                                <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Baking Engine : Active</span>
                             </div>
                             <span className="text-2xl font-bold tracking-tighter italic text-primary">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2 w-full bg-primary/10 shadow-inner rounded-full" />
                          
                          <div className="mt-4 bg-zinc-950/80 backdrop-blur-xl rounded-xl p-4 font-mono text-[9px] text-primary/60 overflow-y-auto shadow-inner border border-white/5 min-h-[140px] flex flex-col">
                            <div className="space-y-1">
                              {logs.map((log, i) => (
                                <div key={i} className="leading-relaxed truncate border-l border-primary/20 pl-3 opacity-60 hover:opacity-100 transition-opacity">{`> ${log}`}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <Button 
                        id="export-asset-btn"
                        name="export-asset-btn"
                        onClick={processVideo} 
                        disabled={processing} 
                        className="w-full h-16 text-lg font-black rounded-[24px] gap-3 shadow-xl shadow-primary/10 italic uppercase bg-primary text-primary-foreground border-b-4 border-primary-foreground/20 active:border-b-0 active:translate-y-1 transition-all hover:scale-[1.01] relative overflow-hidden group/btn"
                      >
                         <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                         <RefreshCw className={cn("h-5 w-5 relative z-10", processing && "animate-spin")} /> 
                         <span className="relative z-10">{processing ? "Processing..." : "Export Asset"}</span>
                      </Button>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                       <p className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-[0.1em] opacity-40 italic leading-relaxed">High-precision aspect isolation utilizing native GPU-accelerated drawing buffers.</p>
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

export default VideoAspectStudio;
