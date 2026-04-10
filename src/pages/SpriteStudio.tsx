import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, Scissors, Maximize2, Move, ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, Plus, Check, RefreshCw, Layers, Sparkles, CloudUpload, Grid3X3, Trash2, Square, Settings2, FolderArchive, MousePointer2, GripVertical, Activity } from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";

import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import StickyAnchorAd from "@/components/StickyAnchorAd";

import JSZip from "jszip";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

interface Slice {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
}

const SliceItem = ({ slice, idx, active, onClick, onDelete }: {
  slice: Slice;
  idx: number;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) => {
  useEffect(() => {
    return () => {
      // Cleanup for blob URLs if the slice had a preview
      if ((slice as any).previewUrl) {
        URL.revokeObjectURL((slice as any).previewUrl);
      }
    };
  }, [slice]);

  return (
    <div
      onClick={onClick}
      className={`p-3 px-4 flex items-center justify-between transition-none cursor-default z-10 ${active ? "bg-primary/20 shadow-inner" : "hover:bg-primary/10 bg-transparent"}`}
    >
      <div className="flex items-center gap-3 overflow-x-clip pointer-events-none">
        <GripVertical className="h-3 w-3 text-muted-foreground/30 cursor-grab active:cursor-grabbing pointer-events-auto" />
        <span className="text-[9px] font-black text-primary/80 italic">#{String(idx + 1).padStart(2, '0')}</span>
        <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[100px] text-foreground">{slice.name}</span>
      </div>
      <div className="flex items-center gap-2 pointer-events-none">
        <span className="text-[8px] font-black text-muted-foreground italic">{slice.w}x{slice.h}</span>
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="h-6 w-6 text-destructive opacity-40 hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded-2xl pointer-events-auto">
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const SpriteStudio = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [image, setImage] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [slices, setSlices] = useState<Slice[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragType, setDragType] = useState<"create" | "move" | "resize" | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [handleDir, setHandleDir] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<"manual" | "grid">("grid");
  const [gridMode, setGridMode] = useState<"count" | "pixel">("count");
  const [gridConfig, setGridConfig] = useState({
    rows: 4,
    cols: 4,
    cellW: 32,
    cellH: 32,
    gapX: 0,
    gapY: 0
  });
  const [isPanning, setIsPanning] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [processing, setProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (image) URL.revokeObjectURL(image);
    setSlices([]);
    const url = URL.createObjectURL(f);
    setImage(url);
  };

  usePasteFile((file) => handleFile(file));

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    let { naturalWidth, naturalHeight } = e.currentTarget;

    // Safety check for hardware canvas limits (usually 16,384px)
    const MAX_CANVAS = 16384;
    if (naturalWidth > MAX_CANVAS || naturalHeight > MAX_CANVAS) {
      toast.warning("Artifact exceeds hardware limits. Applying safety downscale to 16k master.");
      const ratio = naturalWidth / naturalHeight;
      if (naturalWidth > naturalHeight) {
        naturalWidth = MAX_CANVAS;
        naturalHeight = Math.floor(MAX_CANVAS / ratio);
      } else {
        naturalHeight = MAX_CANVAS;
        naturalWidth = Math.floor(MAX_CANVAS * ratio);
      }
    }

    setImgSize({ w: naturalWidth, h: naturalHeight });

    // Auto-scale to fill common viewports, maximizing pixel art scale up to 40x
    const viewportW = containerRef.current?.clientWidth || 800;
    const viewportH = containerRef.current?.clientHeight || 800;
    const maxViewW = viewportW - 80;
    const maxViewH = viewportH - 80;

    // Scale up or down to fit, capping at a huge 40x for pixel precision
    const newScale = Math.min(Math.min(maxViewW / naturalWidth, maxViewH / naturalHeight), 40);
    setScale(newScale);

    // Initial Centering (Top-Left point that centers a scaled image)
    const initialCenterX = (viewportW - (naturalWidth * newScale)) / 2;
    const initialCenterY = (viewportH - (naturalHeight * newScale)) / 2;
    setPan({ x: initialCenterX, y: initialCenterY });
    setZoom(1);
  };

  // Precision Zoom-to-Cursor Engine
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      if (!image) return;
      e.preventDefault();

      const factor = e.deltaY > 0 ? 0.9 : 1.11;

      setZoom(prevZoom => {
        const nextZoom = Math.max(0.01, Math.min(prevZoom * factor, 100));

        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - (rect.left + el.clientLeft);
        const mouseY = e.clientY - (rect.top + el.clientTop);

        const scaleDiff = nextZoom / prevZoom;

        setPan(prevPan => ({
          x: mouseX - (mouseX - prevPan.x) * scaleDiff,
          y: mouseY - (mouseY - prevPan.y) * scaleDiff
        }));

        return nextZoom;
      });
    };

    el.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", handleWheelNative);
  }, [image]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as any).touches[0].clientX : (e as any).clientX;
    const clientY = 'touches' in e ? (e as any).touches[0].clientY : (e as any).clientY;

    // Screen coordinates to Viewport coordinates
    const viewX = clientX - (rect.left + containerRef.current.clientLeft);
    const viewY = clientY - (rect.top + containerRef.current.clientTop);

    // Viewport coordinates to Canvas coordinates (accounting for PAN and SCALE+ZOOM)
    const currentScale = scale * zoom;
    if (currentScale === 0) return { x: 0, y: 0 };

    const rawX = (viewX - pan.x) / currentScale;
    const rawY = (viewY - pan.y) / currentScale;

    // Precise Float Coordinate (Rounding happens on modification/save)
    return { x: rawX, y: rawY };
  };

  const addSlice = (x: number, y: number, w: number, h: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newSlice: Slice = {
      id,
      x: Math.round(x),
      y: Math.round(y),
      w: Math.round(w),
      h: Math.round(h),
      name: `slice_${slices.length + 1}`
    };
    setSlices(prev => [...prev, newSlice]);
    setActiveId(id);
    return id;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;

    // Check for Right-Click (2) or Middle-Click (1) for Panning
    if (e.button === 2 || e.button === 1) {
      setIsPanning(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (mode === "grid") {
      toast.error("Manual selection locked in Grid Mode");
      return;
    }

    const { x, y } = getCanvasPos(e);
    const rx = Math.round(x);
    const ry = Math.round(y);

    // Check if clicking a handle of the active slice
    if (activeId) {
      const active = slices.find(s => s.id === activeId);
      if (active) {
        // Simple handle detection (Size stays clickable even when zoomed)
        const hSize = 12 / (scale * zoom);
        const hitHandle = (hx: number, hy: number) => Math.abs(x - hx) < hSize && Math.abs(y - hy) < hSize;

        if (hitHandle(active.x, active.y)) { setDragType("resize"); setHandleDir("tl"); }
        else if (hitHandle(active.x + active.w, active.y)) { setDragType("resize"); setHandleDir("tr"); }
        else if (hitHandle(active.x, active.y + active.h)) { setDragType("resize"); setHandleDir("bl"); }
        else if (hitHandle(active.x + active.w, active.y + active.h)) { setDragType("resize"); setHandleDir("br"); }
        else if (x >= active.x && x <= active.x + active.w && y >= active.y && y <= active.y + active.h) {
          setDragType("move");
        } else {
          startNewSelection(rx, ry);
        }
      } else {
        startNewSelection(rx, ry);
      }
    } else {
      startNewSelection(rx, ry);
    }

    setStartPos({ x: rx, y: ry });
  };

  const startNewSelection = (x: number, y: number) => {
    const clickedSlice = [...slices].reverse().find(s => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
    if (clickedSlice) {
      setActiveId(clickedSlice.id);
      setDragType("move");
    } else {
      setDragType("create");
      const id = addSlice(x, y, 1, 1);
      setActiveId(id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setStartPos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!dragType || !activeId) return;
    const { x, y } = getCanvasPos(e);

    const dx = x - startPos.x;
    const dy = y - startPos.y;

    if (dx === 0 && dy === 0 && dragType !== "create") return;

    setSlices(prev => prev.map(s => {
      if (s.id !== activeId) return s;

      if (dragType === "create") {
        return { ...s, w: x - s.x, h: y - s.y };
      }

      if (dragType === "move") {
        return { ...s, x: s.x + dx, y: s.y + dy };
      }

      if (dragType === "resize") {
        let { x: nx, y: ny, w: nw, h: nh } = s;
        if (handleDir === "tl") { nx = x; ny = y; nw = s.w - dx; nh = s.h - dy; }
        if (handleDir === "tr") { ny = y; nw = x - s.x; nh = s.h - dy; }
        if (handleDir === "bl") { nx = x; nw = s.w - dx; nh = y - s.y; }
        if (handleDir === "br") { nw = x - s.x; nh = y - s.y; }
        return { ...s, x: nx, y: ny, w: nw, h: nh };
      }

      return s;
    }));

    setStartPos({ x, y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDragType(null);
    setHandleDir(null);
    setSlices(prev => prev.map(s => {
      let nx = Math.round(s.w < 0 ? s.x + s.w : s.x);
      let ny = Math.round(s.h < 0 ? s.y + s.h : s.y);
      let nw = Math.round(Math.abs(s.w));
      let nh = Math.round(Math.abs(s.h));

      // Final clamping safety check to prevent export overflow
      if (nx < 0) { nw += nx; nx = 0; }
      if (ny < 0) { nh += ny; ny = 0; }
      if (imgSize.w > 0 && nx + nw > imgSize.w) { nw = imgSize.w - nx; }
      if (imgSize.h > 0 && ny + nh > imgSize.h) { nh = imgSize.h - ny; }

      return {
        ...s,
        x: nx,
        y: ny,
        w: nw,
        h: nh
      };
    }).filter(s => s.w > 1 && s.h > 1));
  };

  const generateGrid = (rows: number, cols: number, gapX = 0, gapY = 0, cellW?: number, cellH?: number, mode: "count" | "pixel" = "count") => {
    if (!image) return;

    const newSlices: Slice[] = [];

    if (mode === "count") {
      // Available usable pixels (Image size - total gaps)
      const usableW = imgSize.w - (cols - 1) * gapX;
      const usableH = imgSize.h - (rows - 1) * gapY;

      const calcCellW = usableW / cols;
      const calcCellH = usableH / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = Math.round(c * (calcCellW + gapX));
          const sy = Math.round(r * (calcCellH + gapY));
          const sw = Math.round(calcCellW);
          const sh = Math.round(calcCellH);

          newSlices.push({
            id: Math.random().toString(36).substr(2, 9),
            x: sx,
            y: sy,
            w: sw,
            h: sh,
            name: `tile_${r}_${c}`
          });
        }
      }
      toast.success(`Generated ${rows * cols} tiles (${rows}x${cols})`);
    } else if (cellW && cellH) {
      // Pixel mode: cells are fixed size, count is calculated
      const actualCols = Math.floor((imgSize.w + gapX) / (cellW + gapX));
      const actualRows = Math.floor((imgSize.h + gapY) / (cellH + gapY));

      for (let r = 0; r < actualRows; r++) {
        for (let c = 0; c < actualCols; c++) {
          const sx = c * (cellW + gapX);
          const sy = r * (cellH + gapY);

          newSlices.push({
            id: Math.random().toString(36).substr(2, 9),
            x: sx,
            y: sy,
            w: cellW,
            h: cellH,
            name: `sprite_${r}_${c}`
          });
        }
      }
      toast.success(`Generated ${actualRows * actualCols} sprites (${cellW}x${cellH}px)`);
    }

    setSlices(newSlices);
  };

  const deleteSlice = (id: string) => {
    setSlices(slices.filter(s => s.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const downloadZip = async () => {
    if (slices.length === 0 || !image) return;
    setProcessing(true);
    const zip = new JSZip();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.src = image;

    await new Promise(resolve => img.onload = resolve);

    for (const slice of slices) {
      canvas.width = slice.w;
      canvas.height = slice.h;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, slice.x, slice.y, slice.w, slice.h, 0, 0, slice.w, slice.h);

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
      if (blob) {
        zip.file(`${slice.name}.png`, blob);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `studio_slices_${Date.now()}.zip`;
    link.click();
    setProcessing(false);
    toast.success("Baking complete! ZIP downloaded.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1800px] px-6 py-6 grow overflow-x-clip">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white leading-tight">
                  Sprite <span className="text-primary italic">Studio</span>
                </h1>
                <p className="text-muted-foreground mt-1 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">Professional Pixel Partitioning Engine • Batch Asset Slicing</p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-4 w-full">
              <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_340px_280px] gap-8 items-start">
              {/* Column 1: Main Stage */}
              <div className="space-y-4">
                {/* Horizontal Command Bar */}
                <div className="glass-morphism border border-white/10 rounded-2xl p-2 px-5 flex items-center justify-between gap-4 bg-background/40 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-6 divide-x divide-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-primary/40" />
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground italic">Canvas Resolution</span>
                        <span className="text-[10px] font-black text-foreground tracking-tighter italic">{imgSize.w > 0 ? `${imgSize.w} x ${imgSize.h} PIXELS` : "EMPTY STAGE"}</span>
                      </div>
                    </div>
                    <div className="pl-6 flex items-center gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-primary/40" />
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground italic">Asset Partitioning</span>
                        <span className="text-[10px] font-black text-foreground tracking-tighter italic">{slices.length} ACTIVE NODES</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={() => { if (image) URL.revokeObjectURL(image); setImage(null); setSlices([]); setActiveId(null); }} variant="outline" size="sm" className="h-8 px-2 md:px-4 rounded-xl font-black text-[8px] uppercase gap-2 border-primary/10 bg-primary/5 backdrop-blur-md hover:bg-destructive/20 hover:text-destructive transition-all">
                      <Trash2 className="h-3 w-3" /> <span className="hidden md:inline">Clean Stage</span>
                    </Button>
                    <div className="w-[1px] h-4 bg-white/5" />
                    <Button
                      onClick={() => setShowGrid(!showGrid)}
                      disabled={!image}
                      variant="outline"
                      size="sm"
                      className={`h-8 px-2 md:px-4 rounded-xl font-black text-[8px] uppercase gap-2 transition-all tracking-wider ${showGrid ? "bg-primary text-white border-primary shadow-glow" : "border-primary/10 bg-primary/5 hover:bg-primary/20"}`}
                    >
                      <Grid3X3 className="h-3 w-3" /> <span className="hidden md:inline">Grid {showGrid ? "ON" : "OFF"}</span>
                    </Button>
                    <div className="w-[1px] h-4 bg-white/5" />
                    <Button
                      onClick={() => {
                        const viewportW = containerRef.current?.clientWidth || 800;
                        const viewportH = containerRef.current?.clientHeight || 800;
                        const newScale = Math.min((viewportW - 80) / imgSize.w, (viewportH - 80) / imgSize.h, 100);
                        setScale(newScale);
                        setPan({ x: (viewportW - (imgSize.w * newScale)) / 2, y: (viewportH - (imgSize.h * newScale)) / 2 });
                        setZoom(1);
                      }}
                      disabled={!image}
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 md:px-4 rounded-xl font-black text-[8px] uppercase gap-2 border-primary/10 bg-primary/5 backdrop-blur-md hover:bg-primary/20 transition-all tracking-wider"
                    >
                      <RotateCcw className="h-3 w-3" /> <span className="hidden md:inline">Reset Viewport</span>
                    </Button>
                  </div>
                </div>
                <Card
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onContextMenu={(e) => e.preventDefault()}
                  ref={containerRef}
                  className="glass-morphism border-primary/10 overflow-hidden h-[calc(75vh-80px)] min-h-[500px] flex flex-col items-center justify-center relative bg-card rounded-2xl select-none shadow-2xl group/canvas p-0"
                  style={{
                    backgroundImage: `linear-gradient(45deg, var(--checker-color) 25%, transparent 25%), 
                                     linear-gradient(-45deg, var(--checker-color) 25%, transparent 25%), 
                                     linear-gradient(45deg, transparent 75%, var(--checker-color) 75%), 
                                     linear-gradient(-45deg, transparent 75%, var(--checker-color) 75%)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    ["--checker-color" as any]: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"
                  }}
                >
                  {!image ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => inputRef.current?.click()}
                      className="absolute inset-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer bg-primary/5 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.02] shadow-inner duration-300 group/upload"
                    >
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                          <CloudUpload className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-1 px-10">
                          <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Artifact Master</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag master or click</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20 pt-10">PNG, JPG, SVG, WEBP ARE SUPPORTED</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="absolute shadow-2xl ring-1 ring-primary/20 pointer-events-none origin-top-left flex items-start justify-start top-0 left-0"
                        style={{
                          width: imgSize.w,
                          height: imgSize.h,
                          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale * zoom})`,
                          opacity: imgSize.w > 0 ? 1 : 0,
                          willChange: "transform",
                          imageRendering: "pixelated"
                        }}
                      >
                        <img
                          key={image}
                          ref={imgRef}
                          src={image}
                          onLoad={onImageLoad}
                          className="w-full h-full pointer-events-none select-none"
                          style={{
                            imageRendering: "pixelated",
                            // @ts-ignore
                            msInterpolationMode: "nearest-neighbor",
                            maxWidth: '100%',
                            maxHeight: '100%',
                            willChange: "transform"
                          }}
                          draggable={false}
                        />
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                          viewBox={`0 0 ${imgSize.w || 1} ${imgSize.h || 1}`}
                          style={{ imageRendering: 'pixelated' }}
                        >
                          {showGrid && (zoom * scale) > 4 && (
                            <defs>
                              <pattern id="pixel-grid-sprite" width="1" height="1" patternUnits="userSpaceOnUse">
                                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.1" />
                              </pattern>
                            </defs>
                          )}
                          {showGrid && (zoom * scale) > 4 && (
                            <rect width="100%" height="100%" fill="url(#pixel-grid-sprite)" />
                          )}
                          {slices.map((slice) => {
                            const nx = slice.w < 0 ? slice.x + slice.w : slice.x;
                            const ny = slice.h < 0 ? slice.y + slice.h : slice.y;
                            const nw = Math.abs(slice.w);
                            const nh = Math.abs(slice.h);
                            return (
                              <g key={slice.id} className="drop-shadow-lg">
                                  <rect
                                    x={nx} y={ny} width={nw} height={nh}
                                    fill={activeId === slice.id ? "hsl(var(--primary) / 0.4)" : "hsl(var(--primary) / 0.15)"}
                                    stroke={activeId === slice.id ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.6)"}
                                    strokeWidth={1.2 / (scale * zoom)}
                                    strokeDasharray={activeId === slice.id ? "none" : `${4 / (scale * zoom)} ${3 / (scale * zoom)}`}
                                  />
                                  <text
                                    x={nx + 2 / zoom} y={ny - 4 / zoom}
                                    fontSize={Math.max(6, 10 / zoom)}
                                    fill={activeId === slice.id ? "hsl(var(--primary))" : "white"}
                                  className="font-mono font-black tracking-tighter select-none drop-shadow-md"
                                >
                                  {slice.name}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      {/* Minimal HUD Layer */}
                      <div className="absolute bottom-6 right-6 pointer-events-none">
                        <div className="px-5 py-2 rounded-2xl bg-background/40 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic group-hover:opacity-100 opacity-0 transition-opacity">
                          Drafting Engine v1.2 • Super-Resolution Partitioning
                        </div>
                      </div>
                    </>
                  )}
                </Card>
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
              </div>

              <aside className="lg:sticky lg:top-28 h-[65vh] min-h-[400px]">
                {/* Card 1: Master Studio Controls */}
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl bg-card border-x border-t border-white/5 h-full flex flex-col">
                  {/* Drafting Section (Top - Scrollable) */}
                  <div className="flex flex-col grow min-h-0">
                    <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                      </div>
                    </div>

                    <div className="p-5 pb-5 overflow-y-auto custom-scrollbar grow">
                      <div className="flex bg-primary/5 backdrop-blur-md p-2 rounded-xl border border-primary/10 gap-2 shadow-inner mb-4">
                        <button onClick={() => setMode("manual")} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${mode === "manual" ? "bg-primary text-white shadow-xl" : "text-muted-foreground hover:bg-primary/10"}`}>Manual</button>
                        <button onClick={() => setMode("grid")} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${mode === "grid" ? "bg-primary text-white shadow-xl" : "text-muted-foreground hover:bg-primary/10"}`}>Grid</button>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center px-1">
                            <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic">Zoom</Label>
                            <span className="text-sm font-black text-primary italic tracking-tighter">{Math.round(zoom * 100)}%</span>
                          </div>
                          <input type="range" min="0.01" max="100" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1 bg-primary/20 rounded-2xl appearance-none cursor-pointer accent-primary shadow-inner" />
                        </div>

                        {mode === "grid" && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex bg-primary/5 backdrop-blur-md p-1.5 rounded-xl border border-primary/10 shadow-inner mb-2">
                              <button onClick={() => setGridMode("count")} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${gridMode === "count" ? "bg-primary text-white shadow-md font-bold" : "text-muted-foreground hover:text-primary"}`}>Fixed</button>
                              <button onClick={() => setGridMode("pixel")} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${gridMode === "pixel" ? "bg-primary text-white shadow-md font-bold" : "text-muted-foreground hover:text-primary"}`}>Pixel</button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic">{gridMode === 'count' ? 'Rows' : 'Width'}</Label>
                                <Input type="number" value={gridMode === 'count' ? gridConfig.rows : gridConfig.cellW} onChange={(e) => setGridConfig({ ...gridConfig, [gridMode === 'count' ? 'rows' : 'cellW']: parseInt(e.target.value) || 1 })} className="h-7 text-[10px] font-black rounded-2xl bg-background/40 border-white/10" />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic">{gridMode === 'count' ? 'Cols' : 'Height'}</Label>
                                <Input type="number" value={gridMode === 'count' ? gridConfig.cols : gridConfig.cellH} onChange={(e) => setGridConfig({ ...gridConfig, [gridMode === 'count' ? 'cols' : 'cellH']: parseInt(e.target.value) || 1 })} className="h-7 text-[10px] font-black rounded-2xl bg-background/40 border-white/10" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic">Gap X</Label>
                                <Input type="number" value={gridConfig.gapX} onChange={(e) => setGridConfig({ ...gridConfig, gapX: parseInt(e.target.value) || 0 })} className="h-7 text-[10px] font-black rounded-2xl bg-background/40 border-white/10" />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic">Gap Y</Label>
                                <Input type="number" value={gridConfig.gapY} onChange={(e) => setGridConfig({ ...gridConfig, gapY: parseInt(e.target.value) || 0 })} className="h-7 text-[10px] font-black rounded-2xl bg-background/40 border-white/10" />
                              </div>
                            </div>

                            <Button variant="secondary" className="w-full h-10 rounded-xl font-black gap-2 text-[10px] uppercase shadow-xl shadow-black/20 italic border border-white/10 hover:translate-y-[-1px] transition-all bg-card hover:bg-accent hover:text-primary" onClick={() => generateGrid(gridConfig.rows, gridConfig.cols, gridConfig.gapX, gridConfig.gapY, gridConfig.cellW, gridConfig.cellH, gridMode)}>
                              <Grid3X3 className="h-3 w-3" /> Apply Grid Schema
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Export Section (Bottom - Pinned) */}
                  <div className="bg-card p-5 border-t border-primary/10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 bg-primary/20 rounded-xl flex items-center justify-center shadow-inner">
                        <FolderArchive className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-black tracking-tighter uppercase italic text-foreground leading-none">Export Master</h3>
                        <p className="text-[7px] font-black uppercase tracking-[0.2em] text-primary/60 mt-1 italic">Batch Dispatch</p>
                      </div>
                    </div>
                    <Button onClick={downloadZip} disabled={!image || slices.length === 0 || processing} className="w-full gap-2.5 h-11 text-sm font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic border border-primary/10">
                      {processing ? "Baking..." : <><Download className="h-4 w-4" /> Download Assets</>}
                    </Button>
                  </div>
                </Card>
              </aside>

              {/* Column 3: Partition Stack Section */}
              <aside className="lg:sticky lg:top-28 h-[65vh] min-h-[400px] flex flex-col">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl relative bg-card h-full flex flex-col">
                  <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3 w-3 text-primary" />
                      <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Partition Stack</h3>
                    </div>
                    {slices.length > 0 && (
                      <Button onClick={() => setSlices([])} variant="ghost" size="sm" className="h-6 px-2.5 text-[7px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-2xl transition-all">Purge</Button>
                    )}
                  </div>
                  <CardContent className="p-0 overflow-y-auto grow custom-scrollbar">
                    {slices.length === 0 ? (
                      <div className="p-8 text-center opacity-10 flex flex-col items-center">
                        <Layers className="h-8 w-8 mb-3" />
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] italic">Pipeline Empty</p>
                      </div>
                    ) : (
                      <Reorder.Group axis="y" values={slices} onReorder={setSlices} className="divide-y divide-white/5">
                        {slices.map((slice, idx) => (
                          <Reorder.Item
                            key={slice.id}
                            value={slice}
                            layout
                            dragElastic={0}
                            dragTransition={{ power: 0 }}
                            className="bg-transparent border-none p-0 overflow-visible"
                          >
                            <SliceItem
                              slice={slice}
                              idx={idx}
                              active={activeId === slice.id}
                              onClick={() => setActiveId(slice.id)}
                              onDelete={() => deleteSlice(slice.id)}
                            />
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}
                  </CardContent>
                </Card>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <div className="max-w-[1240px] w-full mt-10">
              <ToolExpertSection
                title="Professional Sprite Partitioning Studio"
                description="The Sprite Studio is a high-precision asset management engine designed for game developers and UI designers to slice large texture atlases and sprite sheets into individual, optimized PNG artifacts."
                transparency="Our studio utilizes the browser's native Canvas API 2D context to perform pixel-perfect extraction. The 'Grid Schema' and 'Manual Drafting' engines run entirely within your local V8 environment—ensuring that your proprietary game assets and character designs are never uploaded to a remote server. All processing, including ZIP compression via JSZip, is handled client-side."
                limitations="The visualizer is optimized for high-performance 'Nearest Neighbor' rendering (Pixelated), making it ideal for pixel art. However, extremely large textures (8192px+) may hit browser-specific canvas memory limits. For massive atlases, we recommend slicing in smaller logical chunks."
                accent="orange"
              />
            </div>
          </div>
        </main>

      </div>
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default SpriteStudio;
