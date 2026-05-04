import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, Zap, Activity, ShieldCheck, CloudUpload, ChevronDown, AlertTriangle, Trash2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Footer from "@/components/Footer";
import ToolBottomDescription from '@/components/ToolBottomDescription';
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import ToolAdBanner from "@/components/ToolAdBanner";
import ControlHint from "@/components/ControlHint";
import { usePasteFile } from "@/hooks/usePasteFile";
import { toast } from "sonner";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const ImageCompressor = () => {
  const [darkMode, setDarkMode] = useState(() => (typeof document !== "undefined" && document.documentElement.classList.contains("dark")));
  const [file, setFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [targetFormat, setTargetFormat] = useState<string>("webp");
  const [processing, setProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [isBaking, setIsBaking] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const inputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const compressedUrlRef = useRef<string | null>(null);

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
    setZoom(1);
    setOffset({ x: 0, y: 0 });

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        setOriginalImage(img);
        const ext = f.name.split('.').pop()?.toLowerCase();
        if (ext === 'png') setTargetFormat('png');
        else if (ext === 'jpg' || ext === 'jpeg') setTargetFormat('jpg');
        else setTargetFormat('webp');
        toast.success("Image staged for compression.");
      };
    };
    reader.readAsDataURL(f);
    if (inputRef.current) inputRef.current.value = "";
  };

  const autoFit = useCallback(() => {
    const container = stageRef.current;
    if (container && originalImage) {
      const pad = 80;
      const availableW = container.clientWidth - pad;
      const availableH = container.clientHeight - pad;
      if (availableW <= 0 || availableH <= 0) return;
      const calculatedFitZoom = Math.min(availableW / originalImage.width, availableH / originalImage.height, 1);
      setZoom(calculatedFitZoom);
      setFitZoom(calculatedFitZoom);
      setOffset({ x: 0, y: 0 });
    }
  }, [originalImage]);

  useEffect(() => {
    if (originalImage) {
      const timer = setTimeout(autoFit, 100);
      window.addEventListener('resize', autoFit);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', autoFit);
      };
    }
  }, [originalImage, autoFit]);

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
    } catch (err) {
      console.error("FFmpeg Load Error:", err);
      toast.error("WASM Engine failed to initialize.");
      return false;
    }
  };

  const compressImage = useCallback(async () => {
    if (!originalImage || !file) return;
    setProcessing(true);

    const canvas = document.createElement("canvas");
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setProcessing(false); return; }
    ctx.drawImage(originalImage, 0, 0);

    const mimeMap: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png' };
    let finalBlob: Blob | null = null;

    if (targetFormat === 'png' && quality < 0.98) {
      setIsBaking(true);
      const loaded = await loadFFmpeg();
      if (loaded) {
        const ffmpeg = ffmpegRef.current;
        const inputData = await fetchFile(file);
        await ffmpeg.writeFile('input.png', inputData);
        const colors = Math.max(2, Math.round(quality * 256));
        await ffmpeg.exec(['-i', 'input.png', '-vf', `format=rgba,palettegen=max_colors=${colors}`, 'palette.png']);
        await ffmpeg.exec(['-i', 'input.png', '-i', 'palette.png', '-filter_complex', 'paletteuse', 'output.png']);
        const data = await ffmpeg.readFile('output.png');
        finalBlob = new Blob([data as any], { type: 'image/png' });
      }
      setIsBaking(false);
    } else {
      const mime = mimeMap[targetFormat] || 'image/webp';
      finalBlob = await new Promise(resolve =>
        canvas.toBlob(blob => resolve(blob), mime, targetFormat === 'png' ? undefined : quality)
      );
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
      const t = setTimeout(() => compressImage(), 50);
      return () => clearTimeout(t);
    }
  }, [quality, targetFormat, originalImage, compressImage]);

  useEffect(() => () => { if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current); }, []);

  const savings = originalSize > 0 ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100)) : 0;

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !compressedUrl) return;

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
  }, [compressedUrl]);

  const resetStage = () => {
    setFile(null);
    setOriginalImage(null);
    setCompressedUrl(null);
    setCompressedSize(0);
    setZoom(1);
    setFitZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 theme-image flex flex-col font-sans">
      

      <div className="flex justify-center items-start w-full relative">
        {/* SponsorSidebars position="left" removed */}

        <main className="container mx-auto max-w-[1240px] px-6 py-12 grow overflow-visible">
          <div className="w-full flex flex-col gap-8">

            {/* ── HEADER ── */}
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" aria-label="Back to home" className="h-12 w-12 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all group/back bg-background/50 backdrop-blur-md shadow-xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  Image <span className="text-primary italic">Compressor & Optimizer</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Professional Image Quantization • Hardware Accelerated
                </p>
              </div>
            </header>

            {/* Mobile Ad */}
            <ToolAdBanner />

            {/* ── SETTINGS CARD ── */}
            <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card border-2 border-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">

                {/* Row 1 — Quality slider + Format selector */}
                <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
                  <div className="flex items-center gap-2 md:gap-4 flex-wrap lg:flex-nowrap w-full lg:w-auto justify-center lg:justify-start">
                    {/* Quality slider label */}
                    <div className="flex items-center gap-3 shrink-0 lg:origin-left lg:mr-4">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                        <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                      </div>
                      <div className="shrink-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                          <ControlHint
                            label="Compression workbench"
                            title="Compression Workbench"
                            description="Tune the tradeoff between file size and visible image quality."
                            rows={[
                              { label: "Eco", description: "Smallest output, more visible compression." },
                              { label: "Balanced", description: "Good default for web images." },
                              { label: "Max", description: "Larger output with better visual fidelity." },
                            ]}
                          />
                        </div>
                        <p className="text-[8px] lg:text-[9px] font-black text-muted-foreground uppercase opacity-40 leading-none mt-1.5 lg:mt-2">Intensity Optimization</p>
                      </div>
                    </div>

                    {/* The slider itself */}
                    <div className="w-24 sm:w-32 md:w-48 lg:w-64 shrink-0">
                     <Slider
                        id="image-quality-slider"
                        name="image-quality-slider"
                        defaultValue={[0.7]}
                        max={1}
                        min={0.01}
                        step={0.01}
                        value={[quality]}
                        onValueChange={([val]) => setQuality(val)}
                        className="py-4 lg:py-6 cursor-pointer"
                      />
                    </div>

                    <span className="text-[10px] md:text-xs lg:text-2xl font-black text-primary italic tracking-widest font-mono shrink-0 min-w-[45px] lg:min-w-[80px] text-right">
                      {Math.round(quality * 100)}%
                    </span>

                    <div className="h-8 w-px bg-white/10 shrink-0 mx-1 hidden lg:block" />

                    {/* Format label + dropdown */}
                    <div className="flex items-center gap-3 shrink-0 lg:ml-4">
                      <div className="items-center gap-2 shrink-0 lg:flex hidden">
                        <p className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-primary italic leading-none">Format</p>
                        <ControlHint
                          label="Image format"
                          title="Image Format"
                          description="Choose the output codec."
                          rows={[
                            { label: "WebP", description: "Best default for modern web use and small files." },
                            { label: "JPG", description: "Best compatibility for photos without transparency." },
                            { label: "PNG", description: "Keeps transparency, but can stay larger." },
                          ]}
                        />
                      </div>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-9 w-24 lg:h-11 lg:w-32 shrink-0 bg-card border-white/10 rounded-xl font-black uppercase tracking-tighter text-xs lg:text-sm shadow-inner px-3 flex items-center justify-between hover:bg-muted/10 transition-colors text-foreground"
                          >
                            <span>{targetFormat.toUpperCase()}</span>
                            <ChevronDown className="h-3.5 w-3.5 lg:h-4 lg:w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-morphism border-primary/20 bg-background backdrop-blur-3xl font-sans min-w-[var(--radix-dropdown-menu-trigger-width)]">
                          {["webp", "jpg", "png"].map(fmt => (
                            <DropdownMenuItem
                              key={fmt}
                              onClick={() => setTargetFormat(fmt)}
                              className="font-black py-3 text-xs lg:text-sm uppercase tracking-widest cursor-pointer text-foreground hover:bg-primary/20"
                            >
                              {fmt.toUpperCase()}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Row 2 — Actions & Presets */}
                <div className="flex items-center gap-4 lg:gap-8 flex-wrap sm:flex-nowrap w-full lg:w-auto justify-center lg:justify-end border-t lg:border-t-0 border-white/10 pt-2 lg:pt-0 shrink-0">

                  {/* Quality presets */}
                  <div className="flex items-center gap-1 lg:gap-2 flex-nowrap justify-center min-w-0">
                    {([
                      { label: "Eco", val: 0.3, Icon: Zap },
                      { label: "Balanced", val: 0.7, Icon: Activity },
                      { label: "Max", val: 0.95, Icon: ShieldCheck },
                    ] as const).map(({ label, val, Icon }) => (
                      <Button
                        key={label}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuality(val)}
                        className={`h-7 md:h-8 lg:h-10 flex items-center gap-1 px-1.5 md:px-3 lg:px-5 rounded-xl border-white/10 transition-all text-[7px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest shrink-0
                            ${Math.abs(quality - val) < 0.05
                            ? "bg-primary border-primary shadow-lg text-white"
                            : "bg-card text-muted-foreground hover:bg-primary/20"}`}
                      >
                        <Icon className="h-3 w-3 lg:h-4 lg:w-4 text-primary shrink-0" />
                        <span className="xs:inline hidden lg:inline">{label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Delete Artifact */}
                  {file && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetStage}
                      aria-label="Delete image artifact"
                      className="h-7 md:h-8 lg:h-10 flex items-center gap-1 px-1.5 md:px-3 lg:px-5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all text-[7px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest shrink-0"
                    >
                      <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="xs:inline hidden lg:inline">Delete</span>
                    </Button>
                  )}

                  {/* PNG + low quality warning */}
                  {targetFormat === 'png' && quality < 0.98 && (
                    <div className="flex items-center gap-1.5 h-7 md:h-8 px-2 md:px-3 text-[6px] md:text-[8px] text-amber-400 font-black uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 rounded-xl shrink-0">
                      <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                      <span className="sm:inline hidden">WASM Required</span>
                    </div>
                  )}

                  {/* Push metrics + download to the right */}
                  <div className="flex-grow lg:block hidden min-w-[10px]" />

                  {compressedUrl && (
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Metrics chips */}
                      <div className="flex items-center gap-1 lg:gap-3">
                        {[
                          { label: "Source", value: `${(originalSize / 1024).toFixed(0)}K`, color: "text-foreground", bg: "bg-black/40 border-white/5" },
                          { label: "Output", value: `${(compressedSize / 1024).toFixed(0)}K`, color: "text-emerald-400", bg: "bg-black/40 border-white/5" },
                        ].map(({ label, value, color, bg }) => (
                          <div key={label} className={`flex flex-col items-center border rounded-lg lg:rounded-xl px-2 lg:px-4 py-0.5 lg:py-1.5 ${bg} shrink-0`}>
                            <p className="text-[5px] lg:text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-0.5 lg:mb-1.5">{label}</p>
                            <p className={`text-[8px] lg:text-sm font-black italic font-mono leading-none ${color}`}>{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Download */}
                      <Button
                        size="sm"
                        className="h-9 px-3 md:px-4 lg:h-12 lg:px-10 gap-1.5 lg:gap-3 text-[8px] md:text-[10px] lg:text-xs font-black uppercase tracking-widest rounded-xl bg-primary text-white border-b-2 border-primary-foreground/20 shadow-glow shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all italic shrink-0"
                        onClick={() => {
                          if (!compressedUrlRef.current) return;
                          const a = document.createElement("a");
                          a.href = compressedUrlRef.current;
                          const prefix = file?.name.replace(/\.[^.]+$/, "") || "artifact";
                          a.download = `${prefix}_optimized.${targetFormat}`;
                          a.click();
                        }}
                      >
                        <Download className="h-3.5 w-3.5 lg:h-5 lg:w-5 shrink-0" />
                        <span className="xs:inline hidden lg:inline">Dispatch</span>
                        <span className="hidden xl:inline">Artifact</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── IMAGE CANVAS (max ~540px tall) ── */}
            <Card className="glass-morphism border-primary/20 rounded-2xl bg-black/40 shadow-2xl overflow-hidden group/card animate-in fade-in slide-in-from-bottom-8 duration-700 p-3 lg:p-4 relative lg:h-[540px] flex flex-col items-center justify-center w-full max-w-full">
              <div ref={stageRef} className="relative w-full h-full bg-[#050505] rounded-xl overflow-hidden shadow-inner border border-white/5 flex items-center justify-center select-none">

                {!file ? (
                  /* ── Drop zone ── */
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => !processing && inputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-background/40 hover:bg-primary/5 transition-all duration-300 group/upload"
                  >
                    <div className="h-20 w-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-700 group-hover/upload:scale-110 shadow-inner ring-2 ring-primary/40">
                      <CloudUpload className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-3xl font-black text-white uppercase tracking-tighter italic text-shadow-glow leading-none">
                        Deploy Image Artifact
                      </p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] italic leading-none">
                        Click · Drag & Drop · Ctrl+V
                      </p>
                    </div>
                  </div>

                ) : compressedUrl ? (
                  /* ── Zoomable image stage ── */
                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-crosshair active:cursor-grabbing select-none"
                    onMouseDown={(e) => {
                      if (e.button === 0 || e.button === 2) {
                        setIsPanning(true);
                        setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
                        e.preventDefault();
                      }
                    }}
                    onMouseMove={(e) => { if (isPanning) setOffset({ x: e.clientX - startPan.x, y: e.clientY - startPan.y }); }}
                    onMouseUp={() => setIsPanning(false)}
                    onMouseLeave={() => setIsPanning(false)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <div
                      className="relative shadow-2xl ring-1 ring-white/10 pointer-events-none origin-center flex items-center justify-center"
                      style={{
                        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                        imageRendering: zoom > 2 ? 'pixelated' : 'auto',
                        transition: isPanning ? 'none' : 'transform 75ms ease-out'
                      }}
                    >
                      <img
                        src={compressedUrl}
                        alt="Compressed"
                        className="block rounded-xl border border-white/5 shadow-2xl"
                        style={{
                          width: originalImage?.width,
                          height: originalImage?.height,
                          maxWidth: 'none'
                        }}
                      />
                    </div>
                  </div>

                ) : (
                  /* ── Processing spinner ── */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 animate-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/40 shadow-2xl">
                      <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-black text-white uppercase tracking-tighter italic text-shadow-glow leading-none">Crunching Bits</p>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic animate-pulse">
                        {isBaking ? "FFmpeg WASM Engine" : "Canvas Processor"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reset View — top-left, visible on card hover when zoomed/panned */}
                {file && compressedUrl && (zoom !== fitZoom || offset.x !== 0 || offset.y !== 0) && (
                  <div className="absolute top-3 left-3 opacity-0 group-hover/card:opacity-100 transition-all duration-300 z-20">
                    <Button
                      onClick={() => { setZoom(fitZoom); setOffset({ x: 0, y: 0 }); }}
                      variant="outline"
                      size="sm"
                      aria-label="Reset fit"
                      className="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-black/70 border-primary/20 text-white shadow-xl hover:scale-105 hover:bg-black/90 transition-all backdrop-blur-sm gap-1.5"
                    >
                      <Maximize2 className="h-3 w-3" />
                      Reset Fit
                    </Button>
                  </div>
                )}

                {/* Zoom indicator — bottom-right */}
                {(zoom !== fitZoom || offset.x !== 0 || offset.y !== 0) && (
                  <div className="absolute bottom-3 right-3 z-20 bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-1.5">
                    <p className="text-[10px] font-black font-mono text-primary italic leading-none">
                      {Math.round((zoom / fitZoom) * 100)}%
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* SEO section */}
            <ToolBottomDescription toolId="/image-compressor" />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />

      <input ref={inputRef} type="file" id="image-compressor-upload-input" name="image-compressor-upload-input" className="hidden" accept="image/*" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />

      {/* Mobile Sticky Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-black/80 backdrop-blur-sm border-t border-white/10 py-2 h-[66px] overflow-x-clip">
        <AdBox adFormat="horizontal" height={50} label="320x50 ANCHOR AD" className="w-full" />
      </div>
    </div>
  );
};

export default ImageCompressor;
