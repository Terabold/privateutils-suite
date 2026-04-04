import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, Layers, Zap, Activity, ShieldCheck, Settings2, ImageIcon, CloudUpload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import SponsorSidebars from "@/components/SponsorSidebars";
import { usePasteFile } from "@/hooks/usePasteFile";
import { toast } from "sonner";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const ImageCompressor = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [targetFormat, setTargetFormat] = useState<string>("webp");
  const [processing, setProcessing] = useState(false);

  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [highEfficiency, setHighEfficiency] = useState(false);
  const [isBaking, setIsBaking] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const inputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Format not supported. Deploy image artifact only.");
      return;
    }
    setFile(f);
    setOriginalSize(f.size);
    setCompressedUrl(null);
    setCompressedSize(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        setOriginalImage(img);

        const extension = f.name.split('.').pop()?.toLowerCase();
        if (extension === 'png') {
          setTargetFormat('png');
          setHighEfficiency(false);
        } else if (extension === 'jpg' || extension === 'jpeg') {
          setTargetFormat('jpg');
        } else {
          setTargetFormat('webp');
        }

        toast.success("Image staged for compression.");
      };
    };
    reader.readAsDataURL(f);
    if (inputRef.current) inputRef.current.value = "";
  };

  usePasteFile(handleFile);

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) return true;
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
    }
  };

  const compressedUrlRef = useRef<string | null>(null);

  const compressImage = useCallback(async () => {
    if (!originalImage || !file) return;
    setProcessing(true);

    const canvas = document.createElement("canvas");
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setProcessing(false);
      return;
    }
    ctx.drawImage(originalImage, 0, 0);

    const mimeMap: Record<string, string> = {
      'webp': 'image/webp',
      'jpg': 'image/jpeg',
      'png': 'image/png'
    };

    let actualFormat = targetFormat;
    const requestedMime = mimeMap[actualFormat] || 'image/webp';
    let finalBlob: Blob | null = null;

    if (actualFormat === 'png' && quality < 0.98) {
      setIsBaking(true);
      const loaded = await loadFFmpeg();
      if (loaded) {
        const ffmpeg = ffmpegRef.current;
        const inputData = await fetchFile(file);
        await ffmpeg.writeFile('input.png', inputData);
        // Map quality 0.0-1.0 to color count 2-256
        const colors = Math.max(2, Math.round(quality * 256));
        await ffmpeg.exec(['-i', 'input.png', '-vf', `format=rgba,palettegen=max_colors=${colors}`, 'palette.png']);
        await ffmpeg.exec(['-i', 'input.png', '-i', 'palette.png', '-filter_complex', 'paletteuse', 'output.png']);
        const data = await ffmpeg.readFile('output.png');
        finalBlob = new Blob([data as any], { type: 'image/png' });
      }
      setIsBaking(false);
    } else {
      const getBlob = (m: string, q: number): Promise<Blob | null> =>
        new Promise(resolve => canvas.toBlob(blob => resolve(blob), m, actualFormat === 'png' ? undefined : q));

      finalBlob = await getBlob(requestedMime, quality);
    }

    if (finalBlob) {
      if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);
      const url = URL.createObjectURL(finalBlob);
      compressedUrlRef.current = url;
      setCompressedUrl(url);
      setCompressedSize(finalBlob.size);
    }

    setProcessing(false);
  }, [originalImage, quality, targetFormat, file]);

  useEffect(() => {
    if (originalImage) {
      const timer = setTimeout(() => {
        compressImage();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [quality, targetFormat, originalImage, compressImage]);

  const savings = originalSize > 0 ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100)) : 0;

  return (
    <div className="h-screen bg-[#050505] text-foreground transition-all duration-300 theme-image overflow-hidden flex flex-col font-sans">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow overflow-visible">
        <div className="w-full h-full flex flex-col p-4 md:px-8 md:py-4 gap-4">
          <header className="flex items-center justify-between shrink-0 animate-in fade-in slide-in-from-top-4 duration-500 bg-zinc-900 border border-white/20 p-3 rounded-2xl backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center gap-5">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="flex items-baseline gap-4">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-none text-white">
                  Image <span className="text-primary italic">Compressor</span>
                </h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6 px-5 border-l border-white/10 ml-auto h-full py-1">
                <div className="flex flex-col items-end">
                    <span className="text-[6px] font-black text-primary uppercase tracking-widest leading-none mb-1.5">Engine Pipeline</span>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]" />
                        <span className="text-[8px] font-black text-white/80 uppercase tracking-widest leading-none italic">Active</span>
                    </div>
                </div>
            </div>
          </header>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 overflow-hidden items-stretch relative">
            {/* STAGE AREA - CENTER COLUMN */}
            <div className="relative flex flex-col overflow-hidden min-h-0">
              <Card className="flex-1 glass-morphism border-primary/40 rounded-[2.5rem] overflow-hidden shadow-2xl relative group bg-black/99 flex items-center justify-center p-1 border-b-[8px] border-primary/50 transition-all duration-700">
                {!file ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => !processing && inputRef.current?.click()}
                    className="absolute inset-4 flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-primary/40 text-center cursor-pointer bg-black/60 hover:border-primary hover:bg-primary/5 shadow-2xl transition-all duration-300 group/upload"
                  >
                    <div className="h-20 w-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-700 group-hover/upload:scale-110 shadow-inner ring-2 ring-primary/40">
                        <CloudUpload className="h-10 w-10 text-primary" />
                    </div>
                    <div className="px-6 space-y-2">
                       <p className="text-3xl font-black text-white uppercase tracking-tighter italic text-shadow-glow leading-none">Deploy Image Artifact</p>
                       <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] italic leading-none">Native Hardware Quantization</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative flex items-center justify-center p-2 animate-in fade-in zoom-in-95 duration-1000">
                    {compressedUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center group/result px-4 py-4">
                        <div 
                          className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair active:cursor-grabbing select-none"
                          onMouseDown={(e) => {
                            if (e.button === 0 || e.button === 2) {
                              setIsPanning(true);
                              setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
                              e.preventDefault();
                            }
                          }}
                          onMouseMove={(e) => {
                            if (isPanning) {
                              setOffset({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
                            }
                          }}
                          onMouseUp={() => setIsPanning(false)}
                          onMouseLeave={() => setIsPanning(false)}
                          onWheel={(e) => {
                            const delta = e.deltaY > 0 ? -0.1 : 0.1;
                            setZoom(prev => Math.min(10, Math.max(1, prev + delta)));
                          }}
                        >
                          <img 
                            src={compressedUrl} 
                            alt="Compressed Artifact" 
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_50px_120px_rgba(0,0,0,1)] transition-transform duration-75 border border-white/5" 
                            style={{
                              imageRendering: zoom > 1 ? 'pixelated' : 'auto',
                              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-8 text-center animate-in zoom-in-95 duration-500">
                        <div className="h-20 w-20 bg-primary/20 rounded-3xl flex items-center justify-center relative border border-primary/40 shadow-2xl overflow-hidden">
                           <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-2xl font-black text-white uppercase tracking-tighter italic text-shadow-glow font-display leading-none">Crunching Bits</p>
                           <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic animate-pulse">WASM Processor</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all z-10 pointer-events-auto">
                      <Button 
                        onClick={() => { 
                          setFile(null); 
                          setOriginalImage(null); 
                          setCompressedUrl(null); 
                          setCompressedSize(0); 
                        }} 
                        variant="destructive" 
                        size="sm" 
                        className="h-11 px-10 text-[11px] font-black uppercase tracking-widest rounded-2xl bg-red-600 text-white shadow-2xl hover:scale-105 hover:bg-red-500 transition-all border-b-4 border-red-900"
                      >
                        Reset Stage
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* SIDEBAR TOOLS - RIGHT COLUMN */}
            <aside className="flex flex-col gap-4 min-h-0 overflow-hidden animate-in slide-in-from-right-8 duration-700">
              <Card className="glass-morphism border-primary/30 rounded-[2rem] overflow-hidden shadow-2xl bg-black/90 flex-1 flex flex-col border-b-4 border-l-4 border-white/5">
                <div className="bg-primary/20 p-5 border-b border-primary/30 flex items-center justify-between shrink-0 h-14">
                   <div className="flex items-center gap-4">
                      <Settings2 className="h-5 w-5 text-primary" />
                      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-white italic leading-none">Studio Controls</h3>
                   </div>
                   <Activity className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <CardContent className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar pt-6">
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="space-y-5">
                      <div className="flex justify-between items-end px-1">
                        <div className="space-y-1">
                           <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Bit Quality</label>
                           <p className="text-[9px] font-black text-white uppercase tracking-widest leading-none italic">
                             {quality >= 0.8 ? "Studio Master" : quality >= 0.5 ? "Balanced" : "Compressed"}
                           </p>
                        </div>
                        <span className="text-4xl font-black tracking-tighter text-primary italic leading-none font-mono text-shadow-glow">{Math.round(quality * 100)}%</span>
                      </div>
                      
                      <div className="relative">
                        <Slider 
                          value={[quality * 100]} 
                          max={100} 
                          min={1}
                          step={1} 
                          onValueChange={(val) => setQuality(val[0] / 100)}
                          className="py-4 cursor-pointer relative z-10"
                        />
                        <div className="flex justify-between mt-1 px-1 text-[8px] font-black uppercase tracking-[0.3em] text-white/40 italic">
                          <span>Max Savings</span>
                          <span>Max Detail</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2.5 pt-1">
                         {[
                           { label: "Eco", val: 0.3, icon: Zap },
                           { label: "Std", val: 0.7, icon: Activity },
                           { label: "Max", val: 0.95, icon: ShieldCheck }
                         ].map((tier) => (
                           <Button 
                             key={tier.label}
                             variant="outline" 
                             onClick={() => setQuality(tier.val)}
                             className={`h-12 flex flex-col gap-1 rounded-xl border-white/10 bg-zinc-950 hover:bg-primary/20 transition-all ${Math.abs(quality - tier.val) < 0.05 ? "bg-primary border-primary shadow-2xl scale-[1.05] text-white" : "text-white/60"}`}
                           >
                              <tier.icon className="h-4 w-4 text-primary" />
                              <span className="text-[9px] font-black uppercase tracking-widest leading-none">{tier.label}</span>
                           </Button>
                         ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic leading-none px-1">Target Spec</label>
                        <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v)}>
                          <SelectTrigger className="h-12 bg-zinc-950 border-white/10 rounded-xl font-black uppercase tracking-tighter text-sm shadow-inner px-6 hover:bg-zinc-900 transition-colors text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-morphism border-white/20 bg-black backdrop-blur-3xl font-sans">
                            <SelectItem value="webp" className="font-black py-4 text-xs uppercase tracking-widest cursor-pointer text-white hover:bg-primary/20">WEBP CORE</SelectItem>
                            <SelectItem value="jpg" className="font-black py-4 text-xs uppercase tracking-widest cursor-pointer text-white hover:bg-primary/20">JPG LEGACY</SelectItem>
                            <SelectItem value="png" className="font-black py-4 text-xs uppercase tracking-widest cursor-pointer text-white hover:bg-primary/20">PNG QUANT</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3 pb-1">
                        <div className={`h-12 flex items-center justify-center bg-zinc-950 border border-white/10 rounded-xl shadow-inner px-6 overflow-hidden transition-all duration-700 ${targetFormat === 'png' ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.1)]' : ''}`}>
                          <div className="flex items-center gap-3">
                              <Zap className="h-4 w-4 text-primary" />
                              <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] whitespace-nowrap italic leading-none">
                                {targetFormat === 'png' ? 'QUANT CORE' : 'HARDWARE OPS'}
                              </span>
                          </div>
                        </div>
                    </div>
                  </div>

                  {compressedUrl && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4 pt-1">
                      {/* INTEGRATED METRICS - RECOVERED PER USER REQUEST */}
                      <div className="grid grid-cols-3 gap-2.5 px-px">
                        <div className="flex flex-col items-center justify-center bg-zinc-950/60 border border-white/5 rounded-xl py-4 shadow-2xl ring-1 ring-white/5">
                           <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-2 leading-none">Source</p>
                           <p className="text-[16px] font-black text-white italic tracking-tighter font-mono leading-none">{(originalSize / 1024 / 1024).toFixed(2)}MB</p>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-zinc-950/60 border border-white/5 rounded-xl py-4 shadow-2xl ring-1 ring-white/5">
                           <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2 leading-none">Target</p>
                           <p className="text-[16px] font-black text-emerald-400 italic tracking-tighter font-mono leading-none">{(compressedSize / 1024 / 1024).toFixed(2)}MB</p>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-primary/10 border border-primary/20 rounded-xl py-4 shadow-2xl ring-1 ring-primary/20">
                           <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-2 leading-none">Savings</p>
                           <p className="text-[16px] font-black text-primary italic tracking-tighter font-mono leading-none">-{savings}%</p>
                        </div>
                      </div>

                      <Button 
                        className="w-full gap-4 h-16 text-xl font-black rounded-2xl shadow-[0_15px_40px_rgba(var(--primary),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic border-b-4 border-primary-foreground/20 group/download bg-primary text-white relative overflow-hidden"
                        onClick={() => {
                          if (!compressedUrlRef.current) return;
                          const a = document.createElement("a");
                          a.href = compressedUrlRef.current;
                          a.download = `${file?.name.replace(/\.[^.]+$/, "")}_optimized.${targetFormat}`;
                          a.click();
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/download:translate-y-0 transition-transform duration-400" />
                        <Download className="h-7 w-7 group-hover/download:translate-y-1 transition-transform relative z-10" /> 
                        <span className="relative z-10 font-display tracking-tight">Dispatch Artifact</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      
      <div className="h-10 bg-black border-t border-white/10 shrink-0 flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
              <p className="text-[9px] font-black text-white uppercase tracking-[0.4em] italic leading-none opacity-40">Secure Local Forge • Precision Pipeline</p>
          </div>
          <div className="flex items-center gap-6">
              <span className="text-[8px] font-black text-primary uppercase tracking-widest italic leading-none">WASM Engine Ready</span>
              <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          </div>
      </div>

      <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
};

export default ImageCompressor;
