import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, Trash2, Layers, Settings2, Palette, Maximize, Type, Image as ImageIcon, CloudUpload } from "lucide-react";
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

interface StyledImage {
  id: string;
  url: string;
  name: string;
}

const BatchImageStudio = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [images, setImages] = useState<StyledImage[]>([]);
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [shadowBlur, setShadowBlur] = useState(20);
  const [rounding, setRounding] = useState(12);
  const [targetWidth, setTargetWidth] = useState(1280);
  const [watermark, setWatermark] = useState("");
  const [processing, setProcessing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            url: e.target?.result as string,
            name: file.name.split('.')[0],
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${newFiles.length} images added to batch`);
  };

  usePasteFile((file) => handleFiles({ 0: file, length: 1, item: () => file } as any));

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const downloadImage = (img: StyledImage) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rawImg = new Image();
    rawImg.src = img.url;
    rawImg.onload = () => {
      // Calculate Resize
      const ratio = rawImg.height / rawImg.width;
      const w = targetWidth || rawImg.width;
      const h = w * ratio;

      const padding = shadowBlur * 4;
      canvas.width = w + padding;
      canvas.height = h + padding;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Shadow Styling
      ctx.shadowBlur = shadowBlur;
      ctx.shadowColor = `rgba(0,0,0,0.3)`;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      
      const r = rounding;
      const x = padding / 2;
      const y = padding / 2;
      
      // Rounded Clipping
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(rawImg, x, y, w, h);
      
      // Border logic
      if (borderWidth > 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth * 2;
        ctx.stroke();
      }

      // Watermark logic
      if (watermark) {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `bold ${w * 0.05}px Outfit, sans-serif`;
        ctx.textAlign = "right";
        ctx.fillText(watermark, x + w - 20, y + h - 20);
      }

      const link = document.createElement("a");
      link.download = `${img.name}-localtools.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  const downloadAll = async () => {
    setProcessing(true);
    toast.info("Baking batch... Please wait.");
    for (const img of images) {
      await new Promise(r => setTimeout(r, 150));
      downloadImage(img);
    }
    setProcessing(false);
    toast.success("Batch export complete!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-image transition-all duration-500">
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
                 <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic">
                    Batch <span className="text-primary italic">Studio</span>
                 </h1>
                 <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Mass Processing & Neural Optimization</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[400px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                  onClick={() => inputRef.current?.click()}
                  className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-32 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                >
                  <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                     <CloudUpload className="h-10 w-10 text-primary" />
                  </div>
                  <div className="px-6 space-y-1">
                    <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Drag & Drop</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">or click to browse</p>
                    <KbdShortcut />
                    <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20 text-center uppercase tracking-widest opacity-20">JPG, PNG, WebP • 100% Local Pipeline</p>
                  </div>
                </div>
                <input ref={inputRef} type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
              </Card>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {images.map((img) => (
                    <div key={img.id} className="group relative aspect-square bg-muted/20 rounded-2xl overflow-hidden border border-border/50">
                       <img 
                         src={img.url} 
                         alt={img.name} 
                         className="w-full h-full object-cover transition-transform group-hover:scale-105"
                         style={{ borderRadius: `${rounding}px` }}
                       />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => downloadImage(img)}>
                             <Download className="h-5 w-5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-400/20" onClick={() => removeImage(img.id)}>
                             <Trash2 className="h-5 w-5" />
                          </Button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                 <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Global Pipeline</h3>
                   {images.length > 0 && (
                     <Button 
                       onClick={() => setImages([])} 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all"
                     >
                       Reset Stage
                     </Button>
                   )}
                 </div>
                 <CardContent className="p-8 space-y-10">
                    <div className="space-y-5">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                             <Maximize className="h-3 w-3" /> Target Width
                          </label>
                          <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{targetWidth}px</span>
                       </div>
                       <Slider value={[targetWidth]} min={400} max={3840} step={20} onValueChange={([v]) => setTargetWidth(v)} />
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                          <Type className="h-3 w-3" /> Text Watermark
                       </label>
                       <Input 
                         type="text" 
                         placeholder="Enter overlay text..." 
                         value={watermark} 
                         onChange={(e) => setWatermark(e.target.value)} 
                         className="bg-muted/30 border-border/50 rounded-2xl h-10 text-xs font-bold"
                       />
                    </div>

                    <div className="pt-4 border-t border-primary/5 space-y-8">
                        <div className="space-y-5">
                           <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none">Rounding</label>
                              <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-1 rounded leading-none">{rounding}px</span>
                           </div>
                           <Slider value={[rounding]} min={0} max={40} onValueChange={([v]) => setRounding(v)} />
                        </div>

                        <div className="space-y-5">
                           <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none">Shadow</label>
                              <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-1 rounded leading-none">{shadowBlur}px</span>
                           </div>
                           <Slider value={[shadowBlur]} min={0} max={80} onValueChange={([v]) => setShadowBlur(v)} />
                        </div>
                    </div>

                    <div className="pt-6">
                       <Button 
                         onClick={downloadAll} 
                         disabled={images.length === 0 || processing} 
                         className="w-full gap-3 h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic"
                       >
                          <Download className="h-6 w-6" />
                          {processing ? "Simulating Batch..." : "Export Pack"}
                       </Button>
                       <p className="text-[9px] text-center mt-4 text-muted-foreground font-black uppercase tracking-widest opacity-40 italic">Total Client-Side Rendering</p>
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

export default BatchImageStudio;

