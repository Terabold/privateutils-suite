import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Download, FileCode, Check, AlertCircle, Trash2, Copy, FileText, Sparkles, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
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
    <div className="min-h-screen bg-background text-foreground theme-image transition-all duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-12 grow">
          <div className="flex flex-col gap-10">
            <header className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border dark:border-white/20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all group/back bg-background/80 dark:bg-black/60 shadow-xl dark:shadow-2xl">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-foreground dark:text-white text-shadow-glow">
                    SVG <span className="text-primary italic">Optimizer</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 text-[10px]">Professional-Grade SVG Code Minification</p>
                </div>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
              <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-12 items-start">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl group flex flex-col h-[600px]">

                  {/* VS Code Style Header */}
                  <div className="px-4 pt-3 border-b border-border dark:border-white/5 flex items-end justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5 items-center bg-white dark:bg-[#0e0e0e] px-5 py-2.5 rounded-t-xl border-x border-t border-border dark:border-white/10 relative z-20 -mb-[1px] transition-all hover:bg-zinc-50 dark:hover:bg-[#151515] shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
                        <FileCode className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400">source.svg</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 rounded-2xl transition-colors" onClick={() => { navigator.clipboard.writeText(input); toast.success("Source Copied"); }} disabled={!input}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/70 hover:text-destructive dark:text-destructive/50 dark:hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/10 rounded-2xl transition-colors" onClick={() => { setInput(""); setOptimized(""); setStats(null); }} disabled={!input}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 flex overflow-x-clip bg-white dark:bg-black min-h-[500px] relative z-0">
                    {/* Line Numbers Gutter */}
                    <div className="w-12 bg-zinc-50 dark:bg-[#050505] border-r border-border dark:border-white/5 flex flex-col py-6 items-center font-mono text-[10px] text-muted-foreground/50 dark:text-zinc-600 select-none">
                      {Array.from({ length: Math.max(1, input.split('\n').length) }).map((_, i) => (
                        <div key={i} className="leading-relaxed h-6">{i + 1}</div>
                      ))}
                    </div>

                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder='Paste SVG code or XML artifact here...'
                      className="flex-1 w-full h-full min-h-[500px] bg-transparent p-6 font-mono text-sm text-orange-700 dark:text-[#ce9178] resize-none outline-none selection:bg-primary/20 dark:selection:bg-primary/30 leading-relaxed scrollbar-hide custom-scrollbar whitespace-pre-wrap break-words"
                      spellCheck={false}
                    />
                  </div>
                </Card>

                {optimized && (
                  <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl animate-in zoom-in-95 duration-700 flex flex-col min-h-[400px]">

                    {/* VS Code Style Header */}
                    <div className="px-4 pt-3 border-b border-border dark:border-white/5 flex items-end justify-between font-sans relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5 items-center bg-white dark:bg-[#0e0e0e] px-5 py-2.5 rounded-t-xl border-x border-t border-border dark:border-white/10 relative z-20 -mb-[1px] transition-all hover:bg-zinc-50 dark:hover:bg-[#151515] shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
                          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400">optimized.svg</span>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <span className="text-[10px] font-mono text-emerald-600/60 dark:text-emerald-500/50 font-bold px-2">{((stats?.optimized || 0) / 1024).toFixed(2)} KB</span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="flex-1 flex overflow-x-clip bg-white dark:bg-black min-h-[400px] relative z-0">
                      <div className="w-12 bg-zinc-50 dark:bg-[#050505] border-r border-border dark:border-white/5 flex flex-col py-6 items-center font-mono text-[10px] text-muted-foreground/50 dark:text-zinc-700 select-none">
                        {Array.from({ length: Math.max(1, optimized.split('\n').length) }).map((_, i) => (
                          <div key={i} className="leading-relaxed h-6">{i + 1}</div>
                        ))}
                      </div>
                      <div className="flex-1 w-full h-full min-h-[400px] bg-transparent p-6 font-mono text-sm text-emerald-700 dark:text-emerald-400 overflow-auto select-all custom-scrollbar leading-relaxed selection:bg-emerald-500/20 whitespace-pre-wrap break-words">
                        {optimized}
                      </div>
                    </div>
                  </Card>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 -mt-2">
                  <Button onClick={optimizeSvg} className="h-16 text-lg font-black rounded-2xl gap-3 shadow-xl dark:shadow-2xl shadow-primary/10 dark:shadow-primary/20 italic uppercase tracking-tight text-white">
                    <Zap className="h-6 w-6" /> Minify SVG Code
                  </Button>
                  <Button onClick={downloadSvg} disabled={!optimized} variant="secondary" className="h-16 text-lg font-black rounded-2xl gap-3 italic uppercase border border-border/50 dark:border-white/10 bg-secondary/50 dark:bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    <Download className="h-6 w-6" /> Download .SVG File
                  </Button>
                </div>
              </div>

              <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
                <Card className="glass-morphism border-border dark:border-primary/10 rounded-2xl overflow-hidden shadow-lg dark:shadow-xl bg-card">
                  <div className="bg-primary/5 dark:bg-primary/10 p-5 border-b border-border dark:border-primary/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Performance Metrics</h3>
                  </div>
                  <CardContent className="p-8 space-y-10">
                    {stats && (
                      <div className="space-y-6 animate-in slide-in-from-top-4">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:opacity-40">Reduction Ratio</p>
                          <p className="text-3xl font-black italic tracking-tighter text-emerald-600 dark:text-emerald-500">
                            {Math.round((1 - stats.optimized / stats.original) * 100)}%
                          </p>
                        </div>
                        <Progress value={(stats.optimized / stats.original) * 100} className="h-3 w-full bg-emerald-500/10" />
                      </div>
                    )}

                    <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-60 dark:opacity-30 italic pt-4">
                      W3C Compliant • Non-Destructive • Bloat Stripped
                    </p>

                    <Button variant="ghost" onClick={copyToClipboard} className="w-full gap-2 h-14 border border-border dark:border-border/50 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-muted/30 dark:bg-transparent">
                      <Copy className="h-4 w-4" /> Copy SVG Code
                    </Button>
                  </CardContent>
                </Card>

              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Professional SVG Code Optimizer"
              description="The SVG Optimizer is a high-fidelity vector minification suite designed to strip metadata, hidden bloat, and redundant XML nodes from your SVG artifacts while preserving visual integrity."
              transparency="Our optimizer utilizes a specialized browser-build of SVGO (SVG Optimizer). Every pass, from multipass path simplification to ID prefixing, happens directly in your browser's V8 thread. Because the code is processed locally, your proprietary icons and vector illustrations never leave your device. We provide a 'Source vs Optimized' diff to ensure total transparency in the reduction ratio."
              limitations="While our minification engine is extremely thorough, some highly complex vector illustrations with nested filters or proprietary Adobe/Inkscape metadata may require custom SVGO plugins for maximum reduction. For most web use-cases, our default 'Preset-Default' provides the optimal balance of size and compatibility."
              accent="emerald"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />

      {/* Mobile Sticky Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-background/80 dark:bg-black/80 backdrop-blur-sm border-t border-border dark:border-white/10 py-2 h-[66px] overflow-x-clip">
        <AdBox adFormat="horizontal" height={50} label="320x50 ANCHOR AD" className="w-full" />
      </div>
    </div>
  );
};

export default SvgOptimizer;
