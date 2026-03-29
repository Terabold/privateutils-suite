import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, RefreshCw, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const UniversalMediaConverter = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [videoSpeed, setVideoSpeed] = useState<string>("1.0");
  const [logs, setLogs] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const ffmpegRef = useRef(new FFmpeg());

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) return true;

    setIsDownloadingModel(true);
    setDownloadProgress(0);

    ffmpeg.on("log", ({ message }) => {
      setLogs(prev => [...prev.slice(-4), message]);
    });

    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      let p = 0;
      const interval = setInterval(() => {
        p += 5;
        if (p <= 95) setDownloadProgress(p);
      }, 300);

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      clearInterval(interval);
      setDownloadProgress(100);
      setIsDownloadingModel(false);
      return true;
    } catch (e) {
      console.error(e);
      setIsDownloadingModel(false);
      return false;
    }
  };

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setTargetFormat("");
    setProgress(0);
    setLogs([]);
  };

  const isVideo = file?.type.startsWith("video/");
  const isImage = file?.type.startsWith("image/");
  const isAudio = file?.type.startsWith("audio/");

  const availableFormats = isVideo 
    ? ["mp4", "webm", "gif", "avi"] 
    : isImage 
    ? ["webp", "png", "jpg", "bmp"] 
    : isAudio
    ? ["mp3", "wav", "ogg"]
    : [];

  const convertFile = async () => {
    if (!file || !targetFormat) return;
    
    setProcessing(true);
    setProgress(0);
    setLogs(["Initializing WASM Engine..."]);

    const loaded = await loadFFmpeg();
    if (!loaded) {
      setProcessing(false);
      return;
    }

    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on("progress", ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    try {
      const { name } = file;
      await ffmpeg.writeFile(name, await fetchFile(file));
      const outputName = `output.${targetFormat}`;
      
      const args = ['-i', name];
      
      if (videoSpeed !== "1.0") {
        const speed = parseFloat(videoSpeed);
        args.push('-filter:v', `setpts=1/${speed}*PTS`);
        args.push('-filter:a', `atempo=${speed}`);
      }
      
      args.push(outputName);
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const type = isImage ? "image" : isVideo ? (targetFormat === "gif" ? "image" : "video") : "audio";
      const blobType = targetFormat === "mp3" ? "audio/mpeg" : `${type}/${targetFormat}`;
      
      const url = URL.createObjectURL(new Blob([data as any], { type: blobType }));
      setResultUrl(url);
      setLogs(prev => [...prev, "Conversion finished successfully!"]);
    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, "Error: Conversion failed."]);
    } finally {
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

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <main className="container mx-auto max-w-[1400px] px-6 py-12">
        <div className="flex flex-col gap-10">
          <header className="flex items-center justify-between flex-wrap gap-8">
            <div className="flex items-center gap-6">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic">
                   Media <span className="text-primary italic">Converter</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">High-Performance WASM Conversion Engine</p>
              </div>
            </div>
            
            {file && (
               <Button onClick={() => { setFile(null); setResultUrl(null); setLogs([]); }} variant="ghost" size="sm" className="gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-2xl transition-all">
                  Wipe Stage
               </Button>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            <div className="space-y-8">
              {isDownloadingModel && (
                <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-top-4 rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Downloading WASM Engine...</h3>
                      <span className="text-xs font-black text-primary">{downloadProgress}%</span>
                    </div>
                    <Progress value={downloadProgress} className="h-2 w-full bg-primary/10" />
                  </CardContent>
                </Card>
              )}

              <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => !processing && inputRef.current?.click()}
                    className={`relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all ${!processing ? "cursor-pointer py-32 bg-background/50 hover:bg-primary/5 shadow-inner" : "py-32 opacity-50"}`}
                  >
                    <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                       <Upload className="h-10 w-10 text-primary" />
                    </div>
                    
                    {file ? (
                      <div className="px-6">
                        <p className="text-2xl font-black text-foreground mb-2 italic uppercase tracking-tighter truncate max-w-md">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">{(file.size / 1024 / 1024).toFixed(2)} MB • READY FOR PARTITIONING</p>
                      </div>
                    ) : (
                      <div className="px-6">
                        <p className="text-2xl font-black text-foreground uppercase tracking-tight italic">Drop Media Artifacts</p>
                        <p className="mt-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">MP4, MOV, PNG, JPG, WEBP, MP3 Supported</p>
                      </div>
                    )}
                    <input ref={inputRef} type="file" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} disabled={processing} />
                  </div>
              </Card>

              {processing && (
                 <Card className="glass-morphism border-primary/10 p-10 rounded-2xl">
                   <div className="space-y-6">
                     <div className="flex justify-between items-end">
                       <div className="flex items-center gap-2 text-primary">
                          <Terminal className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">FFMPEG_ENGINE: LIVE</span>
                       </div>
                       <span className="text-xl font-black tracking-tighter">{progress}%</span>
                     </div>
                     <Progress value={progress} className="h-4 w-full bg-primary/10" />
                     
                     <div className="bg-zinc-950 rounded-2xl p-6 font-mono text-[11px] text-primary/80 overflow-hidden shadow-inner border border-white/5 min-h-[120px] flex flex-col justify-end">
                        {logs.map((log, i) => (
                          <div key={i} className="leading-relaxed truncate border-l-2 border-primary/20 pl-4 mb-1">{`> ${log}`}</div>
                        ))}
                     </div>
                   </div>
                 </Card>
              )}

              {resultUrl && (
                <Card className="border-primary/20 bg-primary/5 animate-in slide-in-from-bottom-6 rounded-2xl">
                  <CardContent className="p-12 flex flex-col items-center">
                    <div className="h-20 w-20 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
                      <Download className="h-10 w-10" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter text-foreground mb-4 text-center uppercase italic">Conversion Set</h3>
                    <p className="text-sm font-medium text-muted-foreground text-center mb-10 opacity-60">Your {targetFormat.toUpperCase()} asset has been successfully re-rendered in the local sandbox.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                      <Button className="gap-3 h-16 px-12 text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 uppercase italic" onClick={download}>
                        <Download className="h-6 w-6" /> Download
                      </Button>
                      <Button variant="outline" className="h-16 px-12 rounded-2xl bg-background border-border/50 uppercase font-black text-xs tracking-widest" onClick={() => { setResultUrl(null); setFile(null); setLogs([]); }}>
                        Convert Another
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                 <div className="bg-primary/5 p-5 border-b border-primary/10">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Conversion Settings</h3>
                 </div>
                 <CardContent className="p-8 space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none px-1">Convert To</label>
                       <Select value={targetFormat} onValueChange={setTargetFormat} disabled={processing || !file}>
                         <SelectTrigger className="w-full h-14 bg-background border-primary/10 rounded-2xl font-black uppercase tracking-tighter text-lg">
                           <SelectValue placeholder="FORMAT" />
                         </SelectTrigger>
                         <SelectContent>
                           {availableFormats.map(fmt => (
                             <SelectItem key={fmt} value={fmt} className="font-black py-3">{fmt.toUpperCase()}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    </div>

                    {isVideo && (
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none px-1">Playback Speed</label>
                         <Select value={videoSpeed} onValueChange={setVideoSpeed} disabled={processing || !file}>
                           <SelectTrigger className="w-full h-14 bg-background border-primary/10 rounded-2xl font-black uppercase tracking-tighter text-lg">
                             <SelectValue placeholder="SPEED" />
                           </SelectTrigger>
                           <SelectContent>
                             {["0.5", "0.75", "1.0", "1.25", "1.5", "2.0"].map(s => (
                               <SelectItem key={s} value={s} className="font-black py-3">{s}x</SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button 
                        onClick={convertFile} 
                        disabled={!targetFormat || processing || !file} 
                        className="w-full gap-3 h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic"
                      >
                        <RefreshCw className={`h-6 w-6 ${processing ? "animate-spin" : ""}`} />
                        {processing ? "Baking Media..." : "Execute Conversion"}
                      </Button>
                      <p className="text-[9px] text-center mt-4 text-muted-foreground font-black uppercase tracking-widest opacity-40 italic">Total Client-Side Partitioning</p>
                    </div>
                 </CardContent>
              </Card>

              <div className="px-6">
                 <AdPlaceholder format="rectangle" className="opacity-40 grayscale group-hover:grayscale-0 transition-all" />
              </div>

              <div className="p-10 rounded-2xl border-2 border-dashed border-primary/10 text-center studio-gradient">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-primary">Hardware Acceleration</h4>
                 <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-80 font-medium">
                    This tool utilizes <strong className="font-bold">SharedArrayBuffer</strong> and <strong className="font-bold">Multi-Threaded WASM</strong> to reach conversion speeds comparable to native software.
                 </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UniversalMediaConverter;

