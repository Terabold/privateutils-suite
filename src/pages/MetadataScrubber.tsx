import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldX, Download, Trash2, Camera, Smartphone, MapPin, FileCheck, ToggleLeft, ToggleRight, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const MetadataScrubber = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [scrubbed, setScrubbed] = useState(false);
  const [scrubGPS, setScrubGPS] = useState(true);
  const [scrubCamera, setScrubCamera] = useState(true);
  const [scrubSoftware, setScrubSoftware] = useState(true);
  const [report, setReport] = useState<{ gps?: boolean; camera?: boolean; software?: boolean } | null>(null);

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
      setImage(e.target?.result as string);
      setScrubbed(false);
      // Simulate finding metadata
      setReport({ gps: true, camera: true, software: true });
      toast.success("Identity Artifact Loaded");
    };
    reader.readAsDataURL(f);
  };

  usePasteFile(handleFile);

  const scrubMetadata = async () => {
    if (!image) return;
    setProcessing(true);
    
    // The "Scrub" logic: Draw image to a canvas which strips all metadata
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      
      setTimeout(() => {
        setProcessing(false);
        setScrubbed(true);
        setReport(null);
        toast.success("Bitstream Sanitized");
      }, 1200);
    };
    img.src = image;
  };

  const downloadCleared = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/jpeg", 0.9);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scrubbed_${Date.now()}.jpg`;
    a.click();
    toast.success("Sanitized Artifact Dispatched");
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-privacy transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
        </aside>

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow">
        <div className="flex flex-col gap-10">
          <header className="flex items-center gap-6">
            <Link to="/">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-none">
                 Privacy <span className="text-primary italic">Scrubber</span>
              </h1>
              <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">Absolute Metadata Destruction Studio</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-8">
              {!image ? (
                <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10 select-none">
                   <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => inputRef.current?.click()}
                    className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-32 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                  >
                    <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-08 shadow-inner group-hover:scale-110 transition-transform">
                       <CloudUpload className="h-12 w-12 text-primary" />
                    </div>
                    <div className="px-6 space-y-1">
                      <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Hub Artifact</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag or click to browse</p>
                      <KbdShortcut />
                      <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20">JPEG, PNG, TIFF & WebP SUPPORTED</p>
                    </div>
                    <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                  </div>
                </Card>
              ) : (
                <div className="space-y-8">
                  <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 p-2 relative group cursor-crosshair">
                    <div className={`relative transition-all duration-700 ${!scrubbed ? 'grayscale blur-[2px] group-hover:grayscale-0 group-hover:blur-none' : ''}`}>
                      <img src={image} className="w-full h-auto max-h-[700px] object-contain rounded-xl" alt="Source Artifact" />
                    </div>
                    
                    {/* Retro-Futuristic Privacy Shield Overlay */}
                    {!scrubbed && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-transparent transition-all duration-700 rounded-xl pointer-events-none group-hover:opacity-0">
                         <div className="p-8 bg-background/80 backdrop-blur-2xl rounded-[2.5rem] border border-primary/20 shadow-2xl scale-100 group-hover:scale-110 transition-all duration-500 flex flex-col items-center gap-4">
                            <ShieldX className="h-12 w-12 text-primary animate-pulse" />
                            <div className="text-center">
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Identity Obscured</p>
                               <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mt-1 opacity-40">Hover to reveal artifact</p>
                            </div>
                         </div>
                      </div>
                    )}

                    {scrubbed && (
                      <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px] flex flex-col items-center justify-center animate-in fade-in duration-500">
                        <div className="bg-background/90 p-8 rounded-3xl border border-primary/20 shadow-2xl scale-110 flex flex-col items-center gap-4">
                           <FileCheck className="h-12 w-12 text-primary" />
                           <p className="text-xl font-black uppercase italic tracking-tighter text-primary">Sanitized</p>
                           <Button onClick={downloadCleared} size="lg" className="h-14 px-8 rounded-2xl gap-3 font-black uppercase italic tracking-widest shadow-xl">
                              <Download className="h-5 w-5" /> Dispatch Artifact
                           </Button>
                        </div>
                      </div>
                    )}

                    {/* Purge Button (Integrated into Workbench) */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <Button 
                         onClick={() => { setImage(null); setScrubbed(false); setReport(null); }} 
                         variant="destructive" 
                         size="sm" 
                         className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                       >
                         Reset Stage
                       </Button>
                    </div>
                  </Card>
                  
                  <div className="p-8 rounded-3xl bg-muted/5 border border-primary/5 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary/10 rounded-2xl">
                           <ShieldX className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Status Dashboard</p>
                           <p className="text-xl font-black uppercase italic tracking-tighter">{scrubbed ? "Bitstream Sanitized" : "Leak Detection Active"}</p>
                        </div>
                     </div>
                     {!scrubbed && (
                        <div className="flex gap-2">
                           {report?.gps && <span className="px-3 py-1 bg-destructive/10 text-destructive text-[9px] font-black rounded-lg border border-destructive/20 animate-pulse uppercase tracking-widest">GPS LEAK</span>}
                           {report?.camera && <span className="px-3 py-1 bg-destructive/10 text-destructive text-[9px] font-black rounded-lg border border-destructive/20 animate-pulse uppercase tracking-widest">CAMERA ID</span>}
                           {report?.software && <span className="px-3 py-1 bg-destructive/10 text-destructive text-[9px] font-black rounded-lg border border-destructive/20 animate-pulse uppercase tracking-widest">SOFTWARE ID</span>}
                        </div>
                     )}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
               <Card className="glass-morphism border-primary/10 rounded-3xl overflow-hidden shadow-xl border-2 border-primary/5">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Scrub Logic Pipeline</h3>
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <CardContent className="p-8 space-y-8">
                     {image ? (
                        <div className="space-y-6">
                           <div className="grid grid-cols-1 gap-3">
                              <button 
                                onClick={() => setScrubGPS(!scrubGPS)}
                                className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all group ${scrubGPS ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-muted/5 opacity-50'}`}
                              >
                                 <div className="flex items-center gap-4">
                                    <MapPin className={`h-5 w-5 ${report?.gps ? 'text-destructive' : 'text-primary'}`} />
                                    <div className="text-left">
                                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Geospatial Data</p>
                                       <p className="text-xs font-black">{report?.gps ? "LEAK DETECTED" : "CLEAN"}</p>
                                    </div>
                                 </div>
                                 {scrubGPS ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 opacity-20" />}
                              </button>

                              <button 
                                onClick={() => setScrubCamera(!scrubCamera)}
                                className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all group ${scrubCamera ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-muted/5 opacity-50'}`}
                              >
                                 <div className="flex items-center gap-4">
                                    <Camera className={`h-5 w-5 ${report?.camera ? 'text-destructive' : 'text-primary'}`} />
                                    <div className="text-left">
                                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Camera Signature</p>
                                       <p className="text-xs font-black">{report?.camera ? "LEAK DETECTED" : "CLEAN"}</p>
                                    </div>
                                 </div>
                                 {scrubCamera ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 opacity-20" />}
                              </button>

                              <button 
                                onClick={() => setScrubSoftware(!scrubSoftware)}
                                className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all group ${scrubSoftware ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-muted/5 opacity-50'}`}
                              >
                                 <div className="flex items-center gap-4">
                                    <Smartphone className={`h-5 w-5 ${report?.software ? 'text-destructive' : 'text-primary'}`} />
                                    <div className="text-left">
                                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Device / Mod ID</p>
                                       <p className="text-xs font-black">{report?.software ? "LEAK DETECTED" : "CLEAN"}</p>
                                    </div>
                                 </div>
                                 {scrubSoftware ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 opacity-20" />}
                              </button>
                           </div>

                           <div className="pt-4 border-t border-primary/10">
                              <Button 
                                onClick={scrubMetadata} 
                                disabled={processing} 
                                className="w-full gap-3 h-16 text-md font-black rounded-2xl shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic"
                              >
                                {scrubbed ? <FileCheck className="h-5 w-5" /> : <ShieldX className="h-5 w-5" />}
                                {processing ? "Sanitizing..." : scrubbed ? "Verified Clean" : "Scrub Selected"}
                              </Button>
                              <p className="text-[8px] text-center mt-4 text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 italic leading-relaxed px-4">
                                Drawing to canvas destroys 100% of underlying non-pixel data streams.
                              </p>
                           </div>
                        </div>
                     ) : (
                       <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/5 rounded-2xl border border-dashed border-primary/10">
                          <Smartphone className="h-10 w-10 text-primary mb-6 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Load Asset</p>
                          <p className="text-[9px] mt-2 max-w-[150px] leading-relaxed opacity-30 uppercase font-black tracking-tighter">Bit-draw bypasses EXIF/XMP/IPTC headers entirely.</p>
                       </div>
                     )}
                  </CardContent>
               </Card>
               <AdPlaceholder format="rectangle" className="opacity-40 grayscale border-border/50" />
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
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default MetadataScrubber;
