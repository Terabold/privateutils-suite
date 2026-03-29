import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, RotateCcw, Box, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";

const PerspectiveTilter = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [image, setImage] = useState<string | null>(null);
  const [rotateY, setRotateY] = useState(-15);
  const [rotateX, setRotateX] = useState(20);
  const [perspective, setPerspective] = useState(1000);
  const [scale, setScale] = useState(1);
  const [percentX, setPercentX] = useState(50); // Midpoint
  const [percentY, setPercentY] = useState(50); // Midpoint
  const [canvasPadding, setCanvasPadding] = useState(20);
  const [rounding, setRounding] = useState(12);
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [stageColor, setStageColor] = useState("#00000000"); // Default transparent
  const [shadowIntensity, setShadowIntensity] = useState(0.4);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleMouseDown = () => {
    if (!image) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPercentX(Math.max(0, Math.min(x, 100)));
    setPercentY(Math.max(0, Math.min(y, 100)));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
       setImage(e.target?.result as string);
       reset();
    };
    reader.readAsDataURL(f);
  };

  const reset = () => {
    setRotateY(0);
    setRotateX(0);
    setPerspective(1000);
    setScale(1);
    setPercentX(50);
    setPercentY(50);
    setBorderWidth(2);
    setRounding(12);
    setCanvasPadding(20);
    setShadowIntensity(0.4);
  };

  // High-Fidelity Professional Rendering Engine (1:1 WYSIWYG)
  const download = async () => {
    if (!image || !stageRef.current || !canvasRef.current) return;
    setProcessing(true);

    const img = new Image();
    img.src = image;
    
    img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        
        // Use a resolution-independent export buffer
        const exportWidth = Math.max(2500, w * (1 + canvasPadding / 50));
        const exportHeight = Math.max(2500, h * (1 + canvasPadding / 50));
        
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = exportWidth;
        canvas.height = exportHeight;

        // Perfect Mirror of the DOM Layout
        const svgMarkup = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${exportWidth}" height="${exportHeight}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                perspective: ${perspective}px;
                background: ${stageColor};
              ">
                <div style="
                  position: absolute;
                  left: ${percentX}%;
                  top: ${percentY}%;
                  transform: translate(-50%, -50%);
                ">
                  <img src="${image}" style="
                    width: ${w * scale}px;
                    height: auto;
                    transform: rotateY(${rotateY}deg) rotateX(${rotateX}deg);
                    border-radius: ${rounding}px;
                    border: ${borderWidth}px solid ${borderColor};
                    box-shadow: 0 ${40 * shadowIntensity}px ${100 * shadowIntensity}px rgba(0,0,0,${shadowIntensity});
                    box-sizing: border-box;
                  " />
                </div>
              </div>
            </foreignObject>
          </svg>
        `.trim();

        const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.src = svgUrl;

        tempImg.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tempImg, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `localtools-3d-render-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          setProcessing(false);
          toast.success("Artifact Dispatched Successfully");
        };
    };
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <main className="container mx-auto max-w-[1400px] px-6 py-12">
        <div className="flex flex-col gap-10">
          <header className="flex items-center justify-between flex-wrap gap-8">
            <div className="flex items-center gap-6">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 group/back transition-all">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic">
                  3D <span className="text-primary italic">Tilt</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Local Perspective Drafting Suite</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               {image && (
                 <Button onClick={reset} variant="ghost" size="sm" className="gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary/5 hover:text-primary border border-border/50 rounded-2xl transition-all">
                    <RotateCcw className="h-3.5 w-3.5" /> Flatten Tilt
                 </Button>
               )}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            <div className="space-y-8">
              <Card 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="glass-morphism border-primary/5 overflow-hidden min-h-[700px] flex items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner select-none cursor-grab active:cursor-grabbing transition-all hover:bg-muted/10"
              >
                <div className="absolute top-6 left-6 z-10 flex gap-2 pointer-events-none">
                   <span className="text-[10px] font-black bg-primary text-primary-foreground px-3 py-1.5 rounded-2xl uppercase tracking-[0.2em] shadow-xl">Live Render</span>
                   {image && <span className="text-[10px] font-black bg-background/80 backdrop-blur-md text-foreground px-3 py-1.5 rounded-2xl uppercase tracking-[0.2em] shadow-sm border border-border/50">WYSIWYG Mode</span>}
                </div>
                
                {image ? (
                  <div 
                    ref={stageRef}
                    className="w-full h-full flex items-center justify-center p-12 transition-[perspective] duration-500 overflow-hidden relative"
                    style={{ perspective: `${perspective}px` }}
                  >
                    <div 
                      className="absolute transition-transform duration-75 ease-out"
                      style={{
                        left: `${percentX}%`,
                        top: `${percentY}%`,
                        transform: `translate(-50%, -50%)`,
                      }}
                    >
                      <img 
                        draggable={false}
                        src={image} 
                        alt="3D Perspective" 
                        className="max-w-[70vw] max-h-[60vh] object-contain shadow-2xl transition-all"
                        style={{
                          transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
                          borderRadius: `${rounding}px`,
                          border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
                          boxShadow: `0 ${40 * shadowIntensity}px ${100 * shadowIntensity}px rgba(0,0,0,${shadowIntensity})`,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => inputRef.current?.click()}
                    className="cursor-pointer group flex flex-col items-center justify-center p-20 w-[90%] border-2 border-dashed border-primary/20 rounded-2xl bg-background/50 hover:bg-primary/5 transition-all shadow-inner"
                  >
                    <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                       <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-xl font-black uppercase tracking-tighter">Upload for 3D Projection</p>
                    <p className="text-[10px] mt-2 font-black uppercase tracking-widest opacity-40">Local browser processing enabled</p>
                  </div>
                )}
                <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                <canvas ref={canvasRef} className="hidden" />
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/40 p-10 rounded-2xl border border-border/50 studio-gradient">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-primary">
                      <Box className="h-4 w-4" /> Drafting Logic
                   </h4>
                   <p className="text-[11px] text-muted-foreground leading-relaxed italic font-medium opacity-80">
                     Our <strong className="font-bold">1:1 Export Engine</strong> uses high-DPI canvas serialization to ensure that your tilts, scale, and positioning match the preview perfectly.
                   </p>
                </div>
                <div className="bg-primary/5 p-10 rounded-2xl border border-primary/10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-primary">Quick Control</h4>
                   <p className="text-[11px] text-muted-foreground leading-relaxed italic font-medium opacity-80 flex items-center gap-2">
                     <MousePointer2 className="h-3 w-3" /> <strong className="font-bold">Click and Drag</strong> on the canvas above to manually reposition your render in 3D space.
                   </p>
                </div>
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-primary/5 p-5 border-b border-primary/10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Camera Parameters</h3>
                </div>
                <CardContent className="p-8 space-y-10">
                  <div className="space-y-5">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Pitch (X)</label>
                        <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{rotateX}°</span>
                     </div>
                     <Slider value={[rotateX]} min={-45} max={45} step={1} onValueChange={([v]) => setRotateX(v)} disabled={!image} />
                  </div>

                  <div className="space-y-5">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Yaw (Y)</label>
                        <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{rotateY}°</span>
                     </div>
                     <Slider value={[rotateY]} min={-60} max={60} step={1} onValueChange={([v]) => setRotateY(v)} disabled={!image} />
                  </div>

                  <div className="space-y-5">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Zoom</label>
                        <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{scale.toFixed(1)}x</span>
                     </div>
                      <Slider 
                        defaultValue={[1]}
                        value={[scale]} 
                        min={0.1} 
                        max={5} 
                        step={0.01} 
                        onValueChange={([v]) => setScale(v)} 
                        disabled={!image} 
                      />
                  </div>

                  <div className="space-y-5">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Stage Expansion</label>
                        <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{canvasPadding}%</span>
                     </div>
                      <Slider 
                        value={[canvasPadding]} 
                        min={0} 
                        max={100} 
                        step={1} 
                        onValueChange={([v]) => setCanvasPadding(v)} 
                        disabled={!image} 
                      />
                  </div>

                  <hr className="border-primary/5" />

                  <div className="space-y-8">
                     <div className="space-y-5">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Frame Weight</label>
                           <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{borderWidth}px</span>
                        </div>
                        <Slider value={[borderWidth]} min={0} max={400} step={1} onValueChange={([v]) => setBorderWidth(v)} disabled={!image} />
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Stage Background</label>
                        <div className="flex gap-2">
                           <Input 
                             type="color" 
                             value={stageColor === "#00000000" ? "#000000" : stageColor} 
                             onChange={(e) => setStageColor(e.target.value)} 
                             className="w-12 h-10 p-1 rounded-2xl cursor-pointer bg-background border-border/50" 
                             disabled={!image}
                           />
                           <Button 
                             disabled={!image}
                             variant="outline" 
                             onClick={() => setStageColor("#00000000")} 
                             className={`h-10 text-[10px] uppercase font-black px-4 ${stageColor === "#00000000" ? "bg-primary text-primary-foreground" : ""}`}
                           >
                             Transparent
                           </Button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Frame Tint</label>
                        <div className="flex gap-2">
                           <Input 
                             type="color" 
                             value={borderColor} 
                             onChange={(e) => setBorderColor(e.target.value)} 
                             className="w-12 h-10 p-1 rounded-2xl cursor-pointer bg-background border-border/50" 
                             disabled={!image}
                           />
                           <Input 
                             type="text" 
                             value={borderColor.toUpperCase()} 
                             onChange={(e) => setBorderColor(e.target.value)} 
                             className="font-mono text-xs uppercase bg-muted/20 border-border/50 h-10"
                             disabled={!image}
                           />
                        </div>
                     </div>

                     <div className="space-y-5">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Edge Fillet</label>
                           <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{rounding}px</span>
                        </div>
                        <Slider value={[rounding]} min={0} max={200} step={1} onValueChange={([v]) => setRounding(v)} disabled={!image} />
                     </div>

                     <div className="space-y-5">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Shadow Depth</label>
                           <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{Math.round(shadowIntensity * 100)}%</span>
                        </div>
                        <Slider value={[shadowIntensity]} min={0} max={1} step={0.01} onValueChange={([v]) => setShadowIntensity(v)} disabled={!image} />
                     </div>
                  </div>

                  <div className="pt-8">
                     <Button 
                       onClick={download} 
                       disabled={!image || processing} 
                       className="w-full gap-3 h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic"
                     >
                        <Download className="h-6 w-6" />
                        {processing ? "Simulating 3D..." : "Render Final"}
                     </Button>
                     <p className="text-[9px] text-center mt-4 text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 italic">
                        1:1 WYSIWYG Drafting Logic Active
                     </p>
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

export default PerspectiveTilter;

