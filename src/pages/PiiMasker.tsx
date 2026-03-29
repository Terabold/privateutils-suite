import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, ShieldX, Download, Trash2, Undo2, Eraser, Square, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";

interface BlurRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  strength: number;
}

const PiiMasker = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [regions, setRegions] = useState<BlurRegion[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currPos, setCurrPos] = useState({ x: 0, y: 0 });
  const [blurStrength, setBlurStrength] = useState(20);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setFile(f);
        setRegions([]);
        toast.success("Identity Scrubber Initialized");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(f);
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !image) return;

    // Reset canvas to image size
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    // Filter logic per region
    regions.forEach(r => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.width, r.height);
      ctx.clip();
      ctx.filter = `blur(${r.strength}px)`;
      ctx.drawImage(image, 0, 0);
      ctx.restore();
      
      // Fine border for active region
      ctx.strokeStyle = "rgba(124, 58, 237, 0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x, r.y, r.width, r.height);
    });

    // Drawing preview
    if (isDrawing) {
      ctx.strokeStyle = "#7c3aed";
      ctx.setLineDash([5, 5]);
      const x = Math.min(startPos.x, currPos.x);
      const y = Math.min(startPos.y, currPos.y);
      const w = Math.abs(startPos.x - currPos.x);
      const h = Math.abs(startPos.y - currPos.y);
      ctx.strokeRect(x, y, w, h);
    }
  }, [image, regions, isDrawing, startPos, currPos]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

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
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);
    setCurrPos(pos);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    setCurrPos(getMousePos(e));
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const x = Math.min(startPos.x, currPos.x);
    const y = Math.min(startPos.y, currPos.y);
    const w = Math.abs(startPos.x - currPos.x);
    const h = Math.abs(startPos.y - currPos.y);

    if (w > 5 && h > 5) {
      // Dynamic blur strength: if selection is very small (<20px), reduce blur.
      let adjustedStrength = blurStrength;
      if (Math.max(w, h) < 20) {
         adjustedStrength = Math.max(2, blurStrength / 4);
      }
      setRegions([...regions, { x, y, width: w, height: h, strength: adjustedStrength }]);
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
    toast.success("Artifact Dispatched Without Metadata");
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <main className="container mx-auto max-w-[1400px] px-6 py-12">
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
                   PII <span className="text-primary italic">Scrubber</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">High-Fidelity Identity Masking Lab</p>
              </div>
            </div>
            {image && (
               <Button onClick={() => setImage(null)} variant="ghost" size="sm" className="gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-2xl transition-all">
                  Destroy Artifact
               </Button>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {!image ? (
                <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10 select-none">
                   <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => inputRef.current?.click()}
                    className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-48 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner group"
                  >
                    <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform">
                       <ShieldX className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-3xl font-black text-foreground uppercase tracking-tight italic">Drop Sensitive Media</p>
                    <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">PNG, JPG, BMP Artifacts Supported</p>
                    <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                  </div>
                </Card>
              ) : (
                <div className="space-y-8">
                  <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 p-2 relative">
                    <div className="overflow-auto max-h-[80vh] custom-scrollbar">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="mx-auto cursor-crosshair shadow-2xl max-w-full max-h-[60vh] object-contain"
                      />
                    </div>
                    
                    <div className="absolute top-6 right-6 flex gap-2">
                       <Button size="icon" variant="ghost" onClick={() => setRegions(prev => prev.slice(0, -1))} disabled={regions.length === 0} className="h-12 w-12 rounded-2xl bg-black/60 text-white backdrop-blur-md border border-white/10 hover:bg-black/80">
                          <Undo2 className="h-5 w-5" />
                       </Button>
                       <Button size="icon" variant="ghost" onClick={() => setRegions([])} disabled={regions.length === 0} className="h-12 w-12 rounded-2xl bg-destructive/60 text-white backdrop-blur-md border border-white/10 hover:bg-destructive/80">
                          <Eraser className="h-5 w-5" />
                       </Button>
                    </div>
                  </Card>

                  <div className="flex flex-col sm:flex-row gap-6">
                     <Button onClick={exportImage} className="h-20 flex-1 text-lg font-black rounded-2xl gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tight">
                        <Download className="h-6 w-6" /> Export Redacted Artifact
                     </Button>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                 <div className="bg-primary/5 p-5 border-b border-primary/10">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Masking Calibration</h3>
                 </div>
                 <CardContent className="p-8 space-y-10">
                    <div className="space-y-6">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block">Blur Matrix Intensity</label>
                       <Slider 
                         min={0}
                         max={100}
                         step={1}
                         value={[blurStrength]}
                         onValueChange={([v]) => setBlurStrength(v)}
                         className="py-4"
                       />
                       <div className="bg-muted/5 p-5 rounded-2xl border border-border/50 text-center">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">Gaussian Weight</p>
                          <p className="text-2xl font-black italic tracking-tighter text-foreground">{blurStrength}px</p>
                       </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5" /> Client-Side Redaction
                       </h4>
                       <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-80 font-medium font-sans">
                         Information is physically destroyed within the browser's sandbox. No data is ever sent to a server.
                       </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/20">
                       <div className="flex items-center gap-4 text-muted-foreground/60">
                          <Square className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Rectangle Tool Active</span>
                       </div>
                       <div className="flex items-center gap-4 text-muted-foreground/60">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Metadata Scrubbing Active</span>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <div className="px-6">
                 <AdPlaceholder format="rectangle" className="opacity-40 grayscale group-hover:grayscale-0 transition-all border-border/50" />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PiiMasker;

