import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, RefreshCw, Palette, Zap, Database, Code, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";

// Helper for HSL to Hex
function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Simple color generation logic
function generatePalette(h: number, s: number, l: number, mode: string) {
  const colors = [];
  switch (mode) {
    case 'monochromatic':
      for (let i = 0; i < 5; i++) colors.push({ h, s, l: Math.max(10, Math.min(90, l + (i - 2) * 15)) });
      break;
    case 'analogous':
      for (let i = 0; i < 5; i++) colors.push({ h: (h + (i - 2) * 30 + 360) % 360, s, l });
      break;
    case 'complementary':
      colors.push({ h, s, l });
      colors.push({ h, s: Math.max(10, s - 20), l: Math.min(90, l + 20) });
      colors.push({ h: (h + 180) % 360, s, l });
      colors.push({ h: (h + 180) % 360, s: Math.max(10, s - 20), l: Math.min(90, l + 20) });
      colors.push({ h: (h + 180) % 360, s, l: Math.max(10, l - 20) });
      break;
    case 'triadic':
      colors.push({ h, s, l });
      colors.push({ h: (h + 120) % 360, s, l });
      colors.push({ h: (h + 240) % 360, s, l });
      colors.push({ h, s: Math.max(10, s - 30), l });
      colors.push({ h: (h + 120) % 360, s, l: Math.min(90, l + 20) });
      break;
    default:
      for (let i = 0; i < 5; i++) colors.push({ h: (h + i * 40) % 360, s, l });
  }
  return colors.map(c => hslToHex(c.h, c.s, c.l));
}

const ColorPaletteGenerator = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [hsl, setHsl] = useState({ h: 210, s: 70, l: 50 });
  const [mode, setMode] = useState('monochromatic');
  const [palette, setPalette] = useState<string[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Deploy image artifact to sample colors.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Sample center pixel for a quick palette "seed"
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const [r, g, b] = ctx.getImageData(img.width / 2, img.height / 2, 1, 1).data;
          // Simple RGB to HSL logic for the seed
          const rf = r / 255, gf = g / 255, bf = b / 255;
          const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
          let h = 0, s = 0, l = (max + min) / 2;
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case rf: h = (gf - bf) / d + (gf < bf ? 6 : 0); break;
              case gf: h = (bf - rf) / d + 2; break;
              case bf: h = (rf - gf) / d + 4; break;
            }
            h /= 6;
          }
          setHsl({ h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) });
          toast.success("Palette Seeded from Image");
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  usePasteFile(handleFile);

  const refresh = useCallback(() => {
    setHsl({ h: Math.floor(Math.random() * 360), s: 50 + Math.floor(Math.random() * 40), l: 40 + Math.floor(Math.random() * 20) });
  }, []);

  useEffect(() => {
    setPalette(generatePalette(hsl.h, hsl.s, hsl.l, mode));
  }, [hsl, mode]);

  const copyColor = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-image transition-colors duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <div className="p-8 rounded-2xl border-2 border-dashed border-primary/5 bg-primary/5 text-center mt-12 studio-gradient">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Verified Ad Space</p>
           </div>
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
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                Studio <span className="text-primary italic">Palette</span>
              </h1>
              <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                Professional Color Architect · Harmony Engine
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 items-start">
            {/* Left: Palette Preview (Shortened/Vertical) */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700 lg:sticky lg:top-24">
              <div className="flex flex-col h-[600px] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 group bg-black/40 backdrop-blur-3xl">
                {palette.map((hex, i) => (
                  <div 
                    key={i} 
                    className="relative flex-1 flex items-center justify-between px-8 transition-all duration-500 hover:flex-[1.5] group/color cursor-pointer border-b border-white/5 last:border-0"
                    style={{ backgroundColor: hex }}
                    onClick={() => copyColor(hex)}
                  >
                    <span className="font-mono font-black text-white text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] select-none uppercase tracking-tighter">{hex}</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover/color:opacity-100 transition-all">
                       {copiedColor === hex ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Controls & Export (The Bigger Half) */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
              <Card className="glass-morphism border-primary/10 rounded-[32px] shadow-2xl bg-black/20 p-10 overflow-hidden relative">
                <CardContent className="p-0 space-y-12 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary italic">Hue</p>
                        <p className="text-xs font-black font-mono bg-primary/10 px-2 py-0.5 rounded text-primary">{hsl.h}°</p>
                      </div>
                      <input type="range" min="0" max="360" value={hsl.h} onChange={(e) => setHsl(prev => ({ ...prev, h: parseInt(e.target.value) }))} className="w-full accent-primary h-2 bg-white/10 rounded-full appearance-none cursor-pointer" />
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary italic">Saturation</p>
                        <p className="text-xs font-black font-mono bg-primary/10 px-2 py-0.5 rounded text-primary">{hsl.s}%</p>
                      </div>
                      <input type="range" min="0" max="100" value={hsl.s} onChange={(e) => setHsl(prev => ({ ...prev, s: parseInt(e.target.value) }))} className="w-full accent-primary h-2 bg-white/10 rounded-full appearance-none cursor-pointer" />
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary italic">Lightness</p>
                        <p className="text-xs font-black font-mono bg-primary/10 px-2 py-0.5 rounded text-primary">{hsl.l}%</p>
                      </div>
                      <input type="range" min="10" max="90" value={hsl.l} onChange={(e) => setHsl(prev => ({ ...prev, l: parseInt(e.target.value) }))} className="w-full accent-primary h-2 bg-white/10 rounded-full appearance-none cursor-pointer" />
                    </div>
                  </div>

                  <div className="pt-10 border-t border-white/5 flex flex-col xl:flex-row items-center justify-between gap-10">
                    <div className="flex bg-white/5 p-1.5 rounded-[22px] border border-white/5 w-full xl:w-auto">
                      {['monochromatic', 'analogous', 'complementary', 'triadic'].map((m) => (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={`flex-1 xl:flex-none px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
                            mode === m 
                              ? 'bg-primary text-white shadow-lg scale-105 z-10' 
                              : 'text-muted-foreground hover:bg-white/5'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <Button onClick={refresh} variant="ghost" className="h-14 px-8 font-black rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-xs uppercase italic gap-3 group">
                      <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-700" /> Randomize
                    </Button>
                  </div>

                  <div className="pt-12 border-t border-white/5 space-y-8">
                    <header>
                      <h3 className="text-xl font-black uppercase italic tracking-tighter">Export <span className="text-primary">Pipeline</span></h3>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <button onClick={() => { navigator.clipboard.writeText(palette.join('\n')); toast.success("HEX Copied"); }} className="group flex flex-col p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-primary/5 hover:border-primary/30 transition-all text-left">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">HEX</span>
                          <Database className="h-4 w-4 opacity-20" />
                        </div>
                        <p className="mt-4 text-[9px] font-black uppercase tracking-widest opacity-40">Copy Hex List</p>
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(palette.map((h, i) => `--color-${i+1}: ${h};`).join('\n')); toast.success("CSS Copied"); }} className="group flex flex-col p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-primary/5 hover:border-primary/30 transition-all text-left">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">CSS</span>
                          <Code className="h-4 w-4 opacity-20" />
                        </div>
                        <p className="mt-4 text-[9px] font-black uppercase tracking-widest opacity-40">Copy Variables</p>
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(palette)); toast.success("JSON Copied"); }} className="group flex flex-col p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-primary/5 hover:border-primary/30 transition-all text-left">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">JSON</span>
                          <FileJson className="h-4 w-4 opacity-20" />
                        </div>
                        <p className="mt-4 text-[9px] font-black uppercase tracking-widest opacity-40">Copy Object</p>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </main>

        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-right-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <div className="p-8 rounded-2xl border-2 border-dashed border-primary/5 bg-primary/5 text-center mt-12 studio-gradient">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Verified Ad Space</p>
           </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default ColorPaletteGenerator;
