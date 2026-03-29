import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Copy, Check, Pipette, Search, ZoomIn, ZoomOut, Maximize2, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";

const ImageColorExtractor = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [color, setColor] = useState<{ hex: string; rgb: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
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
    const url = URL.createObjectURL(f);
    setImgSrc(url);
  };

  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
  };

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
    setColor({ hex, rgb: `rgb(${r}, ${g}, ${b})` });
    setCopied(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!imgSrc) return;
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom(prev => Math.min(10, Math.max(1, prev + delta)));
  };

  const copyHex = async () => {
    if (!color) return;
    await navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic">
                  Pixel <span className="text-primary italic">Extractor</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">High-Precision Local Color Palette Suite</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               {imgSrc && (
                 <Button onClick={() => { setImgSrc(null); setColor(null); }} variant="ghost" size="sm" className="gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all">
                    Wipe Stage
                 </Button>
               )}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            <div className="space-y-8">
              <Card 
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
                className="glass-morphism border-primary/5 min-h-[700px] flex items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner select-none overflow-hidden cursor-crosshair active:cursor-grabbing"
              >
                <div className="absolute top-6 left-6 z-10 flex gap-2 pointer-events-none">
                   <span className="text-[10px] font-black bg-primary text-primary-foreground px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-xl">Precision Stage</span>
                   {imgSrc && (
                     <span className="text-[10px] font-black bg-background/80 backdrop-blur-md text-foreground px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-sm border border-border/50">
                       Scale: {(zoom * 100).toFixed(0)}%
                     </span>
                   )}
                </div>

                <div className="absolute top-6 right-6 z-10 flex gap-2">
                   <Button size="icon" variant="secondary" className="rounded-lg bg-background/80 hover:bg-background border h-10 w-10" onClick={() => setZoom(z => Math.max(1, z - 0.5))}>
                      <ZoomOut className="h-4 w-4" />
                   </Button>
                   <Button size="icon" variant="secondary" className="rounded-lg bg-background/80 hover:bg-background border h-10 w-10" onClick={() => setZoom(z => Math.min(10, z + 0.5))}>
                      <ZoomIn className="h-4 w-4" />
                   </Button>
                </div>
                
                {imgSrc ? (
                  <div 
                    ref={containerRef}
                    className="w-full h-full flex items-center justify-center p-0"
                  >
                    <img 
                      ref={imgRef}
                      src={imgSrc} 
                      alt="Local Source" 
                      crossOrigin="anonymous"
                      onLoad={handleImageLoad}
                      onClick={handleClick}
                      className="transition-transform duration-75 ease-out origin-center shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
                      style={{ 
                        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                        imageRendering: zoom > 2 ? "pixelated" : "auto",
                        maxWidth: '90%',
                        maxHeight: '600px'
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    onClick={() => inputRef.current?.click()}
                    className="cursor-pointer group flex flex-col items-center justify-center p-20 w-[90%] border-2 border-dashed border-primary/20 rounded-[1.5rem] bg-background/50 hover:bg-primary/5 transition-all shadow-inner"
                  >
                    <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                       <Pipette className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-xl font-black uppercase tracking-tighter">Drop image to sample</p>
                    <p className="text-[10px] mt-2 font-black uppercase tracking-widest opacity-40">Direct hardware-accelerated sampling</p>
                  </div>
                )}
                <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                <canvas ref={canvasRef} className="hidden" />
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/40 p-10 rounded-xl border border-border/50 studio-gradient">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-primary">
                      <Maximize2 className="h-4 w-4" /> Sub-Pixel Engine
                   </h4>
                   <p className="text-[11px] text-muted-foreground leading-relaxed italic font-medium opacity-80">
                     Sampling is performed on a hardware-accelerated buffer. Use **Wheel** to zoom up to 1000% for hyper-accurate picking.
                   </p>
                </div>
                <div className="bg-primary/5 p-10 rounded-xl border border-primary/10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-primary font-black">Stage Navigation</h4>
                   <p className="text-[11px] text-muted-foreground leading-relaxed italic font-medium opacity-80 flex items-center gap-2">
                     <MousePointer2 className="h-3 w-3" /> **Right-Click Drag** to pan the workspace freely while zoomed in.
                   </p>
                </div>
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-primary/5 p-5 border-b border-primary/10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Sample Analysis</h3>
                </div>
                <CardContent className="p-8 space-y-12">
                   {color ? (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div 
                          className="h-40 w-full rounded-xl shadow-2xl border-4 border-white/5 transition-all"
                          style={{ backgroundColor: color.hex, boxShadow: `0 30px 60px ${color.hex}66` }}
                        />
                        <div className="space-y-4">
                           <div className="p-5 bg-background/50 rounded-xl border border-border/50">
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">HEX Spectrum</p>
                              <p className="text-2xl font-black font-mono tracking-tighter">{color.hex.toUpperCase()}</p>
                           </div>
                           <div className="p-5 bg-background/50 rounded-xl border border-border/50">
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">RGB Profile</p>
                              <p className="text-base font-black font-mono">{color.rgb}</p>
                           </div>
                        </div>

                        <Button 
                          onClick={copyHex} 
                          className="w-full gap-3 h-16 text-lg font-black rounded-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic"
                        >
                          {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                          {copied ? "Copied" : "Extract Palette"}
                        </Button>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/5 rounded-xl border border-dashed border-primary/10">
                        <Pipette className="h-10 w-10 text-primary mb-6 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Awaiting Click</p>
                        <p className="text-[9px] mt-2 max-w-[150px] leading-relaxed opacity-30 uppercase font-black tracking-tighter">Sample any pixel from the canvas stage</p>
                     </div>
                   )}

                    <div className="space-y-5 pt-8 border-t border-primary/5">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Stage Zoom</label>
                           <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{zoom.toFixed(1)}x</span>
                        </div>
                        <Slider value={[zoom]} min={1} max={10} step={0.1} onValueChange={([v]) => setZoom(v)} disabled={!imgSrc} />
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
      <Footer />
    </div>
  );
};

export default ImageColorExtractor;
