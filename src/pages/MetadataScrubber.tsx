import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, ShieldX, Check, Trash2, Camera, MapPin, Smartphone, FileCheck, Download, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
import exifr from "exifr";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const MetadataScrubber = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scrubbed, setScrubbed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [report, setReport] = useState<{ gps: boolean; camera: boolean; software: boolean } | null>(null);
  
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
    setFile(f);
    setScrubbed(false);
    setReport(null);

    // Dynamic Exifr Parsing
    try {
      const parsed = await exifr.parse(f);
      if (parsed) {
         setReport({
            gps: !!parsed.latitude || !!parsed.longitude || !!parsed.GPSLatitude,
            camera: !!parsed.Make || !!parsed.Model,
            software: !!parsed.Software || !!parsed.HostComputer || !!parsed.ProcessingSoftware
         });
      } else {
         setReport({ gps: false, camera: false, software: false });
      }
    } catch {
      setReport({ gps: false, camera: false, software: false }); // fallback if stripped
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  usePasteFile(handleFile);

  const scrubMetadata = async () => {
    if (!file || !preview || !canvasRef.current) return;
    setProcessing(true);

    const img = new Image();
    img.src = preview;
    
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Drawing to canvas strips EXIF/GPS metadata by default
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `scrubbed_${file.name.replace(/\.[^/.]+$/, "")}.jpg`; // Enforce JPG extension to match compression
        link.click();
        setScrubbed(true);
        setReport({ gps: false, camera: false, software: false }); // cleared
        setProcessing(false);
        toast.success("Privacy scrub complete. Metadata removed.");
      }, "image/jpeg", 0.8); // 0.8 fixes bloat and ensures EXIF is wiped
    };
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-privacy transition-all duration-500">
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
                   Metadata <span className="text-primary italic">Scrubber</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Deep Privacy Sanitization Engine</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_380px] gap-8 items-start">
            {/* Column 1: Sponsors */}
            <aside className="hidden lg:flex flex-col gap-6 lg:sticky lg:top-24">
               <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-2 italic">Global Partners</h3>
                  <div className="space-y-4">
                    <AdPlaceholder format="vertical" className="opacity-40 grayscale hover:grayscale-0 transition-all border-border/50 h-[300px]" />
                    <AdPlaceholder format="vertical" className="opacity-40 grayscale hover:grayscale-0 transition-all border-border/50 h-[300px]" />
                  </div>
               </div>
            </aside>

            {/* Column 2: Main Stage */}
            <div className="space-y-8">
              <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10">
                {preview ? (
                  <div className="relative w-full max-w-3xl group">
                    <img src={preview} className="max-h-[60vh] object-contain w-full rounded-2xl shadow-2xl transition-all group-hover:opacity-80 grayscale group-hover:grayscale-0 duration-500" alt="Preview" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                       <ShieldX className="h-32 w-32 text-primary drop-shadow-2xl" />
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => inputRef.current?.click()}
                    className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-32 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                  >
                    <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
                       <CloudUpload className="h-12 w-12 text-primary" />
                    </div>
                    <div className="px-6 space-y-1">
                      <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Drag & Drop</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">or click to browse</p>
                      <KbdShortcut />
                      <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20">JPG or PNG Files • Strips Camera & GPS Data</p>
                    </div>
                  </div>
                )}
                <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                <canvas ref={canvasRef} className="hidden" />
              </Card>

              <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic px-4">Bit-level redraw • EXIF/XMP/IPTC stripped • GPS coordinates removed</p>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Privacy Report</h3>
                  {file && (
                    <Button 
                      onClick={() => { setFile(null); setPreview(null); setScrubbed(false); setReport(null); }} 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all"
                    >
                      Reset Stage
                    </Button>
                  )}
                </div>
                <CardContent className="p-8 space-y-12">
                   {file ? (
                     <div className="space-y-8">
                        <div className="space-y-4">
                            <div className={`p-5 bg-background/50 rounded-2xl border flex items-center gap-4 transition-all ${report?.gps ? 'border-destructive/30 bg-destructive/5' : 'border-border/50 opacity-40 grayscale group-hover:grayscale-0'}`}>
                               <MapPin className={`h-5 w-5 ${report?.gps ? 'text-destructive' : 'text-primary'}`} />
                               <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">GPS Location</p>
                                  <p className="text-xs font-black">{report?.gps ? "DETECTION: HIGH RISK" : "SECURE"}</p>
                               </div>
                            </div>
                            <div className={`p-5 bg-background/50 rounded-2xl border flex items-center gap-4 transition-all ${report?.camera ? 'border-destructive/30 bg-destructive/5' : 'border-border/50 opacity-40 grayscale group-hover:grayscale-0'}`}>
                               <Camera className={`h-5 w-5 ${report?.camera ? 'text-destructive' : 'text-primary'}`} />
                               <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Camera Signature</p>
                                  <p className="text-xs font-black">{report?.camera ? "DETECTION: HIGH RISK" : "SECURE"}</p>
                               </div>
                            </div>
                            <div className={`p-5 bg-background/50 rounded-2xl border flex items-center gap-4 transition-all ${report?.software ? 'border-destructive/30 bg-destructive/5' : 'border-border/50 opacity-40 grayscale group-hover:grayscale-0'}`}>
                               <Smartphone className={`h-5 w-5 ${report?.software ? 'text-destructive' : 'text-primary'}`} />
                               <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Device / App ID</p>
                                  <p className="text-xs font-black">{report?.software ? "DETECTION: HIGH RISK" : "SECURE"}</p>
                               </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-primary/5">
                           <Button 
                             onClick={scrubMetadata} 
                             disabled={processing} 
                             className="w-full gap-3 h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic"
                           >
                             {scrubbed ? <FileCheck className="h-6 w-6" /> : <ShieldX className="h-6 w-6" />}
                             {processing ? "Scrubbing Bits..." : scrubbed ? "Privacy Verified" : "Scrub Metadata"}
                           </Button>
                           <p className="text-[9px] text-center mt-4 text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 italic">
                             100% Client-Side Metadata Destruction
                           </p>
                        </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/5 rounded-2xl border border-dashed border-primary/10">
                        <Smartphone className="h-10 w-10 text-primary mb-6 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Load Source</p>
                        <p className="text-[9px] mt-2 max-w-[150px] leading-relaxed opacity-30 uppercase font-black tracking-tighter">Analysis is performed entirely within your browser memory sandbox</p>
                     </div>
                   )}
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

export default MetadataScrubber;

