import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Ruler, Weight, Thermometer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import SponsorSidebars from "@/components/SponsorSidebars";

const CATEGORIES = [
  { id: 'length', label: 'Length', icon: <Ruler className="h-4 w-4" />, units: [
    { id: 'm', label: 'Meters', ratio: 1 },
    { id: 'km', label: 'Kilometers', ratio: 1000 },
    { id: 'cm', label: 'Centimeters', ratio: 0.01 },
    { id: 'mm', label: 'Millimeters', ratio: 0.001 },
    { id: 'in', label: 'Inches', ratio: 0.0254 },
    { id: 'ft', label: 'Feet', ratio: 0.3048 },
    { id: 'yd', label: 'Yards', ratio: 0.9144 },
    { id: 'mi', label: 'Miles', ratio: 1609.34 }
  ]},
  { id: 'weight', label: 'Weight', icon: <Weight className="h-4 w-4" />, units: [
    { id: 'kg', label: 'Kilograms', ratio: 1 },
    { id: 'g', label: 'Grams', ratio: 0.001 },
    { id: 'mg', label: 'Milligrams', ratio: 0.000001 },
    { id: 'lb', label: 'Pounds', ratio: 0.453592 },
    { id: 'oz', label: 'Ounces', ratio: 0.0283495 },
    { id: 't', label: 'Tons', ratio: 1000 }
  ]},
  { id: 'temp', label: 'Temperature', icon: <Thermometer className="h-4 w-4" />, units: [
    { id: 'c', label: 'Celsius', ratio: 1 },
    { id: 'f', label: 'Fahrenheit', ratio: 1 },
    { id: 'k', label: 'Kelvin', ratio: 1 }
  ]}
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
      if (from === 'f') c = (value - 32) * 5/9;
      if (from === 'k') c = value - 273.15;
      
      if (to === 'c') return c;
      if (to === 'f') return c * 9/5 + 32;
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
    <div className="min-h-screen bg-background text-foreground theme-utility transition-colors duration-500 overflow-x-hidden">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

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
                  Unit <span className="text-primary italic">Converter</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Versatile Measurement Transformer · High Precision
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-8">
                
                {/* Category Selector */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setCat(c.id); setFromUnit(c.units[0].id); }}
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px] ${
                        cat === c.id ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.05]' : 'bg-muted/5 border-border/30 text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                      }`}
                    >
                      {c.icon}
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Input Card */}
                <Card className="glass-morphism border-primary/10 rounded-3xl shadow-xl bg-muted/5 p-8 border-2 border-primary/5">
                  <CardContent className="p-0 flex flex-col md:flex-row gap-6 items-end">
                     <div className="flex-1 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Value</p>
                        <input 
                          type="number" 
                          value={val} 
                          onChange={(e) => setVal(e.target.value)}
                          className="w-full bg-zinc-950/40 border border-primary/10 rounded-2xl px-6 h-14 text-sm font-bold focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/30 transition-all shadow-inner"
                        />
                     </div>
                     <div className="w-48 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">From</p>
                        <select 
                          value={fromUnit} 
                          onChange={(e) => setFromUnit(e.target.value)}
                          className="w-full bg-zinc-950/40 border border-primary/10 rounded-2xl px-4 h-14 text-sm font-black uppercase tracking-tighter focus:outline-none focus:border-primary/40 text-foreground transition-all shadow-inner"
                        >
                           {currentCat.units.map(u => (
                             <option key={u.id} value={u.id} className="bg-background">{u.label}</option>
                           ))}
                        </select>
                     </div>
                  </CardContent>
                </Card>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {currentCat.units.map(u => {
                     const result = convert(parseFloat(val) || 0, fromUnit, u.id);
                     const formatted = result.toLocaleString(undefined, { maximumFractionDigits: 6 });
                     
                     return (
                       <Card key={u.id} className={`glass-morphism border-primary/10 rounded-2xl shadow-lg bg-muted/5 transition-all group overflow-hidden ${u.id === fromUnit ? 'opacity-40 pointer-events-none' : ''}`}>
                          <CardContent className="p-6 flex items-center justify-between gap-4 relative overflow-hidden">
                             <div className="flex-1 overflow-hidden relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">{u.label}</p>
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
                  <AdPlaceholder format="banner" className="opacity-40 grayscale hover:grayscale-0 transition-all border-border/50" />
                </div>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-3xl overflow-hidden shadow-xl border-2 border-primary/5">
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
                          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 transition-transform group-hover:scale-110">
                            <Zap className="h-4 w-4" /> 
                          </div>
                          <span>Local Arithmetic</span>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-primary/10 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                      <AdPlaceholder format="rectangle" className="border-border/50" />
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
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
    </div>
  );
};

export default UnitConverter;
