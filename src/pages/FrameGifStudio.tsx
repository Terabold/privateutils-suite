import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, Scissors, Camera, Layout, Terminal, Play, Pause, Trash2, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { toast } from "sonner";

interface CapturedFrame {
  id: string;
  url: string;
  time: number;
}

const FrameGifStudio = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frames, setFrames] = useState<CapturedFrame[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) return true;
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      return true;
    } catch (e) {
      toast.error("WASM Engine failed to initialize.");
      return false;
    }
  };

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(f);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
    setFrames([]);
    setCurrentTime(0);
    setProgress(0);
    toast.success("Studio Partitioned for Video Asset");
  };

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video || !file) return;

    setProcessing(true);
    const loaded = await loadFFmpeg();
    if (!loaded) return setProcessing(false);

    const ffmpeg = ffmpegRef.current;
    const time = video.currentTime;
    
    try {
      const { name } = file;
      await ffmpeg.writeFile(name, await fetchFile(file));
      const outName = `frame_${Date.now()}.png`;
      
      // Use FFmpeg for high-res extraction instead of canvas for better quality
      await ffmpeg.exec(['-ss', time.toString(), '-i', name, '-vframes', '1', '-q:v', '2', outName]);
      
      const data = await ffmpeg.readFile(outName);
      const url = URL.createObjectURL(new Blob([data as any], { type: "image/png" }));
      
      setFrames(prev => [...prev, { id: Math.random().toString(36), url, time }]);
      toast.success("Moment Captured!");
    } catch (e) {
      toast.error("Frame extraction error.");
    } finally {
      setProcessing(false);
    }
  };

  const renderGif = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    const loaded = await loadFFmpeg();
    if (!loaded) return setProcessing(false);

    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("progress", ({ progress }) => setProgress(Math.round(progress * 100)));

    try {
      const { name } = file;
      const start = range[0];
      const length = range[1] - range[0];
      
      if (length <= 0) {
        toast.error("Invalid range for GIF.");
        return;
      }

      await ffmpeg.writeFile(name, await fetchFile(file));
      const output = "output.gif";
      
      // Professional GIF filtering: Palette generation for best quality
      await ffmpeg.exec([
        '-ss', start.toString(),
        '-t', length.toString(),
        '-i', name,
        '-vf', 'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
        output
      ]);

      const data = await ffmpeg.readFile(output);
      const url = URL.createObjectURL(new Blob([data as any], { type: "image/gif" }));
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.[^.]+$/, "")}_moment.gif`;
      a.click();
      toast.success("GIF Master Exported!");
    } catch (e) {
      toast.error("GIF rendering failed.");
    } finally {
      setProcessing(false);
    }
  };

  const removeFrame = (id: string) => {
    setFrames(prev => {
      const f = prev.find(x => x.id === id);
      if (f) URL.revokeObjectURL(f.url);
      return prev.filter(x => x.id !== id);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <main className="container mx-auto max-w-[1400px] px-6 py-12">
        <div className="flex flex-col gap-10">
          <header className="flex items-center justify-between flex-wrap gap-8">
            <div className="flex items-center gap-6">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                   Frame & GIF <span className="text-primary italic">Studio</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Forensic Moment Extraction Engine</p>
              </div>
            </div>
            {file && (
               <Button onClick={() => { setFile(null); setVideoUrl(null); setFrames([]); }} variant="ghost" size="sm" className="gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all">
                  Wipe Stage
               </Button>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
            <div className="space-y-8">
              {!file ? (
                <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10 select-none">
                   <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => inputRef.current?.click()}
                    className="relative w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-40 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner group"
                  >
                    <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform">
                       <Upload className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-3xl font-black text-foreground uppercase tracking-tight italic">Drop Master Records</p>
                    <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">MP4, MOV, WebM Artifacts Supported</p>
                    <input ref={inputRef} type="file" className="hidden" accept="video/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                  </div>
                </Card>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden bg-black shadow-2xl relative">
                    <video 
                      ref={videoRef}
                      src={videoUrl!}
                      className="w-full aspect-video pointer-events-none"
                      onLoadedMetadata={(e) => {
                        setDuration(e.currentTarget.duration);
                        setRange([0, Math.min(e.currentTarget.duration, 5)]);
                      }}
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    />
                    
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                         <Button
                           size="icon"
                           variant="ghost"
                           className="h-12 w-12 rounded-full border border-white/10 text-white bg-white/5 hover:bg-white/10"
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
                           {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                         </Button>
                         
                         <div className="text-right">
                           <span className="text-xl font-black italic tracking-tighter text-white mr-2">{currentTime.toFixed(2)}s</span>
                           <span className="text-xs font-black text-white/30 tracking-widest uppercase">/ {duration.toFixed(2)}s</span>
                         </div>
                      </div>

                      <Slider 
                        max={duration} 
                        step={0.01} 
                        value={[currentTime]} 
                        onValueChange={([v]) => {
                          if (videoRef.current) videoRef.current.currentTime = v;
                          setCurrentTime(v);
                        }}
                        className="pb-4"
                      />
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-6">
                     <Button onClick={captureFrame} disabled={processing} className="h-20 text-lg font-black rounded-2xl gap-3 shadow-2xl shadow-primary/20 italic uppercase">
                        <Camera className="h-6 w-6" /> Capture Moment
                     </Button>
                     <Button onClick={renderGif} disabled={processing} variant="secondary" className="h-20 text-lg font-black rounded-2xl gap-3 italic uppercase border border-border/50">
                        <RefreshCw className={`h-6 w-6 ${processing ? "animate-spin" : ""}`} /> 
                        {processing ? "Baking GIF..." : "Render Clip to GIF"}
                     </Button>
                  </div>
                </div>
              )}

              {frames.length > 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="flex items-center gap-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary whitespace-nowrap leading-none">Captured Partition ({frames.length})</h3>
                    <div className="h-[1px] w-full bg-primary/20" />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                    {frames.map((frame) => (
                      <div key={frame.id} className="group relative rounded-xl overflow-hidden border border-border/50 bg-muted/5 shadow-lg">
                        <img src={frame.url} className="w-full aspect-video object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10" onClick={() => {
                             const a = document.createElement("a");
                             a.href = frame.url;
                             a.download = `frame_${frame.time.toFixed(2)}.png`;
                             a.click();
                           }}>
                             <Download className="h-4 w-4" />
                           </Button>
                           <Button size="icon" variant="ghost" className="h-10 w-10 text-destructive hover:bg-destructive/10" onClick={() => removeFrame(frame.id)}>
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[8px] font-black text-primary tracking-widest">{frame.time.toFixed(2)}s</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                 <div className="bg-primary/5 p-5 border-b border-primary/10">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">GIF Parameters</h3>
                 </div>
                 <CardContent className="p-8 space-y-10">
                    <div className="space-y-6">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block">Time Window (s)</label>
                       <Slider 
                         max={duration} 
                         step={0.1} 
                         value={range} 
                         onValueChange={(v) => setRange(v as [number, number])}
                         className="py-4"
                       />
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted/5 p-4 rounded-xl border border-border/50 text-center">
                             <p className="text-[9px] font-black uppercase opacity-40 mb-1">Start</p>
                             <p className="text-xl font-black italic tracking-tighter text-foreground">{range[0].toFixed(1)}s</p>
                          </div>
                          <div className="bg-muted/5 p-4 rounded-xl border border-border/50 text-center">
                             <p className="text-[9px] font-black uppercase opacity-40 mb-1">End</p>
                             <p className="text-xl font-black italic tracking-tighter text-foreground">{range[1].toFixed(1)}s</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-6 rounded-xl bg-primary/5 border border-primary/10 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5" /> High-DPI Encoding
                       </h4>
                       <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-80 font-medium">
                         Our **Lanczos Scaling** algorithm ensures zero color-banding on complex gradients while maintaining small file sizes.
                       </p>
                    </div>

                    <div className="pt-4">
                      {processing && (
                        <div className="mb-6 animate-in fade-in zoom-in-95 duration-500">
                          <div className="flex justify-between items-end mb-3">
                             <div className="flex items-center gap-2 text-primary">
                                <Terminal className="h-3 w-3" />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Baking Artifacts...</span>
                             </div>
                             <span className="text-xl font-black tracking-tighter italic text-primary">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2 w-full bg-primary/10" />
                        </div>
                      )}
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

export default FrameGifStudio;
