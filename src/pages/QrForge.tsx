import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Download, Copy, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import QRCode from "qrcode";
import { toast } from "sonner";
import { KbdShortcut } from "@/components/KbdShortcut";

const QrForge = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [input, setInput] = useState("");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(256);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

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

    try {
      const url = await QRCode.toDataURL(input, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorCorrectionLevel,
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
  }, [input, fgColor, bgColor, size, errorCorrectionLevel]);

  useEffect(() => {
    const timer = setTimeout(generateQr, 300);
    return () => clearTimeout(timer);
  }, [generateQr]);

  const downloadQr = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `qr_artifact_${Date.now()}.png`;
    a.click();
    toast.success("QR Artifact Dispatched");
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-privacy transition-all duration-500 overflow-x-hidden">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
        </aside>

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow">
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
                  QR <span className="text-primary italic">Forge</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Neural Data Encoding Engine</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-12 items-start">
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card className="glass-morphism border-primary/10 p-10 rounded-[32px] bg-zinc-950/50 shadow-2xl relative group overflow-hidden border-2 border-primary/5">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 rotate-12 pointer-events-none transition-opacity group-hover:opacity-[0.05]">
                  <Smartphone className="h-24 w-24" />
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic px-1">Source Payload</label>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter secret protocol or URL artifact..."
                      className="w-full h-14 bg-background/50 border-2 border-white/5 rounded-2xl px-6 text-sm font-medium outline-none focus:border-primary/50 transition-all shadow-inner font-mono"
                    />
                    <div className="flex justify-between items-center px-1">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-20 italic">AES-Level Content Sandbox</p>
                      {input && (
                        <button 
                          onClick={() => setInput("")}
                          className="text-[9px] font-black uppercase tracking-widest text-destructive/50 hover:text-destructive flex items-center gap-1.5 transition-colors"
                        >
                          Clear Payload
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {input && (
                <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-700">
                  <div className="bg-white p-8 rounded-3xl shadow-2xl border-8 border-white/10 group-hover:scale-[1.02] transition-transform duration-500 overflow-hidden">
                    {qrUrl ? (
                      <img src={qrUrl} className="w-64 h-64 object-contain mx-auto" alt="QR Artifact" />
                    ) : (
                      <div className="w-64 h-64 bg-zinc-100 animate-pulse rounded-xl" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                    <Button onClick={downloadQr} disabled={!qrUrl} className="h-20 text-lg font-black rounded-2xl gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tight">
                      <Download className="h-6 w-6" /> Export PNG
                    </Button>
                    <Button onClick={() => { navigator.clipboard.writeText(input); toast.success("Secret Copied"); }} variant="secondary" className="h-20 text-lg font-black rounded-2xl gap-3 italic uppercase border border-border/50">
                      <Copy className="h-6 w-6" /> Copy Artifact
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-primary/5 h-[56px] px-6 border-b border-primary/10 flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Styling Matrix</h3>
                  {input && (
                    <Button
                      onClick={() => { 
                        setFgColor("#000000"); 
                        setBgColor("#ffffff"); 
                        setSize(256); 
                        setErrorCorrectionLevel('M');
                        toast.success("Matrix Reset to Factory");
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 border border-primary/10 rounded-xl transition-all"
                    >
                      Reset Matrix
                    </Button>
                  )}
                </div>
                <CardContent className="p-8 space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block italic">Drafting Colors</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase opacity-40">Foreground</span>
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full h-10 rounded-xl bg-zinc-950/40 border-white/5 cursor-pointer block" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase opacity-40">Background</span>
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-xl bg-zinc-950/40 border-white/5 cursor-pointer block" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block italic">Artifact Size</label>
                    <select value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-full h-12 bg-zinc-950/40 rounded-2xl border border-white/5 text-[10px] font-black px-4 outline-none appearance-none cursor-pointer text-white">
                      <option value={128} className="bg-zinc-900">Small (128x128 artifact)</option>
                      <option value={256} className="bg-zinc-900">Medium (256x256 artifact)</option>
                      <option value={512} className="bg-zinc-900">Large (512x512 artifact)</option>
                      <option value={1024} className="bg-zinc-900">Ultra (1024x1024 artifact)</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block italic">Error Shield</label>
                    <div className="grid grid-cols-4 gap-2 bg-zinc-950/40 p-1 rounded-2xl">
                      {['L', 'M', 'Q', 'H'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setErrorCorrectionLevel(level as any)}
                          className={cn(
                            "py-2 text-[10px] font-black uppercase rounded-xl transition-all",
                            errorCorrectionLevel === level ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic pt-4">
                    ISO/IEC 18004 • Air-gapped generation • Universal scanner support
                  </p>
                </CardContent>
              </Card>

              <div className="px-6">
                <AdPlaceholder format="rectangle" className="opacity-40 grayscale group-hover:grayscale-0 transition-all border-border/50" />
              </div>
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
    </div>
  );
};

export default QrForge;


