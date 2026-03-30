import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Copy, Check, Pipette, Search, ZoomIn, ZoomOut, Maximize2, MousePointer2, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const ImageColorExtractor = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [color, setColor] = useState<{ hex: string; rgb: string } | null>(null);
  const [history, setHistory] = useState<{ hex: string; rgb: string }[]>(() => {
    const saved = localStorage.getItem("color-extractor-history");
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    localStorage.setItem("color-extractor-history", JSON.stringify(history));
  }, [history]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (imgSrc) URL.revokeObjectURL(imgSrc);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setColor(null);
    
    // Extract static frame from potentially animated formats (GIF/WEBP)
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
       const canvas = document.createElement("canvas");
       canvas.width = img.naturalWidth;
       canvas.height = img.naturalHeight;
       const ctx = canvas.getContext("2d")!;
       ctx.drawImage(img, 0, 0);
       // Convert to static PNG
       setImgSrc(canvas.toDataURL("image/png"));
       URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  usePasteFile(handleFile);

  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
  };

  // NATIVE wheel listener for non-passive prevention of site scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      if (!imgSrc) return;
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? -0.5 : 0.5;
      setZoom(prev => Math.min(50, Math.max(1, prev + delta)));
    };

    el.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", handleWheelNative);
  }, [imgSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imgSrc) return;
    // Right Click (button 2) for Panning
    if (e.button === 2) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
      return;
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    // Left click for sampling, ignore if panning
    if (isPanning) return;
    
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d")!;
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
    
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    const newColor = { hex: hex.toUpperCase(), rgb: `rgb(${r}, ${g}, ${b})` };
    setColor(newColor);
    setHistory(prev => {
      if (prev.find(c => c.hex === newColor.hex)) return prev;
      return [newColor, ...prev].slice(0, 12);
    });
    setCopied(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Replaced by native listener for better scroll blocking
  };

  const copyHex = async () => {
    if (!color) return;
    await navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-image transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <div className="p-8 rounded-2xl border-2 border-dashed border-primary/5 bg-primary/5 text-center mt-12 studio-gradient">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Verified Ad Space</p>
           </div>
        </aside>

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow">
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
                    Color <span className="text-primary italic">Extractor</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Neural Color Palette Analysis</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
                ref={containerRef}
                className="glass-morphism border-primary/5 h-[800px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner select-none overflow-hidden p-10"
              >
                {!imgSrc ? (
                   <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => inputRef.current?.click()}
                    className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-32 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                  >
                    <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                       <CloudUpload className="h-10 w-10 text-primary" />
                    </div>
                    <div className="px-6 space-y-1">
                      <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Drag & Drop</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">or click to browse</p>
                      <KbdShortcut />
                      <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20">Sample Palette from High-Res Masters</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center cursor-crosshair active:cursor-grabbing">

                    <div className="absolute top-4 right-4 z-20 flex gap-1.5 p-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                        <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10 rounded-xl" onClick={() => setZoom(z => Math.max(1, z - 1))}>
                           <ZoomOut className="h-5 w-5" />
                        </Button>
                        <div className="w-[1px] h-6 bg-white/10 self-center" />
                        <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10 rounded-xl" onClick={() => setZoom(z => Math.min(50, z + 1))}>
                           <ZoomIn className="h-5 w-5 font-black" />
                        </Button>
                        <div className="w-[1px] h-6 bg-white/10 self-center" />
                        <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10 rounded-xl" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>
                           <Maximize2 className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <img 
                        ref={imgRef}
                        src={imgSrc} 
                        alt="Local Source" 
                        crossOrigin="anonymous"
                        onLoad={handleImageLoad}
                        onClick={handleClick}
                        className="transition-transform duration-75 ease-out origin-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border-4 border-white/10 rounded-xl"
                        style={{ 
                          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                          imageRendering: zoom > 2 ? "pixelated" : "auto",
                          maxWidth: 'calc(100% - 60px)',
                          maxHeight: 'calc(100% - 60px)'
                        }}
                      />
                    </div>
                  </div>
                )}
                <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                <canvas ref={canvasRef} className="hidden" />
              </Card>
              
              <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic px-4">Sub-pixel sampling • Scroll to zoom 1000% • Right-click drag to pan</p>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                 <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Extraction Logic</h3>
                   {imgSrc && (
                     <Button 
                       onClick={() => { setImgSrc(null); setColor(null); }} 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all"
                     >
                       Reset Stage
                     </Button>
                   )}
                 </div>
                <CardContent className="p-8 space-y-12">
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Extracted Palette</h3>
                         {history.length > 0 && (
                           <Button 
                             onClick={() => setHistory([])} 
                             variant="ghost" 
                             className="h-6 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10"
                           >
                             Clear
                           </Button>
                         )}
                      </div>
                      
                      <div className="grid grid-cols-6 gap-2">
                         {history.map((c, i) => (
                           <button 
                             key={i} 
                             onClick={() => { setColor(c); navigator.clipboard.writeText(c.hex); toast.success("Copied!"); }}
                             className="group relative aspect-square rounded-lg border border-white/10 shadow-lg overflow-hidden transition-transform hover:scale-110 active:scale-95"
                             style={{ backgroundColor: c.hex }}
                             title={c.hex}
                           >
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                <Copy className="h-3 w-3 text-white" />
                             </div>
                           </button>
                         ))}
                         {Array.from({ length: Math.max(0, 6 - history.length) }).map((_, i) => (
                           <div key={`empty-${i}`} className="aspect-square rounded-lg border border-dashed border-primary/10 bg-primary/5" />
                         ))}
                      </div>

                      {color ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pt-6 border-t border-primary/5">
                           <div 
                             className="h-32 w-full rounded-2xl shadow-2xl border-4 border-white/5 transition-all"
                             style={{ backgroundColor: color.hex, boxShadow: `0 20px 40px ${color.hex}44` }}
                           />
                           <div className="grid grid-cols-1 gap-3">
                              <button 
                                onClick={() => { navigator.clipboard.writeText(color.hex); toast.success("Hex Copied"); }}
                                className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border/50 hover:bg-primary/5 group transition-all"
                              >
                                 <div className="text-left">
                                   <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">HEX</p>
                                   <p className="text-lg font-black font-mono tracking-tighter">{color.hex}</p>
                                 </div>
                                 <Copy className="h-4 w-4 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                              </button>
                              <button 
                                onClick={() => { navigator.clipboard.writeText(color.rgb); toast.success("RGB Copied"); }}
                                className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border/50 hover:bg-primary/5 group transition-all"
                              >
                                 <div className="text-left">
                                   <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">RGB Profile</p>
                                   <p className="text-xs font-black font-mono">{color.rgb}</p>
                                 </div>
                                 <Copy className="h-4 w-4 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                              </button>
                           </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/5 rounded-2xl border border-dashed border-primary/10">
                           <Pipette className="h-8 w-8 text-primary mb-4 opacity-20" />
                           <p className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-tight">Sample Canvas Stage</p>
                        </div>
                      )}
                   </div>

                    <div className="space-y-5 pt-8 border-t border-primary/5">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Stage Zoom</label>
                           <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{zoom.toFixed(1)}x</span>
                        </div>
                        <Slider 
                        defaultValue={[1]}
                        value={[zoom]} 
                        min={1} 
                        max={50} 
                        step={0.5} 
                        onValueChange={([v]) => setZoom(v)} 
                        disabled={!imgSrc} 
                      />
                    </div>
                </CardContent>
              </Card>

              <div className="px-6">
                 <AdPlaceholder format="rectangle" className="opacity-40 grayscale group-hover:grayscale-0 transition-all" />
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

export default ImageColorExtractor;

