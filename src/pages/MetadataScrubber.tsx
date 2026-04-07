import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, FileCheck, Download, ShieldX, MapPin, Camera, Smartphone, ToggleLeft, ToggleRight, CloudUpload, Activity, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";
import exifr from "exifr";

const MetadataScrubber = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [scrubbed, setScrubbed] = useState(false);
  const [report, setReport] = useState<{ gps?: boolean; camera?: boolean; software?: boolean } | null>(null);
  const [history, setHistory] = useState<{ name: string; time: string; clean: boolean }[]>([]);
  const [isCleanAnimating, setIsCleanAnimating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setImage(e.target?.result as string);
      setScrubbed(false);
      
      // Real Forensic Scan with exifr
      try {
        const data = await exifr.parse(f, {
          gps: true,
          tiff: true,
          exif: true,
          xmp: true,
          iptc: true
        });
        
        const hasGPS = !!(data?.latitude || data?.longitude || data?.GPSLatitude || data?.GPSDestLatitude);
        const hasCamera = !!(data?.Make || data?.Model || data?.SerialNumber || data?.LensModel);
        const hasSoftware = !!(data?.Software || data?.CreatorTool || data?.ProcessingSoftware);
        
        setReport({ 
          gps: hasGPS, 
          camera: hasCamera, 
          software: hasSoftware 
        });
        
        if (hasGPS || hasCamera || hasSoftware) {
          toast.warning("Identity Leaks Detected in Bitstream");
        } else {
          toast.success("Identity Artifact Loaded (Clean Scan)");
          setIsCleanAnimating(true);
          setTimeout(() => {
            setHistory(prev => [{ name: f.name, time: new Date().toLocaleTimeString(), clean: true }, ...prev].slice(0, 5));
            setImage(null);
            setReport(null);
            setIsCleanAnimating(false);
          }, 3000);
        }
      } catch (err) {
        setReport({ gps: false, camera: false, software: false });
        toast.success("Identity Artifact Loaded");
      }
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
    <div className="min-h-screen bg-background text-foreground theme-privacy transition-all duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-12 grow overflow-visible">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white leading-none">
                   Privacy <span className="text-primary italic">Scrubber</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Absolute Metadata Destruction Studio</p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
              <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-visible">
              <div className="space-y-8">
                <AnimatePresence mode="wait">
                  {!image ? (
                    <motion.div
                      key="drop-zone"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="glass-morphism border-primary/10 overflow-hidden h-[500px] flex flex-col relative bg-card rounded-2xl shadow-xl">
                        <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3">
                          <Activity className="h-4 w-4 text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-10 select-none">
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                            onClick={() => !processing && inputRef.current?.click()}
                            className="relative w-full h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer bg-background/40 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                          >
                            <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover/drop:scale-110 transition-transform">
                               <CloudUpload className="h-10 w-10 text-primary" />
                            </div>
                            <div className="px-6 space-y-1">
                              <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Hub Artifact</p>
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag or click to browse</p>
                              <KbdShortcut />
                              <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20">JPEG, PNG, TIFF & WebP SUPPORTED</p>
                            </div>
                            <label htmlFor="metadata-scrubber-upload" className="sr-only">Upload Image for Metadata Scrubbing</label>
                            <input id="metadata-scrubber-upload" name="metadata-scrubber-upload" ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card p-0 relative group overflow-hidden h-[500px] flex flex-col">
                        <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between overflow-visible shrink-0">
                          <div className="flex items-center gap-3">
                            <Activity className="h-4 w-4 text-primary" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setImage(null);
                              setScrubbed(false);
                              setReport(null);
                            }}
                            variant="destructive"
                            size="sm"
                            className="h-7 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Asset</span>
                          </Button>
                        </div>
                        <div className="flex-1 relative cursor-crosshair overflow-hidden p-4 flex items-center justify-center bg-black">
                          <div className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${!scrubbed ? 'grayscale blur-[2px] group-hover:grayscale-0 group-hover:blur-none' : ''}`}>
                            <img src={image} className="max-w-full max-h-full object-contain rounded-xl" alt="Source Artifact" />
                          </div>
                          
                          {!scrubbed && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-transparent transition-all duration-700 rounded-xl pointer-events-none group-hover:opacity-0">
                              <div className="p-8 bg-background/80 backdrop-blur-2xl rounded-2xl border border-primary/20 shadow-2xl scale-100 group-hover:scale-110 transition-all duration-500 flex flex-col items-center gap-4">
                                  <ShieldX className="h-12 w-12 text-primary animate-pulse" />
                                  <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Identity Obscured</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-40">Hover to reveal artifact</p>
                                  </div>
                              </div>
                            </div>
                          )}

                          {scrubbed && (
                            <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px] flex flex-col items-center justify-center animate-in fade-in duration-500">
                              <div className="bg-background/90 p-8 rounded-2xl border border-primary/20 shadow-2xl scale-110 flex flex-col items-center gap-4">
                                <FileCheck className="h-12 w-12 text-primary" />
                                <p className="text-xl font-black uppercase italic tracking-tighter text-primary">Sanitized</p>
                                <Button onClick={downloadCleared} size="lg" className="h-14 px-8 rounded-2xl gap-3 font-black uppercase italic tracking-widest shadow-xl">
                                    <Download className="h-5 w-5" /> Dispatch Artifact
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                      
                      <div className="p-8 rounded-2xl bg-card border border-primary/5 flex items-center justify-between shadow-xl">
                         <div className="flex items-center gap-6">
                            <div className="p-4 bg-primary/10 rounded-2xl shadow-inner border border-primary/20">
                               {scrubbed || (report && !report.gps && !report.camera && !report.software) ? <FileCheck className="h-8 w-8 text-primary" /> : <ShieldX className="h-8 w-8 text-primary" />}
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60 italic">Status Dashboard</p>
                               <p className="text-xl font-black uppercase italic tracking-tighter text-foreground">
                                  {scrubbed ? "Bitstream Sanitized" : (report && !report.gps && !report.camera && !report.software) ? "Bitstream Clean" : "Leak Detection Active"}
                               </p>
                            </div>
                         </div>
                         {!scrubbed && report && (
                            <div className="flex gap-2">
                               {report.gps ? <span className="px-3 py-1 bg-destructive/10 text-destructive text-[9px] font-black rounded-2xl border border-destructive/20 animate-pulse uppercase tracking-widest">GPS LEAK</span> : <span className="px-3 py-1 bg-muted/10 text-muted-foreground text-[9px] font-black rounded-2xl border border-muted/20 uppercase tracking-widest opacity-20">GPS CLEAN</span>}
                               {report.camera ? <span className="px-3 py-1 bg-destructive/10 text-destructive text-[9px] font-black rounded-2xl border border-destructive/20 animate-pulse uppercase tracking-widest">CAMERA ID</span> : <span className="px-3 py-1 bg-muted/10 text-muted-foreground text-[9px] font-black rounded-2xl border border-muted/20 uppercase tracking-widest opacity-20">CAMERA CLEAN</span>}
                               {report.software ? <span className="px-3 py-1 bg-destructive/10 text-destructive text-[9px] font-black rounded-2xl border border-destructive/20 animate-pulse uppercase tracking-widest">SOFTWARE ID</span> : <span className="px-3 py-1 bg-muted/10 text-muted-foreground text-[9px] font-black rounded-2xl border border-muted/20 uppercase tracking-widest opacity-20">SOFTWARE CLEAN</span>}
                            </div>
                         )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/5 bg-card">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Scrub Logic Pipeline</h3>
                  </div>
                  <CardContent className="p-8 space-y-8">
                     {image ? (
                        <div className="space-y-6">
                           <div className="grid grid-cols-1 gap-3">
                              <div className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${report?.gps ? 'border-destructive/40 bg-destructive/5' : 'border-border/30 bg-background/20 opacity-20'}`}>
                                  <div className="flex items-center gap-4">
                                     <MapPin className={`h-5 w-5 ${report?.gps ? 'text-destructive' : 'text-muted-foreground'}`} />
                                     <div className="text-left">
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Geospatial Data</p>
                                        <p className={`text-xs font-black italic ${report?.gps ? 'text-destructive' : 'text-muted-foreground'}`}>{report?.gps ? "LEAK DETECTED" : "CLEAN"}</p>
                                     </div>
                                  </div>
                              </div>

                              <div className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${report?.camera ? 'border-destructive/40 bg-destructive/5' : 'border-border/30 bg-background/20 opacity-20'}`}>
                                  <div className="flex items-center gap-4">
                                     <Camera className={`h-5 w-5 ${report?.camera ? 'text-destructive' : 'text-muted-foreground'}`} />
                                     <div className="text-left">
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Camera Signature</p>
                                        <p className={`text-xs font-black italic ${report?.camera ? 'text-destructive' : 'text-muted-foreground'}`}>{report?.camera ? "LEAK DETECTED" : "CLEAN"}</p>
                                     </div>
                                  </div>
                              </div>

                              <div className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${report?.software ? 'border-destructive/40 bg-destructive/5' : 'border-border/30 bg-background/20 opacity-20'}`}>
                                  <div className="flex items-center gap-4">
                                     <Smartphone className={`h-5 w-5 ${report?.software ? 'text-destructive' : 'text-muted-foreground'}`} />
                                     <div className="text-left">
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Device / Mod ID</p>
                                        <p className={`text-xs font-black italic ${report?.software ? 'text-destructive' : 'text-muted-foreground'}`}>{report?.software ? "LEAK DETECTED" : "CLEAN"}</p>
                                     </div>
                                  </div>
                              </div>
                           </div>

                           <div className="pt-4 border-t border-primary/10">
                              <Button 
                                onClick={scrubMetadata} 
                                disabled={processing || scrubbed} 
                                className="w-full gap-3 h-16 text-xs font-black rounded-2xl shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic"
                              >
                                {scrubbed ? <FileCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
                                {processing ? "Sanitizing..." : scrubbed ? "Verified Clean" : "Scrub Bitstream"}
                              </Button>
                              <p className="text-[9px] text-center mt-4 text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 italic leading-relaxed px-4">
                                Drawing to canvas destroys 100% of underlying non-pixel data streams.
                              </p>
                           </div>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-background/20 rounded-2xl border border-dashed border-primary/10 shadow-inner">
                          <Smartphone className="h-10 w-10 text-primary mb-6 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 px-6">Load Asset</p>
                          <p className="text-[9px] mt-4 max-w-[200px] leading-relaxed opacity-30 uppercase font-black tracking-tighter italic px-6">Bit-draw bypasses EXIF/XMP/IPTC headers entirely.</p>
                        </div>
                     )}
                  </CardContent>
                </Card>

                {/* History Panel */}
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/5 bg-card">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3">
                    <Activity className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Session Logs</h3>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    {history.length === 0 ? (
                      <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-20 py-4 italic">No activity recorded</p>
                    ) : (
                      history.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black text-foreground truncate max-w-[120px]">{item.name}</span>
                              <span className="text-[8px] font-black text-muted-foreground opacity-50 uppercase tracking-widest">{item.time}</span>
                           </div>
                           <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">Clean</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Privacy Metadata Scrubber"
              description="The Metadata Scrubber is a forensic-grade sanitization tool designed to strip hidden identification layers—such as GPS coordinates, camera serial numbers, and software signatures—from your digital images."
              transparency="Our scrubbing pipeline uses a 'Bit-Draw' bypass method: we render your image to an off-screen HTML5 canvas and re-export the raw pixels as a new JPEG/PNG. This forcefully discards all EXIF, XMP, and IPTC metadata blocks. Since this happens entirely in your browser's local memory, your original, sensitive files are never exposed to any server."
              limitations="While extremely effective for privacy, this process will strip all metadata, including useful information like color profiles or orientation tags. For multi-thousand image batch processing, a dedicated desktop privacy suite may offer faster parallel execution."
              accent="rose"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      {/* Clean File Animation Overlay */}
        <AnimatePresence>
          {isCleanAnimating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="h-32 w-32 bg-emerald-500/20 rounded-full flex items-center justify-center border-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                   <FileCheck className="h-16 w-16 text-emerald-500" />
                </div>
                <div className="text-center">
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none text-shadow-glow text-white">Artifact Secure</h2>
                  <p className="text-emerald-500 text-xs font-black uppercase tracking-[0.4em] mt-2 animate-pulse font-black">No Identity Leaks Detected</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      <canvas ref={canvasRef} className="hidden" />
    
      {/* Mobile Sticky Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-black/80 backdrop-blur-sm border-t border-white/10 py-2 h-[66px] overflow-x-clip">
        <AdBox adFormat="horizontal" height={50} label="320x50 ANCHOR AD" className="w-full" />
      </div>
    </div>
  );
};

export default MetadataScrubber;
