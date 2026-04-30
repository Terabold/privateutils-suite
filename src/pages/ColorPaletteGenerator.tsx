import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, RefreshCw, Palette, Zap, Database, Code, FileJson, Layers, Square, Repeat, Triangle, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import ToolBottomDescription from '@/components/ToolBottomDescription';
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import ControlHint from "@/components/ControlHint";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";

// Helper for HSL to Hex
function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
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
  const [darkMode, setDarkMode] = useState(() => (typeof document !== "undefined" && document.documentElement.classList.contains("dark")));
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

    // Safety Gate: 25MB Limit to prevent browser OOM
    if (file.size > 25 * 1024 * 1024) {
      toast.error(`Artifact density error: ${Math.round(file.size / 1024 / 1024)}MB exceeds 25MB security threshold.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Safety Gate: Hardware Limit check (8000px)
        if (img.width > 8000 || img.height > 8000) {
          toast.error(`Dimension threshold exceeded: ${img.width}x${img.height} exceeds 8000px hardware limit.`);
          return;
        }

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
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 overflow-x-clip">
      

      <div className="flex justify-center items-start w-full relative px-4 overflow-x-clip">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1100px] px-6 py-6 grow overflow-visible min-w-0">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all group/back bg-background/50 backdrop-blur-md shadow-xl">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white leading-tight">
                  HSL Color <span className="text-primary italic">Palette Generator</span>
                </h1>
                <p className="text-muted-foreground mt-1 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">
                  Professional Color Architect • Harmony Engine
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-4 w-full">
              <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-visible">
              {/* Left: Palette Preview */}
              <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700 lg:sticky lg:top-28 min-w-0">
                <div className="flex flex-col h-[570px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group bg-card backdrop-blur-3xl">
                  {palette.map((hex, i) => (
                    <div
                      key={i}
                      className="relative flex-1 flex items-center justify-between px-8 transition-all duration-500 hover:flex-[1.5] group/color cursor-pointer border-b border-white/5 last:border-0 first:rounded-t-2xl last:rounded-b-2xl"
                      style={{ backgroundColor: hex }}
                      onClick={() => copyColor(hex)}
                    >
                      <span className="font-mono font-black text-white text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] select-none uppercase tracking-tighter">{hex}</span>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-primary/20 text-white opacity-0 group-hover/color:opacity-100 transition-all">
                        {copiedColor === hex ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Controls & Export */}
              <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-700 overflow-visible min-w-0">
                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card p-6 md:p-8 overflow-x-clip relative">
                  <CardContent className="p-0 space-y-12 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary italic">Hue</p>
                          <p className="text-xs font-black font-mono bg-primary/10 px-2 py-0.5 rounded text-primary">{hsl.h}°</p>
                        </div>
                        <input id="palette-hue-slider" name="palette-hue-slider" type="range" min="0" max="360" value={hsl.h} onChange={(e) => setHsl(prev => ({ ...prev, h: parseInt(e.target.value) }))} className="w-full accent-primary h-2 bg-background/40 rounded-full appearance-none cursor-pointer" />
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary italic">Saturation</p>
                          <p className="text-xs font-black font-mono bg-primary/10 px-2 py-0.5 rounded text-primary">{hsl.s}%</p>
                        </div>
                        <input id="palette-saturation-slider" name="palette-saturation-slider" type="range" min="0" max="100" value={hsl.s} onChange={(e) => setHsl(prev => ({ ...prev, s: parseInt(e.target.value) }))} className="w-full accent-primary h-2 bg-background/40 rounded-full appearance-none cursor-pointer" />
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary italic">Lightness</p>
                          <p className="text-xs font-black font-mono bg-primary/10 px-2 py-0.5 rounded text-primary">{hsl.l}%</p>
                        </div>
                        <input id="palette-lightness-slider" name="palette-lightness-slider" type="range" min="10" max="90" value={hsl.l} onChange={(e) => setHsl(prev => ({ ...prev, l: parseInt(e.target.value) }))} className="w-full accent-primary h-2 bg-background/40 rounded-full appearance-none cursor-pointer" />
                      </div>
                    </div>

                    <div className="pt-10 border-t border-white/5 flex flex-col xl:flex-row items-center justify-between gap-10">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Harmony Mode</p>
                        <ControlHint
                          label="Harmony mode"
                          title="Harmony Mode"
                          description="Choose how generated colors relate to the seed color."
                          rows={[
                            { label: "Mono", description: "One hue with brightness variations. Calm and cohesive." },
                            { label: "Analog", description: "Neighboring hues. Natural, soft, and brand-friendly." },
                            { label: "Comp", description: "Opposite hue contrast. Strong call-to-action energy." },
                            { label: "Triadic", description: "Three balanced hues. More playful and varied." },
                          ]}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 bg-background/20 p-1.5 rounded-xl border border-white/5 w-full xl:w-[450px]">
                        {[
                          { id: 'monochromatic', icon: Sun },
                          { id: 'analogous', icon: Zap },
                          { id: 'complementary', icon: Repeat },
                          { id: 'triadic', icon: Triangle }
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn ${mode === m.id
                              ? 'bg-primary text-white shadow-glow shadow-primary/20 bg-primary border-b-2 border-primary-foreground/20'
                              : 'text-muted-foreground hover:bg-background/40 hover:text-foreground hover:scale-[1.02]'
                              }`}
                          >
                            <m.icon className={`h-3 w-3 ${mode === m.id ? 'text-white' : 'text-primary/40 group-hover/btn:text-primary transition-colors'}`} />
                            {m.id}
                          </button>
                        ))}
                      </div>
                      <Button onClick={refresh} variant="ghost" className="h-14 px-8 font-black rounded-xl border border-white/10 hover:bg-primary/10 transition-all text-xs uppercase italic gap-3 group">
                        <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-700" /> Randomize
                      </Button>
                    </div>

                    <div className="pt-12 border-t border-white/5 space-y-8">
                      <header>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground">Export <span className="text-primary">Pipeline</span></h3>
                      </header>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button onClick={() => { navigator.clipboard.writeText(palette.join('\n')); toast.success("HEX Copied"); }} className="group flex flex-col p-6 bg-background/40 border border-white/10 rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all text-left">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">HEX</span>
                            <Database className="h-4 w-4 opacity-20" />
                          </div>
                          <p className="mt-4 text-[9px] font-black uppercase tracking-widest opacity-40">Copy Hex List</p>
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(palette.map((h, i) => `--color-${i + 1}: ${h};`).join('\n')); toast.success("CSS Copied"); }} className="group flex flex-col p-6 bg-background/40 border border-white/10 rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all text-left">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">CSS</span>
                            <Code className="h-4 w-4 opacity-20" />
                          </div>
                          <p className="mt-4 text-[9px] font-black uppercase tracking-widest opacity-40">Copy Variables</p>
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(palette)); toast.success("JSON Copied"); }} className="group flex flex-col p-6 bg-background/40 border border-white/10 rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all text-left">
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

            {/* SEO & Tool Guide Section */}
            <ToolBottomDescription toolId="/palette-studio" />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default ColorPaletteGenerator;
