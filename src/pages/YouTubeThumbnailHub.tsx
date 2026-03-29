import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, Eye, Play, Clock, Layout, Monitor, Smartphone, Check, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";

const YouTubeThumbnailHub = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [image, setImage] = useState<string | null>(null);
  const [showDuration, setShowDuration] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const stageRef = useRef<HTMLDivElement>(null);
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
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const downloadScreenshot = async () => {
    if (!image || !stageRef.current || !canvasRef.current) return;
    setProcessing(true);

    const stage = stageRef.current;
    const rect = stage.getBoundingClientRect();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = rect.width;
    canvas.height = rect.height;

    const svgMarkup = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            width: ${rect.width}px;
            height: ${rect.height}px;
            position: relative;
            background: #000;
            overflow: hidden;
          ">
            <img src="${image}" style="width: 100%; height: 100%; object-fit: cover;" />
            ${showDuration ? `
              <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.8); color: white; padding: 2px 4px; border-radius: 4px; font-family: sans-serif; font-size: 12px; font-weight: bold;">
                10:00
              </div>
            ` : ""}
            ${showProgress ? `
              <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: rgba(0,0,0,0.5);">
                <div style="width: 35%; height: 100%; background: #f00;"></div>
              </div>
            ` : ""}
            ${showPlayIcon ? `
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.6); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <div style="width: 0; height: 0; border-top: 15px solid transparent; border-bottom: 15px solid transparent; border-left: 25px solid white; margin-left: 8px;"></div>
              </div>
            ` : ""}
          </div>
        </foreignObject>
      </svg>
    `.replace(/\s+/g, " ").trim();

    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";
    tempImg.src = svgUrl;

    tempImg.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempImg, 0, 0);
      const link = document.createElement("a");
      link.download = `youtube-mockup-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setProcessing(false);
    };
  };

  const MockThumbnail = ({ isYours = false }: { isYours?: boolean }) => (
    <div className="flex flex-col gap-3 group cursor-pointer">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/20 border border-white/5 shadow-sm group-hover:shadow-lg transition-all">
        {isYours && image ? (
          <img src={image} className="w-full h-full object-cover" alt="Preview" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center p-8 opacity-40">
             <div className="w-full h-full border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center">
                <Layout className="h-8 w-8 text-white/20" />
             </div>
          </div>
        )}
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
           {isYours ? "10:00" : "8:24"}
        </div>
      </div>
      <div className="flex gap-3">
        <div className={`h-9 w-9 shrink-0 rounded-full ${isYours ? 'bg-primary' : 'bg-muted/40'} flex items-center justify-center text-[10px] font-black`}>
           {isYours ? "YOU" : "CH"}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <h4 className={`text-sm font-bold truncate ${isYours ? 'text-primary' : 'text-foreground'}`}>
            {isYours ? "MY VIRAL THUMBNAIL (Simulation Mode)" : "Trending Video Title goes here typically"}
          </h4>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter opacity-60">
             {isYours ? "Local Preview" : "Famous Creator"} • 1.2M views • 2 hours ago
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <main className="container mx-auto max-w-[1400px] px-6 py-12">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Link to="/">
                <Button variant="ghost" size="sm" className="mb-4 gap-2 transition-all hover:bg-muted border border-border/50">
                  <ArrowLeft className="h-4 w-4" /> Exit to Workspace
                </Button>
              </Link>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic">
                YouTube <span className="text-primary italic">Verify</span>
              </h1>
              <p className="text-muted-foreground mt-2 font-medium opacity-60 uppercase tracking-widest text-[10px]">Pixel-Perfect YouTube UI Simulation Engine</p>
            </div>
            
            <Tabs defaultValue="safezone" className="w-full md:w-auto">
               <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/20 border p-1 rounded-xl">
                 <TabsTrigger value="safezone" className="rounded-lg font-bold text-xs uppercase tracking-widest gap-2">
                    <Monitor className="h-3 w-3" /> Safe Zones
                 </TabsTrigger>
                 <TabsTrigger value="pagemock" className="rounded-lg font-bold text-xs uppercase tracking-widest gap-2">
                    <Youtube className="h-3 w-3" /> Page Simulation
                 </TabsTrigger>
               </TabsList>
            </Tabs>
          </div>

          <Tabs defaultValue="safezone">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
              <div className="space-y-8">
                <TabsContent value="safezone" className="mt-0">
                  <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[600px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner">
                    <div className="absolute top-6 left-6 z-10 flex gap-2 pointer-events-none">
                       <span className="text-[10px] font-black bg-primary text-primary-foreground px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-xl">High-Precision Overlay</span>
                       {image && <span className="text-[10px] font-black bg-background/80 backdrop-blur-md text-foreground px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-sm border border-border/50">16:9 Standard</span>}
                    </div>

                    {image ? (
                      <div 
                        ref={stageRef}
                        className="relative aspect-video w-[90%] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden group select-none"
                      >
                        <img src={image} className="w-full h-full object-cover" alt="Hub Preview" />
                        
                        {/* 2024 YouTube Precise Overlays */}
                        {showDuration && (
                          <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[11px] font-black px-1.5 py-0.5 rounded-sm select-none border border-white/5">
                            12:45
                          </div>
                        )}
                        
                        {showProgress && (
                          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/20">
                            <div className="h-full bg-red-600 w-[60%]" />
                          </div>
                        )}
                        
                        {showPlayIcon && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md p-6 rounded-full border border-white/20 shadow-2xl scale-125">
                            <Play className="h-8 w-8 text-white fill-white" />
                          </div>
                        )}

                        {showQueue && (
                           <div className="absolute top-3 right-3 flex flex-col gap-2">
                             <div className="bg-black/90 p-2 rounded-md shadow-lg border border-white/5"><Clock className="h-4 w-4 text-white" /></div>
                             <div className="bg-black/90 p-2 rounded-md shadow-lg border border-white/5"><Layout className="h-4 w-4 text-white" /></div>
                           </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        onClick={() => inputRef.current?.click()}
                        className="cursor-pointer group flex flex-col items-center justify-center p-20 w-[90%] border-2 border-dashed border-primary/20 rounded-[1.5rem] bg-background/50 hover:bg-primary/5 transition-all shadow-inner"
                      >
                        <Upload className="h-16 w-16 text-primary/40 mb-6 group-hover:scale-110 transition-transform" />
                        <p className="text-xl font-black uppercase tracking-tighter">Bake New Preview</p>
                        <p className="text-muted-foreground text-[10px] mt-2 font-black uppercase tracking-widest opacity-40">Drop 1280x720 PNG/JPG here</p>
                      </div>
                    )}
                    <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                    <canvas ref={canvasRef} className="hidden" />
                  </Card>
                </TabsContent>

                <TabsContent value="pagemock" className="mt-0">
                   <Card className="glass-morphism border-primary/10 p-10 min-h-[600px] bg-background/50 rounded-2xl shadow-inner overflow-hidden">
                      <div className="flex items-center gap-6 mb-12 border-b border-border/50 pb-6">
                         <div className="h-10 w-32 bg-muted/40 rounded-lg flex items-center justify-center px-4">
                            <div className="h-4 w-full bg-primary/20 rounded-full" />
                         </div>
                         <div className="flex-1 h-10 bg-muted/20 rounded-full border border-border/50" />
                         <div className="h-10 w-10 bg-muted/40 rounded-full" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                         <MockThumbnail isYours={true} />
                         <MockThumbnail />
                         <MockThumbnail />
                         <MockThumbnail />
                         <MockThumbnail />
                         <MockThumbnail />
                         <MockThumbnail />
                         <MockThumbnail />
                      </div>
                   </Card>
                </TabsContent>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-muted/30 p-8 rounded-xl border border-border/50 studio-gradient">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-primary">
                         <Eye className="h-4 w-4" /> Visibility Pulse
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed italic font-medium opacity-80">
                        Modern YouTube UI spans approx **15%** of the bottom-right and **10%** of the top-right. Keep your focal subjects in the "Golden Triangle" (Top-Left 40% area).
                      </p>
                   </div>
                   <div className="bg-primary/5 p-8 rounded-xl border border-primary/10">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-primary">Logic Hub</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed italic font-medium opacity-80">
                        Check your thumbnail on both "Safe Zones" and "Page Simulation". If your text is unreadable in the grid, it won't get clicked.
                      </p>
                   </div>
                </div>
              </div>

              <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-6 bg-primary/5 border-b border-primary/10">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Simulation Parameters</h3>
                  </div>
                  <CardContent className="p-8 space-y-8">
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black uppercase tracking-widest">Duration Overlay</span>
                        <p className="text-[9px] text-muted-foreground uppercase font-medium">Bottom Right Anchor</p>
                      </div>
                      <Switch checked={showDuration} onCheckedChange={setShowDuration} disabled={!image} />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black uppercase tracking-widest">Progress Logic</span>
                        <p className="text-[9px] text-muted-foreground uppercase font-medium">Bottom Red Line</p>
                      </div>
                      <Switch checked={showProgress} onCheckedChange={setShowProgress} disabled={!image} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black uppercase tracking-widest">Pause Overlay</span>
                        <p className="text-[9px] text-muted-foreground uppercase font-medium">Centered Icon</p>
                      </div>
                      <Switch checked={showPlayIcon} onCheckedChange={setShowPlayIcon} disabled={!image} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black uppercase tracking-widest">Queue System</span>
                        <p className="text-[9px] text-muted-foreground uppercase font-medium">Top Right Hover</p>
                      </div>
                      <Switch checked={showQueue} onCheckedChange={setShowQueue} disabled={!image} />
                    </div>

                    <div className="pt-6">
                      <Button 
                        onClick={downloadScreenshot} 
                        disabled={!image || processing} 
                        className="w-full gap-3 h-16 font-black text-lg shadow-2xl shadow-primary/20 rounded-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Download className="h-6 w-6" />
                        {processing ? "Baking Render..." : "Export Clean Hub"}
                      </Button>
                      <p className="text-[9px] text-center mt-4 text-muted-foreground font-black uppercase tracking-widest opacity-40">Direct-to-Disk 16:9 4K Simulation</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                   <div className="flex justify-center p-4">
                      <AdPlaceholder format="rectangle" className="opacity-40 grayscale group-hover:grayscale-0 transition-all" />
                   </div>
                   <div className="p-6 rounded-xl border border-dashed border-primary/20 text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter italic">Pro Tip: Hover the mockup to see interaction safe-zones in real-time.</p>
                   </div>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default YouTubeThumbnailHub;
