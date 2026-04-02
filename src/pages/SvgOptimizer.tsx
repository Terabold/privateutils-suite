import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Download, FileCode, Check, AlertCircle, Trash2, Copy, FileText, Sparkles, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";
// @ts-ignore
import { optimize } from "svgo/browser";

const SvgOptimizer = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [input, setInput] = useState("");
  const [optimized, setOptimized] = useState("");
  const [stats, setStats] = useState<{ original: number; optimized: number } | null>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "image/svg+xml" && !file.name.endsWith(".svg")) {
       toast.error("Format mismatch. Deploy SVG artifact only.");
       return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setInput(e.target?.result as string);
      toast.success("SVG Artifact Staged");
    };
    reader.readAsText(file);
  };

  usePasteFile(handleFile);

  const optimizeSvg = () => {
    try {
      if (!input.trim()) return;
      
      let result;
      try {
        result = optimize(input, {
          multipass: true,
          floatPrecision: 2,
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  removeViewBox: false, 
                },
              },
            } as any,
            "removeDimensions",
            "prefixIds"
          ] as any
        });
      } catch (innerErr: any) {
        toast.error(`Invalid SVG Code: ${innerErr.message || "Parse Error"}`);
        return;
      }

      setOptimized(result.data);
      setStats({
        original: new Blob([input]).size,
        optimized: new Blob([result.data]).size
      });
      toast.success("SVG Optimization Mastered");
    } catch (e: any) {
      toast.error(`Optimization Failed: ${e.message || "Invalid XML/SVG"}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(optimized || input);
    toast.success("Copied to Clipboard");
  };

  const downloadSvg = () => {
    const blob = new Blob([optimized], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Optimized Asset Dispatched");
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-image transition-all duration-500">
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
                   SVG <span className="text-primary italic">Optimizer</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Professional-Grade SVG Code Minification</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card className="glass-morphism border-primary/10 overflow-hidden relative bg-black shadow-2xl rounded-2xl group flex flex-col min-h-[500px]">
                 <div className="bg-[#0a0a0a] px-4 py-2 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="flex gap-1.5 items-center bg-[#111111] px-4 py-2 rounded-t-lg border-x border-t border-white/5 -mb-[9px] relative z-10">
                          <FileCode className="h-3.5 w-3.5 text-orange-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">source.svg</span>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => { navigator.clipboard.writeText(input); toast.success("Source Copied"); }} disabled={!input}>
                          <Copy className="h-3.5 w-3.5" />
                       </Button>
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" onClick={() => { setInput(""); setOptimized(""); setStats(null); }} disabled={!input}>
                          <Trash2 className="h-3.5 w-3.5" />
                       </Button>
                    </div>
                 </div>
                 
                 <div className="flex-1 flex overflow-hidden">
                    {/* Line Numbers Gutter */}
                    <div className="w-12 bg-[#050505] border-r border-white/5 flex flex-col py-6 items-center font-mono text-[10px] text-zinc-600 select-none">
                       {Array.from({ length: Math.max(1, input.split('\n').length) }).map((_, i) => (
                          <div key={i} className="leading-relaxed h-6">{i + 1}</div>
                       ))}
                    </div>
                    
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder='Paste SVG code or XML artifact here...'
                      className="flex-1 bg-transparent p-6 font-mono text-sm text-[#ce9178] resize-none outline-none selection:bg-primary/30 leading-relaxed scrollbar-hide custom-scrollbar"
                      spellCheck={false}
                    />
                    <div className="absolute bottom-6 right-6">
                       <KbdShortcut />
                    </div>
                 </div>
              </Card>

              {optimized && (
                <Card className="glass-morphism border-primary/10 overflow-hidden relative bg-black shadow-2xl rounded-2xl animate-in zoom-in-95 duration-700 flex flex-col">
                   <div className="bg-[#0a0a0a] px-4 py-2 border-b border-white/5 flex items-center justify-between font-sans">
                      <div className="flex items-center gap-3">
                         <div className="flex gap-1.5 items-center bg-[#111111] px-4 py-2 rounded-t-lg border-x border-t border-white/5 -mb-[9px] relative z-10">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">optimized.svg</span>
                         </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-500/20">{((stats?.optimized || 0) / 1024).toFixed(2)} KB</span>
                   </div>
                   
                   <div className="flex-1 flex overflow-hidden">
                      <div className="w-12 bg-[#050505] border-r border-white/5 flex flex-col py-6 items-center font-mono text-[10px] text-zinc-700 select-none">
                         {Array.from({ length: Math.max(1, optimized.split('\n').length) }).map((_, i) => (
                            <div key={i} className="leading-relaxed h-6">{i + 1}</div>
                         ))}
                      </div>
                      <div className="flex-1 p-6 font-mono text-sm text-emerald-400 overflow-auto select-all custom-scrollbar bg-black/40 leading-relaxed">
                         {optimized}
                      </div>
                   </div>
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <Button onClick={optimizeSvg} className="h-20 text-lg font-black rounded-2xl gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tight">
                    <Zap className="h-6 w-6" /> Minify SVG Code
                 </Button>
                 <Button onClick={downloadSvg} disabled={!optimized} variant="secondary" className="h-20 text-lg font-black rounded-2xl gap-3 italic uppercase border border-border/50">
                    <Download className="h-6 w-6" /> Download .SVG File
                 </Button>
              </div>
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                 <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Performance Metrics</h3>
                   {input && (
                     <Button 
                       onClick={() => { setInput(""); setOptimized(""); setStats(null); }} 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all"
                     >
                       Reset Stage
                     </Button>
                   )}
                 </div>
                 <CardContent className="p-8 space-y-10">
                    {stats && (
                      <div className="space-y-6 animate-in slide-in-from-top-4">
                         <div className="flex justify-between items-end">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Reduction Ratio</p>
                            <p className="text-3xl font-black italic tracking-tighter text-emerald-500">
                               {Math.round((1 - stats.optimized / stats.original) * 100)}%
                            </p>
                         </div>
                         <Progress value={(stats.optimized / stats.original) * 100} className="h-3 w-full bg-emerald-500/10" />
                      </div>
                    )}

                    <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic pt-4">
                      W3C Compliant • Non-Destructive • Bloat Stripped
                    </p>

                    <Button variant="ghost" onClick={copyToClipboard} className="w-full gap-2 h-14 border border-border/50 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                       <Copy className="h-4 w-4" /> Copy SVG Code
                    </Button>
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

export default SvgOptimizer;

