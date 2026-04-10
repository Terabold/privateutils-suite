import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Pipette, ZoomIn, ZoomOut, Maximize2, CloudUpload, Trash2, Activity, ShieldAlert, Info, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
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
  const [fitZoom, setFitZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [renderError, setRenderError] = useState<"FILE_TOO_LARGE" | "MEMORY_LIMIT" | null>(null);

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

    // Color extractor is for static palettes, reject GIFs to manage user expectations
    if (f.type === "image/gif") {
      toast.error("GIF artifacts are not natively supported by the precision extractor.");
      return;
    }

    // Safety Gate: 25MB Limit to prevent browser OOM
    if (f.size > 25 * 1024 * 1024) {
      setImgSrc(null);
      setRenderError("FILE_TOO_LARGE");
      toast.error(`Artifact density error: ${Math.round(f.size / 1024 / 1024)}MB exceeds 25MB security threshold.`);
      return;
    }

    if (imgSrc && imgSrc.startsWith("blob:")) URL.revokeObjectURL(imgSrc);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setColor(null);

    // Extract static frame
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      // Safety Gate: Hardware Limit check (8000px)
      if (img.width > 8000 || img.height > 8000) {
        setImgSrc(null);
        setRenderError("MEMORY_LIMIT");
        toast.error(`Dimension threshold exceeded: ${img.width}x${img.height} exceeds 8000px hardware limit.`);
        URL.revokeObjectURL(url);
        return;
      }

      setRenderError(null);

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

  const autoFit = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (container && img && img.naturalWidth) {
      const pad = 20;
      const availableW = container.clientWidth - pad;
      const availableH = container.clientHeight - pad;
      if (availableW <= 0 || availableH <= 0) return;
      const calculatedFitZoom = Math.min(availableW / img.naturalWidth, availableH / img.naturalHeight);
      setZoom(calculatedFitZoom);
      setFitZoom(calculatedFitZoom);
      setOffset({ x: 0, y: 0 });
    }
  }, []);

  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    setTimeout(autoFit, 100);
  };

  useEffect(() => {
    if (imgSrc) {
      window.addEventListener('resize', autoFit);
      return () => window.removeEventListener('resize', autoFit);
    }
  }, [imgSrc, autoFit]);

  // NATIVE wheel listener for non-passive prevention of site scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !imgSrc) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      
      setZoom(prevZoom => {
        const newZoom = Math.min(100, Math.max(0.01, prevZoom * factor));
        const rect = el.getBoundingClientRect();
        
        // Mouse position relative to center of container
        const mouseRelCenterX = e.clientX - rect.left - rect.width / 2;
        const mouseRelCenterY = e.clientY - rect.top - rect.height / 2;

        setOffset(prevOffset => ({
          x: mouseRelCenterX - (mouseRelCenterX - prevOffset.x) * (newZoom / prevZoom),
          y: mouseRelCenterY - (mouseRelCenterY - prevOffset.y) * (newZoom / prevZoom)
        }));

        return newZoom;
      });
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
      const exists = prev.find(c => c.hex === newColor.hex);
      if (exists) return prev;
      const next = [newColor, ...prev].slice(0, 12); // Cap at 12 for 2 rows in the grid
      return next;
    });
    setCopied(false);
  };

  const copyHex = async () => {
    if (!color) return;
    await navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-12 grow overflow-visible">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  Image Color <span className="text-primary italic">Palette Extractor</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Neural Color Palette Analysis • Precision Sampling Engine
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className={`grid grid-cols-1 ${imgSrc ? 'lg:grid-cols-[minmax(0,1fr)_340px]' : 'lg:grid-cols-1'} gap-12 items-start overflow-visible`}>
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onContextMenu={(e) => e.preventDefault()}
                  ref={containerRef}
                  className="glass-morphism border-primary/10 h-[520px] flex flex-col relative bg-card rounded-2xl shadow-xl overflow-hidden"
                >
                  {!imgSrc && (
                    <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3 relative z-30">
                      <Activity className="h-4 w-4 text-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                    </div>
                  )}
                  <div className={`flex-1 flex flex-col items-center justify-center ${imgSrc ? "p-0" : "p-10"} select-none relative bg-background/50 rounded-b-2xl overflow-hidden`}>
                    <AnimatePresence mode="wait">
                      {!imgSrc ? (
                        <motion.div
                          key="dropzone"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                          onClick={() => inputRef.current?.click()}
                          className={`relative w-full h-full flex flex-col items-center justify-center rounded-2xl transition-all duration-500 overflow-hidden group/dropzone
                            ${renderError ? 'bg-primary/5' : 'bg-primary/5 hover:border-primary/40 hover:bg-primary/10 hover:scale-[1.01] shadow-inner cursor-pointer border-2 border-dashed border-primary/20'}
                          `}
                        >
                           {/* Premium Hover Glow Ring */}
                           {!renderError && (
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.12),transparent_70%)] opacity-0 group-hover/dropzone:opacity-100 transition-opacity duration-700 pointer-events-none" />
                           )}

                           {!renderError ? (
                             <>
                              <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 shadow-inner group-hover/dropzone:scale-110 group-hover/dropzone:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] group-hover/dropzone:ring-2 ring-primary/40 relative z-10 transition-all duration-700">
                                <CloudUpload className="h-10 w-10 text-primary group-hover/dropzone:animate-bounce" />
                              </div>
                              <div className="px-6 space-y-2 relative z-10">
                                <p className="text-4xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow group-hover/dropzone:scale-105 transition-transform">Deploy Hub Artifact</p>
                                <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag master or click to browse</p>
                                <KbdShortcut />
                                <p className="mt-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20 italic">Sample Palette from High-Res Masters</p>
                              </div>
                             </>
                           ) : (
                             <div className="flex flex-col items-center gap-6 text-center w-full max-w-[320px] animate-in slide-in-from-bottom-4 fade-in duration-500 relative z-10 p-6">
                               {/* Animated Warning Icon */}
                               <div className="relative">
                                 <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
                                 <div className="relative h-16 w-16 rounded-2xl border-2 border-primary/50 flex items-center justify-center bg-primary/10 text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]">
                                   <ShieldAlert className="h-8 w-8 animate-[pulse_2s_ease-in-out_infinite]" />
                                 </div>
                               </div>

                               <div>
                                 <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-1 italic">Security Rejection</p>
                                 <p className="text-lg font-black text-white italic leading-none tracking-tight">
                                   {renderError === "FILE_TOO_LARGE" ? "Artifact Density Overflow" : "Dimension Threshold Breach"}
                                 </p>
                               </div>

                               <div className="w-full bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left flex gap-3 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-both shadow-2xl font-sans">
                                 <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                 <div className="space-y-1.5">
                                   <p className="text-[9px] font-black uppercase tracking-wider text-primary italic">Hardware Safety Tip</p>
                                   <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">
                                     {renderError === "FILE_TOO_LARGE" 
                                       ? "This master exceeds the 25MB security gate. Full spectrum color sampling on massive bitmaps can exhaust browser heap memory and cause a critical UI freeze." 
                                       : "The dimensions exceed the 8000px hardware limit. Precision sampling at this scale can crash the GPU compositor on many devices."}
                                   </p>
                                 </div>
                               </div>
                               
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={(e) => { e.stopPropagation(); setRenderError(null); }}
                                 className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all mt-2"
                               >
                                 Clear Warning
                               </Button>
                             </div>
                           )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="workbench"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          className="absolute inset-0 flex items-center justify-center cursor-crosshair active:cursor-grabbing overflow-hidden"
                        >
                          <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                            <img
                              ref={imgRef}
                              src={imgSrc}
                              alt="Local Source"
                              crossOrigin="anonymous"
                              onLoad={handleImageLoad}
                              onClick={handleClick}
                              onDragStart={(e) => e.preventDefault()}
                              className="transition-transform duration-75 ease-out origin-center rounded-xl border border-white/10 shadow-2xl"
                              style={{
                                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                                imageRendering: zoom > 2 ? "pixelated" : "auto",
                                width: 'auto',
                                height: 'auto',
                                maxWidth: 'none',
                                maxHeight: 'none'
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <input 
                    ref={inputRef} 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      handleFile(e.target.files?.[0]);
                      e.target.value = "";
                    }} 
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </Card>

                <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic px-4">Sub-pixel sampling • Scroll to zoom 1000% • Right-click drag to pan</p>
              </div>

              {imgSrc && (
                <aside className="space-y-6 lg:sticky lg:top-28 h-fit animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card border-2 border-primary/5">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Extraction Logic</h3>
                    {imgSrc && (
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/10 rounded-xl transition-all" onClick={() => { setZoom(prevZoom => Math.min(50, prevZoom * 0.9)); }}>
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/10 rounded-xl transition-all" onClick={() => { setZoom(prevZoom => Math.min(50, prevZoom * 1.1)); }}>
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/10 rounded-xl transition-all" onClick={() => { setZoom(fitZoom); setOffset({ x: 0, y: 0 }); }}>
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                        <div className="w-[1px] h-4 bg-white/10 mx-1" />
                        <Button
                          onClick={() => { setImgSrc(null); setColor(null); }}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Extraction History</h3>
                        {history.length > 0 && (
                          <Button
                            onClick={() => setHistory([])}
                            variant="ghost"
                            className="h-5 px-2 text-[8px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10"
                          >
                            Clear
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-6 gap-1.5">
                        {history.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => { setColor(c); navigator.clipboard.writeText(c.hex); toast.success("Copied!"); }}
                            className="group relative aspect-square rounded-2xl border border-white/5 shadow-md overflow-x-clip transition-transform hover:scale-110 active:scale-95"
                            style={{ backgroundColor: c.hex }}
                          >
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                              <Copy className="h-2.5 w-2.5 text-white" />
                            </div>
                          </button>
                        ))}
                      </div>

                      {color ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pt-4 border-t border-primary/5">
                          <div
                            className="h-20 w-full rounded-xl shadow-xl border-2 border-white/5"
                            style={{ backgroundColor: color.hex, boxShadow: `0 10px 20px ${color.hex}44` }}
                          />
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              onClick={() => { navigator.clipboard.writeText(color.hex); toast.success("Hex Copied"); }}
                              className="flex items-center justify-between p-3 bg-background/20 rounded-xl border border-border/50 hover:bg-primary/10 group"
                            >
                              <div className="text-left">
                                <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">HEX</p>
                                <p className="text-sm font-black font-mono">{color.hex}</p>
                              </div>
                              <Copy className="h-3 w-3 text-primary opacity-20 group-hover:opacity-100" />
                            </button>

                            <button
                              onClick={() => { navigator.clipboard.writeText(color.rgb); toast.success("RGB Copied"); }}
                              className="flex items-center justify-between p-3 bg-background/20 rounded-xl border border-border/50 hover:bg-primary/10 group"
                            >
                              <div className="text-left">
                                <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">RGB</p>
                                <p className="text-sm font-black font-mono">{color.rgb}</p>
                              </div>
                              <Copy className="h-3 w-3 text-primary opacity-20 group-hover:opacity-100" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center bg-background/20 rounded-xl border border-dashed border-primary/10">
                          <Pipette className="h-6 w-6 text-primary mx-auto mb-2 opacity-20" />
                          <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Sample Canvas</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-primary/5">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Zoom</label>
                        <span className="text-[10px] font-black text-primary italic font-mono whitespace-nowrap">
                          {Math.round((zoom / fitZoom) * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setZoom(fitZoom); setOffset({ x: 0, y: 0 }); }}
                          className={`h-7 w-7 rounded-lg shrink-0 ${zoom === fitZoom ? "text-primary bg-primary/20" : "text-muted-foreground opacity-40 hover:bg-primary/20"}`}
                          title="Reset Fit"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                        <Slider
                          defaultValue={[1]}
                          value={[zoom]}
                          min={0.01}
                          max={100}
                          step={0.01}
                          onValueChange={([v]) => setZoom(v)}
                          disabled={!imgSrc}
                          className="py-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </aside>
              )}
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Image Color Palette Extractor"
              description="The Image Color Palette Extractor is a high-fidelity sampling engine designed for digital artists and front-end developers to isolate sub-pixel color values from any source image."
              transparency="Our extraction logic utilizes the HTML5 Canvas API to sample RGBA data directly from your local hardware buffer. This process is 100% private—your source images never leave your device, ensuring total security for unreleased design assets."
              limitations="While the tool supports zooming up to 5000% for precision sampling, loading extremely high-resolution RAW photographs (e.g., 100MB+ DSLR shots) may cause temporary memory spikes in your browser. We recommend using web-optimized JPG/PNG files for the smoothest performance."
              accent="orange"
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

export default ImageColorExtractor;
