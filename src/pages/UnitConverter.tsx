import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Ruler, Weight, Thermometer, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";

const CATEGORIES = [
  {
    id: 'length', label: 'Length', icon: <Ruler className="h-4 w-4" />, units: [
      { id: 'm', label: 'Meters', ratio: 1 },
      { id: 'km', label: 'Kilometers', ratio: 1000 },
      { id: 'cm', label: 'Centimeters', ratio: 0.01 },
      { id: 'mm', label: 'Millimeters', ratio: 0.001 },
      { id: 'in', label: 'Inches', ratio: 0.0254 },
      { id: 'ft', label: 'Feet', ratio: 0.3048 },
      { id: 'yd', label: 'Yards', ratio: 0.9144 },
      { id: 'mi', label: 'Miles', ratio: 1609.34 }
    ]
  },
  {
    id: 'weight', label: 'Weight', icon: <Weight className="h-4 w-4" />, units: [
      { id: 'kg', label: 'Kilograms', ratio: 1 },
      { id: 'g', label: 'Grams', ratio: 0.001 },
      { id: 'mg', label: 'Milligrams', ratio: 0.000001 },
      { id: 'lb', label: 'Pounds', ratio: 0.453592 },
      { id: 'oz', label: 'Ounces', ratio: 0.0283495 },
      { id: 't', label: 'Tons', ratio: 1000 }
    ]
  },
  {
    id: 'temp', label: 'Temperature', icon: <Thermometer className="h-4 w-4" />, units: [
      { id: 'c', label: 'Celsius', ratio: 1 },
      { id: 'f', label: 'Fahrenheit', ratio: 1 },
      { id: 'k', label: 'Kelvin', ratio: 1 }
    ]
  }
];

const UnitConverter = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [cat, setCat] = useState('length');
  const [val, setVal] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [copied, setCopied] = useState<string | null>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const currentCat = CATEGORIES.find(c => c.id === cat)!;

  const convert = (value: number, from: string, to: string) => {
    if (cat === 'temp') {
      let c = value;
      if (from === 'f') c = (value - 32) * 5 / 9;
      if (from === 'k') c = value - 273.15;

      if (to === 'c') return c;
      if (to === 'f') return c * 9 / 5 + 32;
      if (to === 'k') return c + 273.15;
      return c;
    }

    const fromRatio = currentCat.units.find(u => u.id === from)!.ratio;
    const toRatio = currentCat.units.find(u => u.id === to)!.ratio;
    return (value * fromRatio) / toRatio;
  };

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-12 grow">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                  Universal Unit <span className="text-primary italic">Hub</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Versatile Measurement Transformer · High Precision
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-8">

                {/* Category Selector */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setCat(c.id); setFromUnit(c.units[0].id); }}
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px] ${cat === c.id ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.05]' : 'bg-muted/5 border-border/30 text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                        }`}
                    >
                      {c.icon}
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Input Card */}
                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-muted/5 p-8 border-2 border-primary/5">
                  <CardContent className="p-0 flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Value</p>
                      <input
                        id="unit-converter-value-input"
                        name="unit-converter-value-input"
                        type="number"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        className="w-full bg-zinc-950/40 border border-primary/10 rounded-2xl px-6 h-14 text-sm font-bold focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/30 transition-all shadow-inner"
                      />
                    </div>
                    <div className="w-48 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">From</p>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full bg-zinc-950/40 border border-primary/10 rounded-2xl px-4 h-14 text-sm font-black uppercase tracking-tighter flex items-center justify-between hover:bg-zinc-900/60 shadow-inner"
                          >
                            <span className="truncate">{currentCat.units.find(u => u.id === fromUnit)?.label || fromUnit}</span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-morphism border-primary/20 min-w-[var(--radix-dropdown-menu-trigger-width)]">
                          {currentCat.units.map(u => (
                            <DropdownMenuItem
                              key={u.id}
                              onClick={() => setFromUnit(u.id)}
                              className="font-black py-3 text-xs uppercase cursor-pointer"
                            >
                              {u.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCat.units.map(u => {
                    const result = convert(parseFloat(val) || 0, fromUnit, u.id);
                    const formatted = result.toLocaleString(undefined, { maximumFractionDigits: 6 });

                    return (
                      <Card key={u.id} className={`glass-morphism border-primary/10 rounded-2xl shadow-lg bg-muted/5 transition-all group overflow-x-clip ${u.id === fromUnit ? 'opacity-40 pointer-events-none' : ''}`}>
                        <CardContent className="p-4 flex items-center justify-between gap-4 relative overflow-x-clip">
                          <div className="flex-1 overflow-x-clip relative z-10">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">{u.label} ({u.id})</p>
                            <div className="text-xl font-mono font-black italic tracking-tighter truncate selection:bg-primary/30">
                              {formatted}
                            </div>
                          </div>
                          <button
                            onClick={() => copy(String(result), u.id)}
                            className={`h-11 w-11 flex items-center justify-center shrink-0 rounded-2xl border transition-all duration-300 shadow-xl relative z-10 ${copied === u.id ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500 shadow-emerald-500/20' : 'border-primary/40 bg-zinc-950/60 text-white hover:bg-primary hover:text-white shadow-primary/5 hover:scale-110'}`}
                          >
                            {copied === u.id ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                          </button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex justify-center py-8">

                </div>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/5">
                  <div className="bg-primary/10 p-5 border-b border-primary/10 flex items-center gap-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Converter Insights</h3>
                  </div>
                  <CardContent className="p-8 space-y-8">
                    <div className="p-5 rounded-2xl bg-muted/5 border border-primary/10 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none mb-2">Precision Layer</p>
                      <p className="text-3xl font-black italic tracking-tighter text-primary">6 Float Points</p>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] group">
                        <div className="h-8 w-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 transition-transform group-hover:scale-110">
                          <Zap className="h-4 w-4" />
                        </div>
                        <span>Local Arithmetic</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-primary/10 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">

                    </div>
                  </CardContent>
                </Card>

                <div className="px-8 py-2">
                  <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic leading-relaxed">
                    Includes Metric, Imperial, and Scientific units. Temp conversions use standard SI formulas. All processing is local.
                  </p>
                </div>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Universal Unit Hub"
              accent="rose"
              overview="The Universal Unit Hub is a high-precision measurement translation workbench designed for engineers, architects, and technical project managers. I built this tool to provide a surgical path for mapping between Metric, Imperial, and Scientific units without the security risks of 'on-the-fly' unit converters that scrape your project specifications and technical metadata for commercial intelligence data."
              steps={[
                "Select your target 'Category' (Length, Weight, or Temperature) from the workbench.",
                "Stage your source 'Value' into the Input Registry.",
                "Select the 'From' unit to establish the baseline measurement artifact.",
                "Monitor the 'Results Grid' to observe the localized transformations across all alternate units.",
                "utilize the 'Copy' interface to export the sanitized measurement data for your technical documentation."
              ]}
              technicalImplementation="I architected this hub using a Linear Scalar Multiplier Engine based on SI-standard constants. For temperature conversions, the tool utilizes specific Phase-Shift Algorithms (Celsius, Fahrenheit, Kelvin) to maintain accuracy across the thermal spectrum. By executing all arithmetic in the browser's local sandbox with 64-bit float precision, we ensure that your project dimensions and specifications remain strictly air-gapped from the cloud."
              privacyGuarantee="The Security \u0026 Privacy model for the Unit Lab is built on Technical Data Sovereignty. Your measurement inputs—from site dimensions to chemical weights—are processed strictly within your browser's private application state. No telemetry is utilized to monitor your conversion patterns or project data. All session coefficients are volatile and are permanently purged from RAM upon tab termination. Your specs stay private."
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default UnitConverter;
