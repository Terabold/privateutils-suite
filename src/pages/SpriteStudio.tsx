import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, Scissors, Maximize2, Move, ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, Plus, Check, RefreshCw, Layers, Sparkles, CloudUpload, Grid3X3, Trash2, Square, Settings2, FolderArchive, MousePointer2 } from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
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
    setSlices([]);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  usePasteFile((file) => handleFile(file));

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
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
      
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - (rect.left + el.clientLeft);
      const mouseY = e.clientY - (rect.top + el.clientTop);

      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.05 : 0.95; // More gradual zoom for higher precision
      
      setZoom(prev => {
        const nextZoom = Math.max(0.2, Math.min(prev * factor, 40)); // Max 4000% zoom
        
        setPan(p => {
          // Mathematical center sync:
          // new_pan = mouse - (mouse - old_pan) * (new_zoom / old_zoom)
          const dx = (mouseX - p.x) * (nextZoom / prev - 1);
          const dy = (mouseY - p.y) * (nextZoom / prev - 1);
          return { x: p.x - dx, y: p.y - dy };
        });
        
        return nextZoom;
      });
    };

    el.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", handleWheelNative);
  }, [image]); // Simplified dependency as nested setters are safe
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

  const handleWheel = (e: React.WheelEvent) => {
     // Replaced by native useEffect listener to handle preventDefault() correctly
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
    <div className="min-h-screen bg-background text-foreground theme-image transition-colors duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        {/* Left Sponsor Sidebar (Hidden below 1850px) */}
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <div className="p-8 rounded-2xl border-2 border-dashed border-primary/5 bg-primary/5 text-center mt-12 studio-gradient">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Verified Ad Space</p>
           </div>
        </aside>

        <main className="container mx-auto max-w-[1600px] px-6 py-12 grow">
          <div className="flex flex-col gap-8">
            <header className="flex items-center justify-between flex-wrap gap-6 border-b border-primary/5 pb-8">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-none">
                     Sprite <span className="text-primary italic">Studio</span>
                  </h1>
                  <p className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mt-2">Professional Pixel Partitioning Engine</p>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
              {/* Column 1: Main Stage */}
              <div className="space-y-6">
                <Card 
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onContextMenu={(e) => e.preventDefault()}
                  ref={containerRef}
                  className="glass-morphism border-primary/10 overflow-hidden min-h-[90vh] h-full flex flex-col items-center justify-center relative bg-[#050505]/40 rounded-3xl select-none shadow-2xl group/canvas p-0"
                  style={{
                    backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%), 
                                     linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%), 
                                     linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.02) 75%), 
                                     linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.02) 75%)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                >
                {!image ? (
                  <div 
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    className="absolute inset-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner group/dropzone"
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
                      className={`absolute shadow-2xl ring-1 ring-primary/20 pointer-events-none origin-top-left flex items-start justify-start top-0 left-0 ${isPanning || dragType ? "" : "transition-transform duration-200"}`}
                      style={{ 
                        width: imgSize.w, 
                        height: imgSize.h,
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale * zoom})`,
                        opacity: imgSize.w > 0 ? 1 : 0,
                        willChange: "transform"
                      }}
                    >
                      <img 
                        ref={imgRef}
                        src={image} 
                        onLoad={onImageLoad}
                        className="w-full h-full pointer-events-none select-none transition-all shadow-2xl" 
                        style={{ imageRendering: (zoom > 1.5 || imgSize.w < 500) ? 'pixelated' : 'auto' }}
                        draggable={false}
                      />
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox={`0 0 ${imgSize.w || 1} ${imgSize.h || 1}`}>
                        {zoom > 8 && (
                          <defs>
                            <pattern id="pixel-grid" width="1" height="1" patternUnits="userSpaceOnUse">
                               <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.1" />
                            </pattern>
                          </defs>
                        )}
                        {zoom > 8 && <rect width="100%" height="100%" fill="url(#pixel-grid)" opacity="0.5" />}
                        {slices.map((slice) => {
                          const nx = slice.w < 0 ? slice.x + slice.w : slice.x;
                          const ny = slice.h < 0 ? slice.y + slice.h : slice.y;
                          const nw = Math.abs(slice.w);
                          const nh = Math.abs(slice.h);
                          return (
                            <g key={slice.id} className="drop-shadow-lg">
                              <rect 
                                x={nx} y={ny} width={nw} height={nh} 
                                fill={activeId === slice.id ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.2)"} 
                                stroke={activeId === slice.id ? "#3b82f6" : "rgba(59, 130, 246, 0.8)"} 
                                strokeWidth={activeId === slice.id ? 4 / zoom : 2 / zoom} 
                                strokeDasharray={activeId === slice.id ? "none" : `${3 / zoom} ${2 / zoom}`}
                              />
                              <text 
                                x={nx + 2 / zoom} y={ny - 4 / zoom} 
                                fontSize={Math.max(6, 10 / zoom)} 
                                fill={activeId === slice.id ? "#3b82f6" : "white"} 
                                className="font-mono font-black tracking-tighter select-none drop-shadow-md"
                              >
                                {slice.name}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Stage Overlays (HUD) */}
                    <div className="absolute top-8 left-8 flex flex-col gap-3 pointer-events-none">
                       <div className="px-5 py-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary shadow-2xl flex items-center gap-3">
                          <Settings2 className="h-3.5 w-3.5" />
                          Studio Master View
                       </div>
                    </div>

                    <div className="absolute top-8 right-8 flex flex-col gap-4 items-end pointer-events-none">
                       <div className="flex items-center gap-2 p-2 px-4 rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-white/5 shadow-2xl">
                          <div className="flex flex-col text-right">
                             <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest leading-none mb-1">Canvas Resolution</span>
                             <span className="text-xs font-black italic text-foreground tracking-tighter">{imgSize.w} x {imgSize.h}px</span>
                          </div>
                          <div className="w-px h-6 bg-white/5 mx-2" />
                          <div className="flex flex-col text-right">
                             <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest leading-none mb-1">Asset Partition</span>
                             <span className="text-xs font-black italic text-primary tracking-tighter">{slices.length} STACKED</span>
                          </div>
                       </div>

                       {image && (
                          <Button 
                           onClick={(e) => { e.stopPropagation(); setImage(null); setSlices([]); setActiveId(null); }} 
                           variant="destructive" 
                           className="h-10 px-8 text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all bg-destructive/10 text-destructive border border-destructive/20 backdrop-blur-md hover:bg-destructive hover:text-white pointer-events-auto shadow-destructive/20"
                          >
                            Reset Stage
                          </Button>
                       )}
                    </div>

                    <div className="absolute bottom-8 right-8 pointer-events-auto flex items-center gap-4">
                       <Button size="sm" variant="outline" onClick={() => { 
                          const viewportW = containerRef.current?.clientWidth || 800;
                          const viewportH = containerRef.current?.clientHeight || 800;
                          const newScale = Math.min((viewportW - 80) / imgSize.w, (viewportH - 80) / imgSize.h, 40);
                          setScale(newScale);
                          setPan({ x: (viewportW - (imgSize.w * newScale)) / 2, y: (viewportH - (imgSize.h * newScale)) / 2 });
                          setZoom(1); 
                       }} className="text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-2xl gap-3 bg-black/40 backdrop-blur-md border-white/5 hover:bg-white/5 shadow-2xl">
                          <RotateCcw className="h-3.5 w-3.5" /> Reset Viewport
                       </Button>
                    </div>
                  </>
                )}
                </Card>
                <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic text-center">Drafting Engine v1.2 • Super-Resolution Studio Partitioning • No Persistence</p>
              </div>

              {/* Column 2: Unified Sidebar */}
              <aside className="space-y-6 lg:sticky lg:top-24 h-fit pb-12 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar pr-1">
                <Card className="glass-morphism border-primary/20 rounded-[2.5rem] shadow-2xl overflow-hidden bg-primary/5 studio-gradient border-b-4 border-r-4">
                  <CardContent className="p-10 space-y-8">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center shadow-inner">
                            <FolderArchive className="h-6 w-6 text-primary" />
                         </div>
                         <div className="flex-1">
                            <h3 className="text-lg font-black tracking-tighter uppercase italic text-foreground leading-none">Master Export</h3>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 mt-2 italic">Production Batch Dispatch</p>
                         </div>
                      </div>
                      <Button onClick={downloadZip} disabled={!image || slices.length === 0 || processing} className="w-full gap-4 h-16 text-xl font-black rounded-3xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic border border-primary/20">
                         {processing ? "Baking Studio ZIP..." : <><Download className="h-7 w-7" /> Download Assets</>}
                      </Button>
                  </CardContent>
                </Card>

                <Card className="glass-morphism border-primary/10 rounded-[2.5rem] shadow-xl overflow-hidden">
                  <div className="bg-primary/5 p-8 border-b border-primary/10 space-y-8">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3 italic">
                            <Settings2 className="h-4 w-4" /> Drafting Master
                         </h3>
                      </div>
                      
                      <div className="flex bg-zinc-950/40 p-2.5 rounded-3xl border border-white/5 gap-2.5 shadow-inner">
                          <button onClick={() => setMode("manual")} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${mode === "manual" ? "bg-primary text-white shadow-xl scale-[1.02]" : "text-muted-foreground hover:bg-white/5"}`}>Manual</button>
                          <button onClick={() => setMode("grid")} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${mode === "grid" ? "bg-primary text-white shadow-xl scale-[1.02]" : "text-muted-foreground hover:bg-white/5"}`}>Grid Master</button>
                       </div>

                       {mode === "grid" && (
                        <div className="flex bg-zinc-950/20 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                           <button onClick={() => setGridMode("count")} className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${gridMode === "count" ? "bg-white/10 text-white shadow-md" : "text-muted-foreground hover:text-white"}`}>Fixed Density</button>
                           <button onClick={() => setGridMode("pixel")} className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${gridMode === "pixel" ? "bg-white/10 text-white shadow-md" : "text-muted-foreground hover:text-white"}`}>Pixel Precision</button>
                        </div>
                      )}
                  </div>
                  
                  <CardContent className="p-10 space-y-10">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Viewport Zoom</Label>
                           <span className="text-xl font-black text-primary italic tracking-tighter">{Math.round(zoom * 100)}%</span>
                        </div>
                        <input type="range" min="0.2" max="25" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1.5 bg-primary/20 rounded-2xl appearance-none cursor-pointer accent-primary shadow-inner" />
                     </div>

                     {mode === "grid" && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                        {gridMode === 'count' ? (
                          <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-3">
                               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Density Rows</Label>
                               <Input type="number" value={gridConfig.rows} onChange={(e) => setGridConfig({...gridConfig, rows: parseInt(e.target.value) || 1})} className="h-12 text-sm font-black rounded-2xl bg-zinc-950/40 border-white/5" />
                            </div>
                            <div className="space-y-3">
                               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Density Cols</Label>
                               <Input type="number" value={gridConfig.cols} onChange={(e) => setGridConfig({...gridConfig, cols: parseInt(e.target.value) || 1})} className="h-12 text-sm font-black rounded-2xl bg-zinc-950/40 border-white/5" />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-3">
                               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Cell Width</Label>
                               <Input type="number" value={gridConfig.cellW} onChange={(e) => setGridConfig({...gridConfig, cellW: parseInt(e.target.value) || 1})} className="h-12 text-sm font-black rounded-2xl bg-zinc-950/40 border-white/5" />
                            </div>
                            <div className="space-y-3">
                               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Cell Height</Label>
                               <Input type="number" value={gridConfig.cellH} onChange={(e) => setGridConfig({...gridConfig, cellH: parseInt(e.target.value) || 1})} className="h-12 text-sm font-black rounded-2xl bg-zinc-950/40 border-white/5" />
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-5 pt-2">
                          <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Gap Horizontal</Label>
                             <Input type="number" value={gridConfig.gapX} onChange={(e) => setGridConfig({...gridConfig, gapX: parseInt(e.target.value) || 0})} className="h-12 text-sm font-black rounded-2xl bg-zinc-950/40 border-white/5" />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Gap Vertical</Label>
                             <Input type="number" value={gridConfig.gapY} onChange={(e) => setGridConfig({...gridConfig, gapY: parseInt(e.target.value) || 0})} className="h-12 text-sm font-black rounded-2xl bg-zinc-950/40 border-white/5" />
                          </div>
                        </div>

                         <Button 
                          variant="secondary" 
                          className="w-full h-14 rounded-3xl font-black gap-3 text-xs uppercase shadow-xl shadow-black/20 italic border border-white/5" 
                          onClick={() => generateGrid(gridConfig.rows, gridConfig.cols, gridConfig.gapX, gridConfig.gapY, gridConfig.cellW, gridConfig.cellH, gridMode)}
                         >
                          <Grid3X3 className="h-4 w-4" /> Apply Grid Schema
                         </Button>
                       </motion.div>
                     )}

                     {!image && (
                        <div className="pt-2 animate-pulse">
                            <AdPlaceholder format="rectangle" className="opacity-20 grayscale border-border/20 rounded-[2rem]" />
                        </div>
                     )}
                  </CardContent>
                </Card>

                <Card className="glass-morphism border-primary/10 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col min-h-[300px]">
                   <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                         <Layers className="h-4 w-4 text-primary" />
                         <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Partition Stack</h3>
                      </div>
                      {slices.length > 0 && (
                        <Button 
                          onClick={() => setSlices([])} 
                          variant="ghost" 
                          size="sm" 
                           className="h-8 px-4 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-2xl transition-all"
                        >
                          Purge Stack
                        </Button>
                      )}
                    </div>
                    <CardContent className="p-2 overflow-y-auto grow custom-scrollbar">
                      {slices.length === 0 ? (
                        <div className="p-12 text-center opacity-10 flex flex-col items-center">
                           <Layers className="h-12 w-12 mb-4" />
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Pipeline Empty</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-1">
                          {slices.map((slice, idx) => (
                            <div key={slice.id} onClick={() => setActiveId(slice.id)} className={`p-4 px-6 flex items-center justify-between transition-all cursor-pointer rounded-2xl ${activeId === slice.id ? "bg-primary/10 shadow-inner" : "hover:bg-primary/5"}`}>
                               <div className="flex items-center gap-4 overflow-hidden">
                                 <span className="text-[10px] font-black opacity-20 italic">#{String(idx + 1).padStart(2, '0')}</span>
                                 <span className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[120px]">{slice.name}</span>
                               </div>
                               <div className="flex items-items-center gap-2">
                                  <span className="text-[8px] font-black opacity-40 italic">{slice.w}x{slice.h}</span>
                                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteSlice(slice.id); }} className="h-8 w-8 text-destructive opacity-30 hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded-xl"><Trash2 className="h-3.5 w-3.5" /></Button>
                               </div>
                            </div>
                          ))}
                        </div>
                      )}
                   </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SpriteStudio;
