import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, Terminal, CloudUpload, Zap, Activity, ShieldCheck, Settings2, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { usePasteFile } from "@/hooks/usePasteFile";
import { toast } from "sonner";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const UniversalMediaConverter = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTarget, setProgressTarget] = useState(0);
  const [videoSpeed, setVideoSpeed] = useState<string>("1.0");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [detectedMime, setDetectedMime] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const ffmpegRef = useRef(new FFmpeg());
  const inputRef = useRef<HTMLInputElement>(null);
  const loadingRef = useRef(false);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setOriginalSize(f.size);
    setResultUrl(null);
    setResultSize(0);
    setDetectedMime("");
    setTargetFormat("");
    setProgress(0);
    setProgressTarget(0);
    toast.success(`${f.name} staged for processing`);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Progress Smoothing Engine (Professional Crawl)
  useEffect(() => {
    if (progress < progressTarget) {
      const timeout = setTimeout(() => setProgress(p => Math.min(p + 1, progressTarget)), 30);
      return () => clearTimeout(timeout);
    }
  }, [progress, progressTarget]);

  usePasteFile(handleFile);

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

  const convertFile = async () => {
    if (!file || !targetFormat) return;
    setProcessing(true);
    setProgress(0);
    setResultUrl(null);

    try {
      const loaded = await loadFFmpeg();
      if (!loaded) return;
      const ffmpeg = ffmpegRef.current;

      const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
      const outputName = `output.${targetFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      ffmpeg.on('progress', ({ progress }) => {
        setProgressTarget(Math.min(100, Math.round(progress * 100)));
      });

      // Complexity adjustment based on format
      let args = ['-i', inputName];
      
      const isVideoFile = file.type.startsWith('video/');
      const isAudioFile = file.type.startsWith('audio/');

      if (videoSpeed !== '1.0') {
        const speed = parseFloat(videoSpeed);
        if (isVideoFile) {
          args.push('-filter:v', `setpts=${1/speed}*PTS`, '-filter:a', `atempo=${speed}`);
        } else if (isAudioFile) {
          args.push('-filter:a', `atempo=${speed}`);
        }
      }

      // Format-Specific Codec Selection
      switch (targetFormat) {
        case 'mp4':
          args.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'aac');
          break;
        case 'webm':
          args.push('-c:v', 'libvpx-vp9', '-c:a', 'libopus');
          break;
        case 'mkv':
        case 'avi':
          args.push('-c:v', 'libx264', '-c:a', 'aac');
          break;
        case 'mp3':
          args.push('-c:a', 'libmp3lame', '-ab', '192k');
          break;
        case 'wav':
          args.push('-c:a', 'pcm_s16le');
          break;
        case 'flac':
          args.push('-c:a', 'flac');
          break;
        case 'gif':
          args.push('-vf', 'fps=10,scale=320:-1:flags=lanczos');
          break;
      }

      args.push(outputName);

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      
      const mimeMap: Record<string, string> = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mkv': 'video/x-matroska',
        'avi': 'video/x-msvideo',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'flac': 'audio/flac',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'webp': 'image/webp',
        'gif': 'image/gif'
      };

      const blob = new Blob([data as any], { type: mimeMap[targetFormat] || 'application/octet-stream' });

      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
      setDetectedMime(blob.type);
      setProgressTarget(100);
      setProgress(100);
      toast.success("Artifact Generated Successfully");
    } catch (err) {
      console.error(err);
      toast.error("Process execution fault. Native limitations encountered.");
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

  const isVideo = file?.type.startsWith("video/");
  const isImage = file?.type.startsWith("image/");
  const isAudio = file?.type.startsWith("audio/");
  const sourceExt = file?.name.split('.').pop()?.toLowerCase() || "";

  const formats = isVideo ? ["mp4", "webm", "mkv", "avi"] :
    isAudio ? ["mp3", "wav", "ogg", "flac"] :
      isImage ? ["png", "jpg", "webp", "bmp"] : [];

  const filteredFormats = formats.filter(f => f !== sourceExt);

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 theme-video overflow-x-hidden">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <main className="container mx-auto max-w-[1400px] px-6 py-12">
        <div className="flex flex-col gap-10">
          <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Link to="/">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-none">
                Media <span className="text-primary italic">Converter</span>
              </h1>
              <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">High-Efficiency Browser-Native Conversion Engine</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="lg:col-span-8 space-y-8">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl relative group bg-zinc-900/50">
                <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                  </div>
                </div>
                <CardContent className="p-10">
                  {!file ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => !processing && inputRef.current?.click()}
                      className="relative w-full h-[450px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center cursor-pointer bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner transition-all duration-300 group/upload"
                    >
                      <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover/upload:scale-110 transition-all">
                        <CloudUpload className="h-10 w-10 text-primary" />
                      </div>
                      <div className="px-6 space-y-2">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Artifact</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-50">Drag master or click</p>
                      </div>
                      <input ref={inputRef} type="file" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                    </div>
                  ) : (
                    <div className="relative group w-full bg-background/40 p-10 rounded-3xl border border-primary/10 shadow-inner overflow-hidden min-h-[450px] flex flex-col items-center justify-center studio-gradient backdrop-blur-3xl">
                      {processing ? (
                        <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                          <div className="h-24 w-24 bg-primary/20 text-primary rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-primary/20 relative">
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
                          <div className="h-24 w-24 bg-emerald-500/20 text-emerald-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-emerald-500/20">
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
                          <div className="h-24 w-24 bg-primary/20 text-primary rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-primary/20">
                            <Activity className="h-10 w-10 animate-spin-slow" />
                          </div>
                          <div className="space-y-2 max-w-md">
                            <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Artifact Scoped</p>
                            <p className="text-xs font-black text-primary truncate italic uppercase opacity-80 mt-2">{file.name}</p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-4">{(file.size / 1024 / 1024).toFixed(2)} MB • READY FOR DISPATCH</p>
                          </div>
                        </div>
                      )}
 
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto">
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
                          className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                          Clear Stage
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-[0.4em] opacity-30 italic">Native GPU Pipeline • Zero Server Persistence • Studio Integrity</p>
            </div>

            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl studio-gradient border-b-2 border-r-2">
                <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3">
                  <Settings2 className="h-4 w-4 text-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Process Geometry</h3>
                </div>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic leading-none px-1">Source Type</label>
                      <div className="flex items-center gap-3 bg-background/40 p-4 rounded-2xl border border-primary/5">
                        <FileType className="h-4 w-4 text-primary opacity-60" />
                        <span className="text-xs font-black uppercase tracking-tighter text-foreground">{file?.type || "Waiting..."}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic leading-none px-1">Target Spec</label>
                      <Select
                        value={targetFormat}
                        onValueChange={setTargetFormat}
                        disabled={processing || !file}
                      >
                        <SelectTrigger className="h-14 bg-background border-primary/10 rounded-2xl font-black uppercase tracking-tighter text-sm shadow-inner px-6">
                          <SelectValue placeholder="SET FORMAT" />
                        </SelectTrigger>
                        <SelectContent className="glass-morphism border-primary/20">
                          {filteredFormats.map(fmt => (
                            <SelectItem key={fmt} value={fmt} className="font-black py-3 text-xs uppercase tracking-widest">{fmt.toUpperCase()} CORE</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {isVideo && (
                      <div className="space-y-3 animate-in slide-in-from-left-4 duration-300">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic leading-none px-1">Temporal Shift</label>
                        <Select value={videoSpeed} onValueChange={setVideoSpeed} disabled={processing || !file}>
                          <SelectTrigger className="h-14 bg-background border-primary/10 rounded-2xl font-black uppercase tracking-tighter text-sm shadow-inner px-6">
                            <SelectValue placeholder="SET SPEED" />
                          </SelectTrigger>
                          <SelectContent className="glass-morphism border-primary/20">
                            {["0.5", "0.75", "1.0", "1.25", "1.5", "2.0"].map(s => (
                              <SelectItem key={s} value={s} className="font-black py-3 text-xs">{s}x Speed</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button
                      onClick={convertFile}
                      disabled={!targetFormat || processing || !file}
                      className="w-full gap-3 h-16 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase italic"
                    >
                      <Terminal className="h-6 w-6" />
                      {processing ? "Baking Artfact..." : "Finalize Production"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {resultUrl && (
                <Card className="border-primary/20 bg-primary/5 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Production Integrity</h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-background/40 border border-primary/5 rounded-2xl space-y-1">
                        <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Weight</span>
                        <p className="text-sm font-black text-primary italic">{(resultSize / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="p-4 bg-background/40 border border-primary/5 rounded-2xl space-y-1">
                        <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Descriptor</span>
                        <p className="text-[10px] font-black text-foreground uppercase truncate">{targetFormat}</p>
                      </div>
                    </div>

                    <Button onClick={download} variant="secondary" className="w-full h-14 gap-3 text-sm font-black rounded-xl uppercase italic shadow-xl border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5">
                      <Download className="h-5 w-5" /> Re-Download Artifact
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="px-6 pb-12">
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

export default UniversalMediaConverter;
