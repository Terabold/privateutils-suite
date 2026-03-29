import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, QrCode, Download, Copy, Trash2, Smartphone, Palette, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import QRCode from "qrcode";
import { toast } from "sonner";

const QrForge = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [input, setInput] = useState("");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const generateQr = useCallback(async () => {
    if (!input.trim()) {
      setQrUrl(null);
      return;
    }

    if (fgColor.toLowerCase() === bgColor.toLowerCase()) {
      toast.error("Invalid Matrix: Colors must contrast for scanner compatibility.");
      setQrUrl(null);
      return;
    }

    try {
      const url = await QRCode.toDataURL(input, {
        width: 1024,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setQrUrl(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR Code");
    }
  }, [input, fgColor, bgColor]);

  useEffect(() => {
    generateQr();
  }, [generateQr]);

  const downloadQr = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `qr_code_${Date.now()}.png`;
    a.click();
    toast.success("QR Artifact Dispatched");
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
                   Secure <span className="text-primary italic">QR Forge</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Privacy-First Link & Data Encoding</p>
              </div>
            </div>
            {input && (
               <Button onClick={() => setInput("")} variant="ghost" size="sm" className="gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-2xl transition-all">
                  Wipe Stage
               </Button>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card className="glass-morphism border-primary/10 overflow-hidden bg-muted/5 rounded-2xl p-10 shadow-inner">
                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary leading-none px-1">Payload Secret</Label>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter link or text to encode..."
                    className="h-16 bg-background/50 border-primary/10 text-xl font-black italic tracking-tight rounded-2xl placeholder:text-muted-foreground/30"
                  />
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-foreground">
                    <ShieldCheck className="h-3 w-3" /> Zero-Leak Encoding Enabled
                  </div>
                </div>
              </Card>

              {qrUrl && (
                <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-700">
                   <Card className="p-8 bg-white rounded-2xl shadow-2xl border-4 border-primary/10">
                      <img src={qrUrl} className="h-64 w-64 object-contain" />
                   </Card>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                      <Button onClick={downloadQr} className="h-20 text-lg font-black rounded-2xl gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tight">
                         <Download className="h-6 w-6" /> Export PNG
                      </Button>
                      <Button onClick={() => { navigator.clipboard.writeText(input); toast.success("Secret Copied"); }} variant="secondary" className="h-20 text-lg font-black rounded-2xl gap-3 italic uppercase border border-border/50">
                         <Copy className="h-6 w-6" /> Copy Payload
                      </Button>
                   </div>
                </div>
              )}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                 <div className="bg-primary/5 p-5 border-b border-primary/10">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Styling Matrix</h3>
                 </div>
                 <CardContent className="p-8 space-y-10">
                     <div className="space-y-6">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block">Foreground Artifact</label>
                           <div className="flex gap-2">
                              <Input 
                                type="color" 
                                value={fgColor} 
                                onChange={(e) => setFgColor(e.target.value)} 
                                className="w-12 h-10 p-1 rounded-2xl cursor-pointer bg-background border-border/50" 
                              />
                              <Input 
                                type="text" 
                                value={fgColor.toUpperCase()} 
                                onChange={(e) => setFgColor(e.target.value)} 
                                className="font-mono text-xs uppercase bg-muted/20 border-border/50 h-10"
                              />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block">Stage Matrix (Background)</label>
                           <div className="flex gap-2">
                              <Input 
                                type="color" 
                                value={bgColor} 
                                onChange={(e) => setBgColor(e.target.value)} 
                                className="w-12 h-10 p-1 rounded-2xl cursor-pointer bg-background border-border/50" 
                              />
                              <Input 
                                type="text" 
                                value={bgColor.toUpperCase()} 
                                onChange={(e) => setBgColor(e.target.value)} 
                                className="font-mono text-xs uppercase bg-muted/20 border-border/50 h-10"
                              />
                           </div>
                        </div>
                     </div>

                    <div className="p-6 rounded-2xl bg-zinc-950/50 border border-border/50 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Smartphone className="h-3.5 w-3.5" /> Direct Scan Logic
                       </h4>
                       <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-80 font-medium font-sans">
                         Codes are generated using the <strong className="font-bold">ISO/IEC 18004</strong> standard, ensuring compatibility with all mobile artifacts and forensic scanners.
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                       <div className="flex flex-col items-center text-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                             <ShieldCheck className="h-5 w-5" />
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Air-Gapped</span>
                       </div>
                       <div className="flex flex-col items-center text-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                             <Zap className="h-5 w-5" />
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Static</span>
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

export default QrForge;

