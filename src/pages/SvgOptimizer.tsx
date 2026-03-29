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
                   SVG <span className="text-primary italic">Optimizer</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">High-Efficiency Vector Minification Lab</p>
              </div>
            </div>
            {input && (
               <Button onClick={() => { setInput(""); setOptimized(""); setStats(null); }} variant="ghost" size="sm" className="gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-2xl transition-all">
                  Wipe Stage
               </Button>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card className="glass-morphism border-primary/10 overflow-hidden relative bg-zinc-950 shadow-2xl rounded-2xl group">
                 <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <FileCode className="h-4 w-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground opacity-60">Source Artifact</span>
                    </div>
                    {input.length > 0 && <span className="text-[10px] font-black uppercase tracking-widest text-primary">{(new Blob([input]).size / 1024).toFixed(2)} KB</span>}
                 </div>
                 <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Paste SVG code or XML artifact here...'
                  className="w-full h-[400px] bg-transparent p-10 font-mono text-sm text-primary/90 resize-none outline-none selection:bg-primary/30 leading-relaxed scrollbar-hide"
                  spellCheck={false}
                 />
              </Card>

              {optimized && (
                <Card className="glass-morphism border-primary/10 overflow-hidden relative bg-zinc-950 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-700">
                   <div className="bg-emerald-500/5 p-4 border-b border-emerald-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Sparkles className="h-4 w-4 text-emerald-500" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-foreground opacity-60">Optimized Artifact</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{((stats?.optimized || 0) / 1024).toFixed(2)} KB</span>
                   </div>
                   <div className="p-10 font-mono text-sm text-emerald-500/90 h-[200px] overflow-auto select-all custom-scrollbar bg-black/50 overflow-x-auto text-left whitespace-pre-wrap break-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20" suppressContentEditableWarning>
                      {optimized}
                   </div>
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <Button onClick={optimizeSvg} className="h-20 text-lg font-black rounded-2xl gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tight">
                    <Zap className="h-6 w-6" /> Purge Metadata
                 </Button>
                 <Button onClick={downloadSvg} disabled={!optimized} variant="secondary" className="h-20 text-lg font-black rounded-2xl gap-3 italic uppercase border border-border/50">
                    <Download className="h-6 w-6" /> Export Minified
                 </Button>
              </div>
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                 <div className="bg-primary/5 p-5 border-b border-primary/10">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Efficiency Logic</h3>
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

                    <div className="p-6 rounded-2xl bg-zinc-950/50 border border-border/50 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Layout className="h-3.5 w-3.5" /> Bit-Stream Scrubbing
                       </h4>
                       <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-80 font-medium font-sans">
                         This tool removes redundant <strong className="font-bold">Inkscape</strong>, <strong className="font-bold">Illustrator</strong>, and <strong className="font-bold">Sodipodi</strong> namespaces that bloat vector files without affecting visual rendering.
                       </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/20">
                       <div className="flex items-center gap-4 text-muted-foreground/60 transition-colors hover:text-foreground group cursor-default">
                          <Check className="h-4 w-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">W3C Compliant</span>
                       </div>
                       <div className="flex items-center gap-4 text-muted-foreground/60 transition-colors hover:text-foreground group cursor-default">
                          <AlertCircle className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Non-Destructive</span>
                       </div>
                    </div>

                    <Button variant="ghost" onClick={copyToClipboard} className="w-full gap-2 h-14 border border-border/50 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                       <Copy className="h-4 w-4" /> Copy Master Code
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

