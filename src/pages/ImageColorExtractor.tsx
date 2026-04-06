import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Copy, Check, Pipette, Search, ZoomIn, ZoomOut, Maximize2, MousePointer2, CloudUpload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
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

    // Color extractor is for static palettes, reject GIFs to manage user expectations
    if (f.type === "image/gif") {
      toast.error("GIF artifacts are not natively supported by the precision extractor.");
      return;
    }

    if (imgSrc) URL.revokeObjectURL(imgSrc);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setColor(null);

    // Extract static frame
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

      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(50, Math.max(1, prev * factor)));
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

  const copyHex = async () => {
    if (!color) return;
    await navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-image transition-all duration-500 ">
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
                  Color <span className="text-primary italic">Extractor</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Neural Color Palette Analysis • Precision Sampling Engine
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
              <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start overflow-visible">
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onContextMenu={(e) => e.preventDefault()}
                  ref={containerRef}
                  className="glass-morphism border-primary/10 h-[650px] flex flex-col items-center justify-center relative bg-card rounded-2xl shadow-inner select-none overflow-x-clip p-10"
                >
                  {!imgSrc ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => inputRef.current?.click()}
                      className="relative w-full h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer bg-background/40 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                    >
                      <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform">
                        <CloudUpload className="h-10 w-10 text-primary" />
                      </div>
                      <div className="px-6 space-y-2">
                        <p className="text-4xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Hub Artifact</p>
                        <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag master or click to browse</p>
                        <KbdShortcut />
                        <p className="mt-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20 italic">Sample Palette from High-Res Masters</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center cursor-crosshair active:cursor-grabbing">

                      <div className="absolute top-8 right-8 z-20 flex gap-2 p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                        {imgSrc && (
                          <Button
                            onClick={() => { setImgSrc(null); setColor(null); }}
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                          >
                            <RefreshCw className="h-5 w-5" />
                          </Button>
                        )}
                        <div className="w-[1px] h-6 bg-white/10 self-center mx-1" />
                        <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10 rounded-xl transition-all" onClick={() => {
                          setZoom(prevZoom => Math.min(50, prevZoom * 0.9));
                        }}>
                          <ZoomOut className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10 rounded-xl transition-all" onClick={() => {
                          setZoom(prevZoom => Math.min(50, prevZoom * 1.1));
                        }}>
                          <ZoomIn className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10 rounded-xl transition-all" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>
                          <Maximize2 className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="w-full h-full flex items-center justify-center overflow-x-clip">
                        <img
                          ref={imgRef}
                          src={imgSrc}
                          alt="Local Source"
                          crossOrigin="anonymous"
                          onLoad={handleImageLoad}
                          onClick={handleClick}
                          onDragStart={(e) => e.preventDefault()}
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
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-x-clip shadow-xl bg-card border-2 border-primary/5">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Extraction Logic</h3>
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
                        <span className="text-[10px] font-black text-primary">{zoom.toFixed(1)}x</span>
                      </div>
                      <Slider
                        defaultValue={[1]}
                        value={[zoom]}
                        min={1}
                        max={50}
                        step={0.5}
                        onValueChange={([v]) => setZoom(v)}
                        disabled={!imgSrc}
                        className="py-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Precision Color Extractor"
              description="The Color Extractor is a high-fidelity sampling engine designed for digital artists and front-end developers to isolate sub-pixel color values from any source image."
              transparency="Our extraction logic utilizes the HTML5 Canvas API to sample RGBA data directly from your local hardware buffer. This process is 100% private—your source images never leave your device, ensuring total security for unreleased design assets."
              limitations="While the tool supports zooming up to 5000% for precision sampling, loading extremely high-resolution RAW photographs (e.g., 100MB+ DSLR shots) may cause temporary memory spikes in your browser. We recommend using web-optimized JPG/PNG files for the smoothest performance."
              accent="blue"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />

      {/* Mobile Sticky Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-black/80 backdrop-blur-sm border-t border-white/10 py-2 h-[66px] overflow-x-clip">
        <AdBox adFormat="horizontal" height={50} label="320x50 ANCHOR AD" className="w-full" />
      </div>
    </div>
  );
};

export default ImageColorExtractor;
