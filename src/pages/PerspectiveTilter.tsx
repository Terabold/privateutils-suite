import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, CloudUpload, Eye, EyeOff, RefreshCw, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const PerspectiveTilter = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [image, setImage] = useState<string | null>(null);
  const [rotateY, setRotateY] = useState(-15);
  const [rotateX, setRotateX] = useState(20);
  const [perspective, setPerspective] = useState(1000);
  const [scale, setScale] = useState(1);
  const [percentX, setPercentX] = useState(50);
  const [percentY, setPercentY] = useState(50);

  const [renderWidth, setRenderWidth] = useState(1920);
  const [renderHeight, setRenderHeight] = useState(1080);
  const [nativeWidth, setNativeWidth] = useState(1920);
  const [nativeHeight, setNativeHeight] = useState(1080);
  const [scalingMode, setScalingMode] = useState<"contain" | "cover" | "fill">("contain");
  const [showStageFrame, setShowStageFrame] = useState(true);

  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [borderRadius, setBorderRadius] = useState(12);
  const [stageColor, setStageColor] = useState("#00000000");
  const [shadowBlur, setShadowBlur] = useState(40);
  const [shadowColor, setShadowColor] = useState("rgba(0,0,0,0.4)");
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(20);

  const [dragMode, setDragMode] = useState<"pan" | "resize-br" | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startState, setStartState] = useState({ px: 50, py: 50, w: 1920, h: 1080 });

  const [processing, setProcessing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleMouseDown = (e: React.MouseEvent, mode: "pan" | "resize-br") => {
    if (!image) return;
    e.stopPropagation();
    setDragMode(mode);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartState({ px: percentX, py: percentY, w: renderWidth, h: renderHeight });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragMode || !stageRef.current) return;
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;

    if (dragMode === "pan") {
      setPercentX(startState.px + (dx / stageRef.current.clientWidth) * 100);
      setPercentY(startState.py + (dy / stageRef.current.clientHeight) * 100);
    } else if (dragMode === "resize-br") {
      setRenderWidth(Math.max(10, Math.round(startState.w + dx * 3)));
      setRenderHeight(Math.max(10, Math.round(startState.h + dy * 3)));
    }
  };

  const handleMouseUp = () => setDragMode(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setNativeWidth(img.width);
        setNativeHeight(img.height);
        setRenderWidth(Math.round(img.width * 1.25));
        setRenderHeight(Math.round(img.height * 1.25));
        setImage(url);
        resetTilt();
      };
    };
    reader.readAsDataURL(f);
  };

  usePasteFile(handleFile);

  const resetTilt = () => {
    setRotateY(0);
    setRotateX(0);
    setPerspective(1000);
    setScale(0.7);
    setPercentX(50);
    setPercentY(50);
  };

  const download = () => {
    if (!image) return;
    setProcessing(true);

    const canvas = document.createElement("canvas");
    canvas.width = renderWidth;
    canvas.height = renderHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgMarkup = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${renderWidth}" height="${renderHeight}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            width: 100%; height: 100%; background: ${stageColor}; position: relative; overflow: hidden;
          ">
            <div style="position: absolute; left: ${percentX}%; top: ${percentY}%; width: 100%; height: 100%; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
              <div style="perspective: ${perspective}px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                <div style="
                  transform: rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale});
                  transform-style: preserve-3d;
                  display: inline-flex;
                ">
                  <img src="${image}" style="
                    ${scalingMode === "fill" ? "width: 100%; height: 100%;" : ""}
                    ${scalingMode === "contain" ? "max-width: 100%; max-height: 100%; object-fit: contain;" : ""}
                    ${scalingMode === "cover" ? "width: 100%; height: 100%; object-fit: cover;" : ""}
                    border: ${borderWidth}px ${borderStyle} ${borderColor};
                    box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor};
                    border-radius: ${borderRadius}px;
                  " />
                </div>
              </div>
            </div>
          </div>
        </foreignObject>
      </svg>
    `.replace(/\s+/g, " ").trim();

    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
    const tempImg = new Image();
    tempImg.src = svgUrl;

    tempImg.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempImg, 0, 0);
      const link = document.createElement("a");
      link.download = `localtools-3d-tilt-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      setProcessing(false);
      toast.success("3D Artifact Captured Successfully");
    };

    tempImg.onerror = () => {
      setProcessing(false);
      toast.error("Render Engine Error. Please try a smaller dimension.");
    };
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

        <main className="container mx-auto max-w-[1700px] px-6 py-12 grow">
          <div className="flex flex-col gap-10">
            <header className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                    Perspective <span className="text-primary italic">Tilter</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">3D Transformation & Depth Engine</p>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-8 items-start">
              {/* Main Stage */}
              <div className="flex flex-col gap-8">
                <Card className={`glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ${!image ? 'hover:border-primary/30 p-10' : ''}`}>
                  {!image ? (
                    <div
                      onClick={() => inputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFile(e.dataTransfer.files[0]); }}
                      className="relative w-full h-[70vh] min-h-[500px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner group"
                    >
                      <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                        <CloudUpload className="h-10 w-10 text-primary" />
                      </div>
                      <div className="px-6 space-y-1">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Drag & Drop Image</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">or click to browse</p>
                        <KbdShortcut />
                        <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20">PNG, JPG, SVG, WEBP ARE SUPPORTED</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      ref={stageRef}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center select-none bg-muted/5 rounded-2xl border-2 border-border/20 overflow-hidden transition-all shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] hover:bg-muted/10 group/stage"
                      style={{ background: stageColor }}
                    >
                      {/* Render Stage Frame */}
                      {showStageFrame && (
                        <div
                          className="absolute border-2 border-dashed border-primary/60 z-10 transition-shadow shadow-[0_0_80px_rgba(0,0,0,0.5)] cursor-move group/frame"
                          onMouseDown={(e) => handleMouseDown(e, "pan")}
                          style={{
                            width: `${(renderWidth / Math.max(renderWidth, renderHeight)) * 80}%`,
                            height: `${(renderHeight / Math.max(renderWidth, renderHeight)) * 80}%`,
                          }}
                        >
                          <div className="absolute top-2 left-2 px-3 py-1 bg-primary/90 text-[9px] font-black text-white uppercase tracking-widest rounded-md backdrop-blur-md shadow-lg pointer-events-none">
                            {renderWidth} × {renderHeight} Canvas (Drag center to pan)
                          </div>

                          {/* Resize Handle */}
                          <div
                            className="absolute -bottom-3 -right-3 w-6 h-6 bg-primary border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform flex items-center justify-center"
                            onMouseDown={(e) => handleMouseDown(e, "resize-br")}
                          >
                            <Scale className="h-3 w-3 text-white pointer-events-none" />
                          </div>
                        </div>
                      )}

                      <div
                        className="absolute w-full h-full pointer-events-none flex items-center justify-center transition-transform duration-75"
                        style={{
                          left: `${percentX}%`,
                          top: `${percentY}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="w-full h-full preserve-3d flex items-center justify-center" style={{ perspective: `${perspective}px` }}>
                          <div
                            className="preserve-3d"
                            style={{
                              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
                            }}
                          >
                            <img
                              onLoad={() => setProcessing(false)}
                              src={image}
                              alt="Tilting Artifact"
                              className="max-h-[60vh] max-w-[80%] shadow-2xl preserve-3d"
                              style={{
                                border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                                borderRadius: `${borderRadius}px`,
                                boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`,
                                width: scalingMode === "fill" ? "100%" : "auto",
                                height: scalingMode === "fill" ? "100%" : "auto",
                                objectFit: scalingMode,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                </Card>
              </div>

              {/* Settings Sidebar */}
              <aside className="space-y-8 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Capture Calibration</h3>
                    <div className="flex gap-2">
                      {image && (
                        <Button onClick={() => setShowStageFrame(!showStageFrame)} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                          {showStageFrame ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 opacity-40" />}
                        </Button>
                      )}
                      {image && (
                        <Button onClick={() => setImage(null)} variant="ghost" size="sm" className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all">
                          Reset Stage
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      {/* Dimensions */}
                      <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block">Output Resolution</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase opacity-40">Width</p>
                            <input
                              type="number" value={renderWidth}
                              onChange={(e) => setRenderWidth(Math.max(10, parseInt(e.target.value) || 0))}
                              className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-primary transition-all text-foreground"
                            />
                          </div>
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase opacity-40">Height</p>
                            <input
                              type="number" value={renderHeight}
                              onChange={(e) => setRenderHeight(Math.max(10, parseInt(e.target.value) || 0))}
                              className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-primary transition-all text-foreground"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Rotations */}
                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                          <label>Pitch (X Axis)</label>
                          <span className="text-primary">{rotateX}°</span>
                        </div>
                        <Slider min={-90} max={90} step={1} value={[rotateX]} onValueChange={([v]) => setRotateX(v)} className="py-2" />

                        <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mt-4">
                          <label>Yaw (Y Axis)</label>
                          <span className="text-primary">{rotateY}°</span>
                        </div>
                        <Slider min={-90} max={90} step={1} value={[rotateY]} onValueChange={([v]) => setRotateY(v)} className="py-2" />
                      </div>

                      {/* Zoom and Perspective */}
                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                          <label>Global Zoom</label>
                          <span className="text-primary">{scale.toFixed(2)}x</span>
                        </div>
                        <Slider min={0.1} max={3} step={0.01} value={[scale]} onValueChange={([v]) => setScale(v)} className="py-2" />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                          <label>Camera Distance</label>
                          <span className="text-primary">{perspective}px</span>
                        </div>
                        <Slider min={200} max={2000} step={1} value={[perspective]} onValueChange={([v]) => setPerspective(v)} className="py-2" />
                      </div>

                      {/* Image Scaling */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block">Image Scaling Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                          {["contain", "cover", "fill"].map((m) => (
                            <button
                              key={m}
                              onClick={() => setScalingMode(m as any)}
                              className={`py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${scalingMode === m ? "bg-primary border-primary text-white shadow-lg" : "border-border/50 hover:bg-primary/5 text-muted-foreground"}`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Boundary Formatting */}
                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                          <label>Border Radius</label>
                          <span className="text-primary">{borderRadius}px</span>
                        </div>
                        <Slider min={0} max={200} step={1} value={[borderRadius]} onValueChange={([v]) => setBorderRadius(v)} className="py-2" />
                      </div>

                      {/* Shadows */}
                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                          <label>Drop Shadow Density</label>
                          <span className="text-primary">{shadowBlur}px</span>
                        </div>
                        <Slider min={0} max={300} step={1} value={[shadowBlur]} onValueChange={([v]) => setShadowBlur(v)} className="py-2" />
                      </div>

                      {/* Custom Stage Color Picker */}
                      <div className="col-span-1 md:col-span-2 pt-4 mt-1 border-t border-border/10">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic block mb-4">Stage Canvas Color</label>
                        <div className="flex gap-4">
                          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 flex-1">
                            {["#00000000", "#18181b", "#ffffff", "#f97316", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#14b8a6"].map(c => (
                              <button
                                key={c}
                                onClick={() => setStageColor(c)}
                                title={c}
                                className={`h-10 rounded-xl border-2 transition-all hover:scale-105 ${stageColor === c ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-lg' : 'border-border/10'}`}
                                style={{ background: c === "#00000000" ? 'repeating-conic-gradient(#80808033 0% 25%, transparent 0% 50%) 50% / 10px 10px' : c }}
                              />
                            ))}
                          </div>
                          <div className="flex flex-col gap-2 w-32 justify-center pl-4 border-l border-border/10">
                            <Input
                              value={stageColor === "#00000000" ? "Transparent" : stageColor}
                              onChange={(e) => setStageColor(e.target.value)}
                              placeholder="#HEX"
                              className="text-xs font-black uppercase font-mono h-10 border-primary/20 text-center"
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="pt-6 mt-4 border-t border-border/20">
                      <Button onClick={download} disabled={!image || processing} className="w-full h-14 text-md font-black rounded-2xl gap-3 shadow-[0_0_30px_rgba(249,115,22,0.3)] italic uppercase tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all">
                        {processing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                        Extract Projection
                      </Button>
                    </div>
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

export default PerspectiveTilter;