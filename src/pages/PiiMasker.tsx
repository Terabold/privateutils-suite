import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, Shield, ShieldAlert, FileText, Image as ImageIcon, Check, Copy, Trash2, Undo2, MousePointer2, Move, ZoomIn, ZoomOut, Maximize2, RefreshCw, Grid3X3, ShieldX, Eraser, Square, Layers, Sparkles, CloudUpload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

interface RedactionRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  strength: number;
  style: "blur" | "black";
}

const PiiMasker = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [regions, setRegions] = useState<RedactionRegion[]>([]);
  const [redactionStyle, setRedactionStyle] = useState<"blur" | "black">("blur");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currPos, setCurrPos] = useState({ x: 0, y: 0 });
  const [blurStrength, setBlurStrength] = useState(20);
  const [processing, setProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    
    if (f.type === "image/gif") {
      toast.error("GIF artifacts are not natively supported by the masking engine. Please use static masters.");
      return;
    }

    setFile(f);
    setRegions([]);
    setZoom(1);
    setOffset({ x: 0, y: 0 });

    const isImage = f.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setTextContent(null);
          
          // Auto-Fit and Center Logic
          const container = containerRef.current;
          if (container) {
            const pad = 80;
            const availableW = container.clientWidth - pad;
            const availableH = container.clientHeight - pad;
            const fitZoom = Math.min(availableW / img.width, availableH / img.height, 1);
            setZoom(fitZoom);
            setOffset({ x: 0, y: 0 });
          }
          
          toast.success("Identity Scrubber Initialized");
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(f);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTextContent(e.target?.result as string);
        setImage(null);
        toast.success("Document Redaction Mode");
      };
      reader.readAsText(f);
    }
  };

  usePasteFile(handleFile);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !image) return;

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    if (showGrid || zoom > 8) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 0.5 / zoom;
      
      // Major grid (50px)
      for (let x = 0; x <= canvas.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Pixel grid (1px) - only at extreme zoom
      if (zoom > 15) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 0.2 / zoom;
        for (let x = 0; x <= canvas.width; x += 1) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += 1) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
      }
      ctx.restore();
    }

    regions.forEach(r => {
      ctx.save();
      if (r.style === "blur") {
        ctx.beginPath();
        ctx.rect(r.x, r.y, r.width, r.height);
        ctx.clip();
        ctx.filter = `blur(${r.strength}px)`;
        ctx.drawImage(image, 0, 0);
      } else {
        ctx.fillStyle = "black";
        ctx.fillRect(r.x, r.y, r.width, r.height);
      }
      ctx.restore();
      
      ctx.strokeStyle = "rgba(124, 58, 237, 0.6)";
      ctx.lineWidth = 1 / zoom;
      ctx.strokeRect(r.x, r.y, r.width, r.height);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.2 / zoom;
      ctx.setLineDash([4 / zoom, 3 / zoom]);
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      ctx.setLineDash([]);
    });

    if (isDrawing) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 1)";
      ctx.lineWidth = Math.max(0.5, 2 / zoom);
      ctx.setLineDash([Math.max(1, 5 / zoom), Math.max(1, 5 / zoom)]);
      
      const x = Math.min(startPos.x, currPos.x);
      const y = Math.min(startPos.y, currPos.y);
      const w = Math.abs(startPos.x - currPos.x);
      const h = Math.abs(startPos.y - currPos.y);
      
      // Outer glow for visibility
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 4 / zoom;
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }
  }, [image, regions, isDrawing, startPos, currPos, zoom]);

  useEffect(() => {
    if (image) drawCanvas();
  }, [drawCanvas, image]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !image) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(50, Math.max(0.1, prev * factor)));
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [image]);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    if (e.button === 2) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }
    if (e.button === 0) {
      const pos = getMousePos(e);
      setIsDrawing(true);
      setStartPos(pos);
      setCurrPos(pos);
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
    if (!isDrawing) return;
    setCurrPos(getMousePos(e));
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (!isDrawing) return;
    setIsDrawing(false);
    const x = Math.min(startPos.x, currPos.x);
    const y = Math.min(startPos.y, currPos.y);
    const w = Math.abs(startPos.x - currPos.x);
    const h = Math.abs(startPos.y - currPos.y);

    if (w > 5 && h > 5) {
      let adjustedStrength = blurStrength;
      if (Math.max(w, h) < 20) adjustedStrength = Math.max(2, blurStrength / 4);
      setRegions([...regions, { 
        id: Math.random().toString(36).substr(2, 9),
        x, y, width: w, height: h, 
        strength: adjustedStrength,
        style: redactionStyle
      }]);
      toast.success("Partition Redacted");
    }
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `redacted_${file?.name || "image"}.png`;
    a.click();
    toast.success("Artifact Dispatched");
  };

  const redactSelectedText = () => {
    const sel = window.getSelection()?.toString();
    if (sel && textContent) {
      setTextContent(textContent.replace(sel, "█".repeat(sel.length)));
      toast.success("Identity String Redacted");
    } else {
      toast.error("Highlight text to redact");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-privacy transition-all duration-500 overflow-x-hidden">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
        </aside>

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow overflow-visible">
        <div className="flex flex-col gap-10">
          <header className="flex items-center justify-between flex-wrap gap-8">
            <div className="flex items-center gap-6">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-none">
                   PII <span className="text-primary italic">Masker</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">Neural-Grade Privacy Redaction</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-8">
              {!image && !textContent ? (
                <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[400px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10">
                   <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => !processing && inputRef.current?.click()}
                    className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-32 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                  >
                    <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                       <CloudUpload className="h-10 w-10 text-primary" />
                    </div>
                    <div className="px-6 space-y-1">
                      <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Hub Artifact</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag or click to browse</p>
                      <KbdShortcut />
                      <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20 text-center uppercase tracking-tighter font-black">Images, Logs, TXT or MD Supported</p>
                    </div>
                    <input ref={inputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp,text/plain,text/markdown,.log" onChange={(e) => handleFile(e.target.files?.[0])} />
                  </div>
                </Card>
              ) : textContent !== null ? (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 p-0 relative min-h-[600px] flex flex-col group">
                    <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Live Document Stream</h3>
                       <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Select text to redact</p>
                    </div>
                    <textarea 
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="flex-1 bg-transparent p-10 font-mono text-sm leading-relaxed focus:outline-none custom-scrollbar min-h-[600px] text-foreground/80 selection:bg-primary/30"
                      spellCheck={false}
                    />
                    <div className="p-4 border-t border-border/10 bg-black/40 flex justify-between items-center">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={redactSelectedText}
                         className="h-8 text-[9px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/10 transition-all text-primary"
                        >
                         Redact Selection
                       </Button>
                       <p className="text-[9px] font-black opacity-20 uppercase tracking-widest italic">Manual Block-Cipher Active</p>
                    </div>
                    
                    {/* Reset Button (Text Mode) */}
                    <div className="absolute top-4 right-4 z-10">
                       <Button 
                         onClick={() => { setImage(null); setTextContent(null); setFile(null); setRegions([]); }} 
                         variant="destructive" 
                         size="sm" 
                         className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all border border-black/20"
                       >
                         Reset Stage
                       </Button>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="space-y-8">
                  <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 p-10 relative group h-[650px] flex flex-col items-center justify-center">
                        <div 
                          ref={containerRef}
                          className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#050505] rounded-2xl select-none shadow-2xl group/canvas"
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          onContextMenu={(e) => e.preventDefault()}
                          style={{ 
                            cursor: isPanning ? 'grabbing' : 'crosshair',
                            backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%), 
                                             linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%), 
                                             linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.02) 75%), 
                                             linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.02) 75%)`,
                            backgroundSize: '20px 20px'
                          }}
                        >
                          <div
                              className="relative shadow-2xl ring-1 ring-white/10 pointer-events-none origin-center transition-transform duration-75 ease-out"
                              style={{
                                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                                imageRendering: zoom > 2 ? 'pixelated' : 'auto',
                                willChange: 'transform',
                                width: image?.width,
                                height: image?.height
                              }}
                            >
                            <canvas
                              ref={canvasRef}
                              className="block"
                            />
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                              {zoom > 4 && (
                                <defs>
                                  <pattern id="pixel-grid-pii" width="1" height="1" patternUnits="userSpaceOnUse">
                                    <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.05" />
                                  </pattern>
                                </defs>
                              )}
                              {zoom > 4 && <rect width="100%" height="100%" fill="url(#pixel-grid-pii)" opacity="0.4" />}
                            </svg>
                          </div>

                          {/* Floating HUD controls (Studio Style) */}
                          <div className="absolute top-8 right-8 z-20 flex gap-2 p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                            <Button 
                              onClick={() => { setImage(null); setTextContent(null); setRegions([]); }} 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl"
                            >
                               <RefreshCw className="h-5 w-5" />
                            </Button>
                            <div className="w-[1px] h-6 bg-white/10 self-center" />
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10 rounded-xl" onClick={() => setZoom(z => Math.max(0.1, z * 0.9))}>
                               <ZoomOut className="h-5 w-5" />
                            </Button>
                            <div className="w-[1px] h-6 bg-white/10 self-center" />
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10 rounded-xl" onClick={() => setZoom(z => Math.min(50, z * 1.1))}>
                               <ZoomIn className="h-5 w-5 font-black" />
                            </Button>
                            <div className="w-[1px] h-6 bg-white/10 self-center" />
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10 rounded-xl" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>
                               <Maximize2 className="h-5 w-5" />
                            </Button>
                          </div>

                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest text-primary/60 italic">
                            {Math.round(zoom * 100)}% Magnification • Left-Click Mask • Right-Click Pan
                          </div>
                        </div>
                  </Card>
                </div>
              )}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
               <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Redaction Logic</h3>
                  </div>
                 <CardContent className="p-5 space-y-6">
                    {image && (
                      <div className="space-y-6">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block">Style Mask</label>
                           <div className="grid grid-cols-2 gap-2 bg-muted/20 p-1 rounded-2xl">
                              <button onClick={() => setRedactionStyle("blur")} className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${redactionStyle === "blur" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hov:bg-primary/5"}`}>
                                 Gaussian
                              </button>
                              <button onClick={() => setRedactionStyle("black")} className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${redactionStyle === "black" ? "bg-black text-white shadow-lg" : "text-muted-foreground hov:bg-primary/5"}`}>
                                 Blackout
                              </button>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block">Matric Intensity</label>
                           <Slider 
                             min={0} max={100} step={1}
                             disabled={redactionStyle === "black"}
                             value={[blurStrength]}
                             onValueChange={([v]) => setBlurStrength(v)}
                           />
                        </div>
                      </div>
                    )}

                    {textContent && (
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary italic">Document Mode Active</p>
                        <p className="text-[8px] leading-relaxed opacity-40 uppercase font-black">All redactions are local to browser memory. Selection is replaced with solid matrix characters.</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-border/20">
                       <Button 
                         onClick={() => {
                           if (textContent) {
                             const blob = new Blob([textContent], { type: "text/plain" });
                             const url = URL.createObjectURL(blob);
                             const a = document.createElement("a");
                             a.href = url;
                             a.download = `redacted_${file?.name || "document"}.txt`;
                             a.click();
                             toast.success("Artifact Dispatched");
                           } else {
                             exportImage();
                           }
                         }} 
                         disabled={!image && !textContent} 
                         className="w-full h-16 text-md font-black rounded-2xl gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all"
                       >
                          <Download className="h-5 w-5" /> Export Artifact
                       </Button>
                    </div>
                 </CardContent>
               </Card>
            </aside>
            </div>
          </div>
        </main>

        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-right-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default PiiMasker;
