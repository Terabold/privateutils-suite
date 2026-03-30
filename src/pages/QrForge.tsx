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
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                   Qr <span className="text-primary italic">Forge</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">High-Precision Dynamic QR Generation</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-700">
                 <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                  <div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic text-shadow-glow flex items-center gap-2">
                         <Zap className="h-4 w-4" /> Forge Input
                     </h3>
                  </div>
                </div>
                <div className="p-10 space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary leading-none px-1">Payload Secret</Label>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter link or text to encode..."
                    className="h-16 bg-background/50 border-primary/10 text-xl font-black italic tracking-tight rounded-2xl placeholder:text-muted-foreground/30 font-sans"
                  />
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-foreground">
                    <ShieldCheck className="h-3 w-3" /> Zero-Leak Encoding Enabled
                  </div>
                </div>
              </Card>

              {qrUrl && (
                <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-700">
                   <Card className="p-6 bg-white rounded-2xl shadow-2xl border-4 border-primary/10">
                      <img src={qrUrl} className="h-52 w-52 object-contain" />
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
                 <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Styling Matrix</h3>
                   {input && (
                     <Button 
                       onClick={() => { setInput(""); setQrUrl(null); }} 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all"
                     >
                       Reset Stage
                     </Button>
                   )}
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

                    <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic">ISO/IEC 18004 • Air-gapped generation • Universal scanner support</p>
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

