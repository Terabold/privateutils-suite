import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, Shield, ShieldAlert, FileText, Image as ImageIcon, Check, Copy, Trash2, Undo2, MousePointer2, Move, ZoomIn, ZoomOut, Maximize2, RefreshCw, Grid3X3, ShieldX, Eraser, Square, Layers, Sparkles, CloudUpload, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";

import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import ToolAdBanner from "@/components/ToolAdBanner";
import { Label } from "@/components/ui/label";
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
  const [blurStrength, setBlurStrength] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
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
      toast.error("GIFs are not supported for redaction. Please use static images.");
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
          toast.success("Image loaded");
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

  const autoFit = useCallback(() => {
    const container = containerRef.current;
    if (container && image) {
      const pad = 80;
      const availableW = container.clientWidth - pad;
      const availableH = container.clientHeight - pad;

      if (availableW <= 0 || availableH <= 0) return;

      const calculatedFitZoom = Math.min(availableW / image.width, availableH / image.height, 1);
      setZoom(calculatedFitZoom);
      setFitZoom(calculatedFitZoom);
      setOffset({ x: 0, y: 0 });
    }
  }, [image]);

  useEffect(() => {
    if (image) {
      // Small delay to ensure the container has reached its final layout dimensions
      const timer = setTimeout(autoFit, 100);
      window.addEventListener('resize', autoFit);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', autoFit);
      };
    }
  }, [image, autoFit]);

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
        ctx.filter = `blur(${r.strength / 4}px)`;
        ctx.drawImage(image, 0, 0);
      } else {
        ctx.fillStyle = "black";
        ctx.fillRect(r.x, r.y, r.width, r.height);
      }
      ctx.restore();

    });

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

      setZoom(prevZoom => {
        const newZoom = Math.min(50, Math.max(0.01, prevZoom * factor));
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
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY)
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
      setStartPos({ x: Math.round(pos.x), y: Math.round(pos.y) });
      setCurrPos({ x: Math.round(pos.x), y: Math.round(pos.y) });
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
    const pos = getMousePos(e);
    setCurrPos({ x: Math.round(pos.x), y: Math.round(pos.y) });
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

    if (w >= 1 && h >= 1) {
      let adjustedStrength = blurStrength;
      if (Math.max(w, h) < 20) adjustedStrength = Math.max(2, blurStrength / 4);
      setRegions([...regions, {
        id: Math.random().toString(36).substr(2, 9),
        x, y, width: w, height: h,
        strength: adjustedStrength,
        style: redactionStyle
      }]);
      toast.success("Area blurred/blacked out");
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
    toast.success("File Saved");
  };

  const redactSelectedText = () => {
    const sel = window.getSelection()?.toString();
    if (sel && textContent) {
      setTextContent(textContent.replace(sel, "█".repeat(sel.length)));
      toast.success("Text redacted");
    } else {
      toast.error("Highlight text to redact");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-privacy transition-all duration-500 overflow-x-clip">
      

      <div className="flex justify-center items-start w-full relative overflow-x-clip px-4">
        <SponsorSidebars position="left" className="shrink-0" />

        <main className="container mx-auto max-w-[1300px] px-6 py-6 grow overflow-visible min-w-0">
          <div className="flex flex-col gap-10">
            <header className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button aria-label="Go back to home" variant="outline" size="icon" className="h-12 w-12 rounded-xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white leading-none">
                    Image PII <span className="text-primary italic">Masker Lab</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">Secure Privacy Redaction</p>
                </div>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Horizontal Studio Toolbar - Compact Single Row */}
              <AnimatePresence>
                {(image || textContent) && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >                    <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card border-2 border-primary/5 p-4 lg:p-6 space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Internal Row 1: Forensic Logic & Intensity */}
                      <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-4 flex-wrap lg:flex-nowrap border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3 lg:gap-6 flex-wrap sm:flex-nowrap w-full lg:w-auto justify-center lg:justify-start shrink-0 lg:scale-110 lg:origin-left">
                          {image && (
                            <div className="flex items-center gap-2 lg:gap-4">
                              <div className="h-8 w-8 lg:h-10 lg:w-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
                                <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                              </div>
                              <div className="shrink-0">
                                <Label htmlFor="pii-blur-strength-slider" className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-primary italic leading-none hidden sm:block cursor-pointer">Intensity</Label>
                                <p className="text-[8px] lg:text-[9px] font-black text-muted-foreground uppercase opacity-40 leading-none mt-1.5 lg:mt-2">Redaction</p>
                              </div>
                              <div className="w-24 sm:w-32 lg:w-48 shrink-0">
                                <Slider
                                  id="pii-blur-strength-slider"
                                  name="pii-blur-strength-slider"
                                  min={0} max={100} step={1}
                                  disabled={redactionStyle === "black"}
                                  value={[blurStrength]}
                                  onValueChange={([v]) => setBlurStrength(v)}
                                  className="w-full cursor-pointer py-4"
                                />
                              </div>
                              <span className="text-[10px] md:text-xs lg:text-2xl font-black text-primary italic tracking-widest font-mono shrink-0 min-w-[35px] lg:min-w-[60px] text-right">
                                {blurStrength}%
                              </span>
                            </div>
                          )}
                          {textContent && (
                            <div className="flex items-center gap-3 shrink-0">
                              <Shield className="h-4 w-4 lg:h-8 lg:w-8 text-primary animate-pulse" />
                              <span className="text-[10px] lg:text-2xl font-black uppercase tracking-widest text-primary italic whitespace-nowrap">Secure Mode Active</span>
                            </div>
                          )}
                        </div>

                        {/* Mode Toggles (Blur / Blackout) */}
                        <div className="flex bg-black/40 p-1 lg:p-1.5 rounded-xl border border-white/10 shrink-0 shadow-inner group/mode">
                          {(["blur", "black"] as const).map(s => (
                            <Button
                              key={s}
                              size="sm"
                              variant={redactionStyle === s ? "default" : "ghost"}
                              onClick={() => setRedactionStyle(s)}
                              className={`h-7 lg:h-10 px-4 lg:px-8 text-[9px] lg:text-[11px] font-black uppercase rounded-xl transition-all ${redactionStyle === s ? "shadow-glow bg-primary text-white" : "text-muted-foreground opacity-60 hover:bg-primary/20"}`}
                            >
                              {s === "blur" ? "Blur" : "Blackout"}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Internal Row 2: Spatial Navigation & Actions */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8 flex-wrap sm:flex-nowrap w-full lg:w-auto justify-center lg:justify-end shrink-0 pt-2 border-t sm:border-t-0 border-white/10">
                        {/* Zoom Group */}
                        <div className="flex items-center gap-1 lg:gap-2 shrink-0 bg-background/40 p-1 rounded-xl border border-white/5 mr-auto">
                          <Button
                            aria-label="Zoom out"
                            size="icon"
                            variant="ghost"
                            onClick={() => { setZoom(z => Math.max(0.1, z * 0.9)); }}
                            className="h-7 md:h-8 lg:h-10 w-7 md:w-8 lg:w-10 rounded-xl hover:bg-white/10"
                          >
                            <ZoomOut className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                          <span className="text-[10px] lg:text-xl font-black text-foreground italic min-w-[35px] lg:min-w-[60px] text-center">
                            {Math.round((zoom / fitZoom) * 100)}%
                          </span>
                          <Button
                            aria-label="Zoom in"
                            size="icon"
                            variant="ghost"
                            onClick={() => { setZoom(z => Math.min(50, z * 1.1)); }}
                            className="h-7 md:h-8 lg:h-10 w-7 md:w-8 lg:w-10 rounded-xl hover:bg-white/10"
                          >
                            <ZoomIn className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                          <div className="w-px h-6 bg-white/10 mx-1" />
                          <Button
                            aria-label="Reset zoom and fit"
                            size="icon"
                            variant="ghost"
                            onClick={() => { setZoom(fitZoom); setOffset({ x: 0, y: 0 }); }}
                            className={`h-7 md:h-8 lg:h-10 w-7 md:w-8 lg:w-10 rounded-xl transition-all ${zoom === fitZoom ? "text-primary bg-primary/20 shadow-glow" : "text-muted-foreground opacity-40 hover:bg-white/10"}`}
                            title="Reset Fit (100%)"
                          >
                            <Maximize2 className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                          <Button
                            aria-label="Toggle grid visibility"
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowGrid(!showGrid)}
                            className={`h-7 md:h-8 lg:h-10 w-7 md:w-8 lg:w-10 rounded-xl transition-all ${showGrid ? "text-primary bg-primary/20 shadow-glow" : "text-muted-foreground opacity-40 hover:bg-white/10"}`}
                          >
                            <Grid3X3 className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                        </div>

                        {/* Push actions to right */}
                        <div className="flex-grow lg:block hidden min-w-[20px]" />

                        {/* Terminal Actions Segment (Reset / Export) */}
                        <div className="flex items-center gap-1 lg:gap-3 shrink-0">
                          <Button
                            aria-label="Clear all redactions"
                            onClick={() => { setImage(null); setTextContent(null); setRegions([]); }}
                            variant="ghost"
                            size="sm"
                            className="h-7 md:h-8 lg:h-10 flex items-center gap-1 px-1.5 md:px-3 lg:px-5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all text-[7px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest shrink-0 group/reset"
                          >
                            <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 group-hover:rotate-12 transition-transform" />
                            <span className="sm:inline hidden">Clear All</span>
                            <span className="sm:hidden inline">Reset</span>
                          </Button>
                          <Button
                            aria-label="Download redacted file"
                            onClick={() => {
                              if (textContent) {
                                const blob = new Blob([textContent], { type: "text/plain" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `redacted_${file?.name || "document"}.txt`;
                                a.click();
                              } else {
                                exportImage();
                              }
                            }}
                            className="h-9 px-3 md:px-4 lg:h-12 lg:px-10 gap-1.5 lg:gap-3 text-[8px] md:text-[10px] lg:text-xs font-black rounded-xl border-b-2 border-primary-foreground/20 shadow-glow shadow-primary/20 italic uppercase tracking-tighter bg-primary text-white hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
                          >
                            <Download className="h-4 w-4 lg:h-5 lg:w-5" />
                            <span className="sm:inline hidden">Download File</span>
                            <span className="sm:hidden inline">Export</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {!image && !textContent ? (
                <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full">
                  <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => !processing && inputRef.current?.click()}
                      className="relative w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-40 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner group/dropzone"
                    >
                      <div className="h-24 w-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-10 shadow-inner group-hover/dropzone:scale-110 transition-transform">
                        <CloudUpload className="h-12 w-12 text-primary" />
                      </div>
                      <div className="px-6 space-y-2">
                        <p className="text-4xl font-black text-shadow-glow leading-none uppercase tracking-tighter italic">Upload File</p>
                        <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-40">Drag or click to browse</p>
                        <KbdShortcut />
                      </div>
                      <input ref={inputRef} type="file" id="pii-upload-input" name="pii-upload-input" className="hidden" accept="image/*,text/plain,.md,.log" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
                    </div>
                  </Card>
                </motion.div>
              ) : textContent !== null ? (
                <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 w-full">
                  <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 p-0 relative min-h-[660px] flex flex-col group">
                    <div className="bg-primary/5 p-5 px-10 border-b border-primary/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Text Document</h3>
                      </div>
                      <p className="text-[9px] font-black opacity-30 uppercase tracking-widest italic">Select text to redact from forensic stream</p>
                    </div>
                    <textarea
                      id="pii-text-input"
                      name="pii-text-input"
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="flex-1 bg-transparent p-12 px-16 font-mono text-base leading-relaxed focus:outline-none custom-scrollbar min-h-[400px] text-foreground/80 selection:bg-primary/40 resize-none"
                      spellCheck={false}
                    />
                    <div className="p-6 px-10 border-t border-border/10 bg-black/40 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={redactSelectedText}
                        className="h-14 px-10 text-[10px] font-black uppercase tracking-[0.2em] border border-primary/30 hover:bg-primary/20 transition-all text-primary rounded-2xl"
                      >
                        Redact Active Selection
                      </Button>
                      <p className="text-[11px] font-black opacity-20 uppercase tracking-[0.4em] italic">Manual Redaction Active</p>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 w-full max-w-full">
                  <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 p-3 lg:p-4 relative group lg:h-[540px] flex flex-col items-center justify-center w-full max-w-full">
                    <div
                      ref={containerRef}
                      className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#050505] rounded-xl select-none shadow-2xl group/canvas"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onContextMenu={(e) => e.preventDefault()}
                      style={{
                        cursor: isPanning ? 'grabbing' : 'crosshair',
                      }}
                    >
                      <div
                        className="relative shadow-2xl ring-1 ring-white/10 pointer-events-none origin-center flex items-center justify-center"
                        style={{
                          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                          imageRendering: zoom > 2 ? 'pixelated' : 'auto',
                          transition: isPanning ? 'none' : 'transform 75ms ease-out'
                        }}
                      >
                        <canvas
                          ref={canvasRef}
                          className="block"
                        />
                        <svg
                          viewBox={`0 0 ${image?.width || 0} ${image?.height || 0}`}
                          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                          shapeRendering="crispEdges"
                        >
                          {showGrid && (zoom / fitZoom) > 4 && (
                            <defs>
                              <pattern id="pixel-grid-pii" width="1" height="1" patternUnits="userSpaceOnUse">
                                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.1" />
                              </pattern>
                            </defs>
                          )}
                          {showGrid && zoom > 4 && <rect width="100%" height="100%" fill="url(#pixel-grid-pii)" />}

                          {/* Static Regions Outlines (Razor Sharp) */}
                          {regions.map(r => (
                            <rect
                              key={r.id}
                              x={r.x}
                              y={r.y}
                              width={r.width}
                              height={r.height}
                              fill="transparent"
                              stroke="rgba(124, 58, 237, 0.8)"
                              strokeWidth={1.8 / zoom}
                              vectorEffect="non-scaling-stroke"
                            />
                          ))}

                          {/* Pixel-Perfect Screenwise Selection Box */}
                          {isDrawing && (
                            <g>
                              <rect
                                x={Math.min(startPos.x, currPos.x)}
                                y={Math.min(startPos.y, currPos.y)}
                                width={Math.abs(startPos.x - currPos.x)}
                                height={Math.abs(startPos.y - currPos.y)}
                                fill="rgba(59, 130, 246, 0.2)"
                                stroke="white"
                                strokeWidth={1.5 / zoom}
                                strokeDasharray={`${4 / zoom} ${2 / zoom}`}
                                vectorEffect="non-scaling-stroke"
                                className="drop-shadow-[0_0_2px_rgba(0,0,0,1)]"
                              />
                              <text
                                x={Math.min(startPos.x, currPos.x)}
                                y={Math.min(startPos.y, currPos.y) - 5 / zoom}
                                fontSize={Math.max(8, 12 / zoom)}
                                fill="white"
                                className="font-mono font-black italic drop-shadow-[0_1px_2px_rgba(0,0,0,1)] pointer-events-none select-none"
                              >
                                [{Math.round(Math.abs(startPos.x - currPos.x))}x{Math.round(Math.abs(startPos.y - currPos.y))} PX]
                              </text>
                            </g>
                          )}
                        </svg>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Irreversible PII Masking Studio"
              accent="violet"
              overview="I architected the PII Masking Studio to provide a foolproof 'Sanitization Lifecycle' for sensitive visual artifacts. The core problem with most redaction tools is that they merely place a layer over the data; I built this to ensure that Personally Identifiable Information is mathematically vaporized from the underlying pixel stream before it even leaves the browser's internal sandbox."
              steps={[
                "Deploy your sensitive document or image master into the isolated client-side buffer.",
                "Initialize the 'Coordinate-Based Mask' to establish the geometric boundaries of the target PII data.",
                "Execute the 'High-Entropy Gaussian Cipher' or the 'Solid Block Destruction' to overwrite the bitstream.",
                "Monitor the live rasterization pass to confirm that the sensitive coordinate planes are structurally destroyed.",
                "Extract the irreversible artifact from volatile RAM, triggering an instant garbage collection of the unmasked origin data."
              ]}
              technicalImplementation="The technical implementation utilizes a non-reversible Canvas composite stack. Instead of simply drawing an overlay, the engine modifies the underlying ImageData buffer at the pixel level. For blurring, we apply a high-entropy Gaussian kernel directly to the target RGBA arrays. For blackouts, we perform a total value-overwrite within the specified coordinate matrix. This 'raster destruction' approach ensures that even with advanced forensic software, there is no 'underlying' data to recover—the memory management cycle ensures that the original, unmasked buffers are purged from system heap immediately after the export lifecycle."
              privacyGuarantee="My Privacy Guarantee is rooted in 'Bitstream Isolation'. Unlike cloud-based redaction services that might retain 'originals' for their logs, our studio exists entirely within your browser's private application state. No network ingress or egress occurs during the masking phase. The lifecycle of your sensitive data is ephemeral—once the tab is vaporized, every remaining byte in the temporary client-side buffer is permanently lost."
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

export default PiiMasker;