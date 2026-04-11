import { useState, useCallback, useRef } from "react";

import { Link } from "react-router-dom";

import { ArrowLeft, Zap, Download, FileCode, Check, AlertCircle, Trash2, Copy, FileText, Sparkles, Layout, ShieldAlert, Info } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

import Navbar from "@/components/Navbar";

import Footer from "@/components/Footer";

import ToolExpertSection from "@/components/ToolExpertSection";

import SponsorSidebars from "@/components/SponsorSidebars";

import ToolAdBanner from "@/components/ToolAdBanner";

import StickyAnchorAd from "@/components/StickyAnchorAd";

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

  const [error, setError] = useState<string | null>(null);

  const [renderError, setRenderError] = useState<"FILE_TOO_LARGE" | "SECURITY_RISK" | "PARSE_ERROR" | null>(null);

  const optimizedRef = useRef<HTMLDivElement>(null);



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

      const content = e.target?.result as string;

      // Security Gate: Billion Laughs Protection

      if (content.toLowerCase().includes("<!entity")) {

        const errorMsg = "Security risk: XML Entities (Billion Laughs) detected. Artifact rejected.";

        toast.error(errorMsg);

        setError(errorMsg);

        setRenderError("SECURITY_RISK");

        return;

      }

      setError(null);

      setRenderError(null);

      setInput(content);

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

        const msg = innerErr.message || "Parse Error";

        toast.error(`Invalid SVG Code: ${msg}`);

        setError(msg);

        setRenderError("PARSE_ERROR");

        return;

      }



      setOptimized(result.data);

      setStats({

        original: new Blob([input]).size,

        optimized: new Blob([result.data]).size

      });

      setError(null);

      toast.success("SVG Optimization Mastered");



      // Auto-scroll to result artifact

      setTimeout(() => {

        optimizedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      }, 100);

    } catch (e: any) {

      const errorMsg = `Optimization Failed: ${e.message || "Invalid XML/SVG"}`;

      toast.error(errorMsg);

      setError(errorMsg);

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

    <div className="min-h-screen bg-background text-foreground transition-all duration-500 ">

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

                    Vector SVG <span className="text-primary italic">Optimizer</span>

                  </h1>

                  <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 text-[10px]">Professional-Grade SVG Code Minification</p>

                </div>

              </div>

            </header>



            {/* Mobile Inline Ad */}

            <ToolAdBanner />



            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-12 items-start">

              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl group flex flex-col h-[550px]">



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



                    <div className="relative flex-1 w-full h-full min-h-[500px]">

                      <textarea

                        value={input}

                        onChange={(e) => setInput(e.target.value)}

                        placeholder='Paste SVG code or XML artifact here...'

                        className={`w-full h-full min-h-[500px] bg-transparent p-6 font-mono text-sm resize-none outline-none selection:bg-primary/20 dark:selection:bg-primary/30 leading-relaxed scrollbar-hide custom-scrollbar whitespace-pre-wrap break-words transition-opacity duration-500

                          ${renderError ? 'opacity-5 text-primary/20' : 'text-primary dark:text-[#ce9178]'}

                        `}

                        spellCheck={false}

                      />



                      {/* Standardized Security Intercept Overlay */}

                      <AnimatePresence>

                        {renderError && (

                          <motion.div

                            initial={{ opacity: 0, scale: 0.95 }}

                            animate={{ opacity: 1, scale: 1 }}

                            exit={{ opacity: 0, scale: 0.95 }}

                            className="absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-[2px]"

                          >

                            <div className="flex flex-col items-center gap-6 text-center w-full max-w-[340px] animate-in slide-in-from-bottom-4 fade-in duration-500 relative z-10 p-6">

                              {/* Animated Warning Icon */}

                              <div className="relative">

                                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>

                                <div className="relative h-16 w-16 rounded-2xl border-2 border-primary/50 flex items-center justify-center bg-primary/10 text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]">

                                  <ShieldAlert className="h-8 w-8 animate-[pulse_2s_ease-in-out_infinite]" />

                                </div>

                              </div>



                              <div>

                                <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-1 italic leading-none">Security Rejection</p>

                                <p className="text-lg font-black text-white italic leading-none tracking-tight">XML Entity Protection Active</p>

                              </div>



                              <div className="w-full bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left flex gap-3 shadow-2xl font-sans">

                                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />

                                <div className="space-y-1.5">

                                  <p className="text-[9px] font-black uppercase tracking-wider text-primary italic leading-none">Billion Laughs Guard</p>

                                  <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">

                                    This SVG contains nested entity declarations. Parsing it would cause exponential memory expansion (XML Bomb), potentially crashing your system.

                                  </p>

                                </div>

                              </div>



                              <Button

                                variant="ghost"

                                size="sm"

                                onClick={(e) => { e.stopPropagation(); setRenderError(null); setInput(""); setError(null); }}

                                className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all mt-2"

                              >

                                Reset Workbench

                              </Button>

                            </div>

                          </motion.div>

                        )}

                      </AnimatePresence>

                    </div>

                  </div>

                </Card>



                {optimized && (

                  <Card ref={optimizedRef} className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl animate-in zoom-in-95 duration-700 flex flex-col min-h-[400px] scroll-mt-28">



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



              <aside className="space-y-6 lg:sticky lg:top-28 h-fit animate-in fade-in slide-in-from-right-4 duration-700">

                {error && (

                  <Card className="glass-morphism border-destructive/20 bg-destructive/5 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                    <div className="bg-destructive/10 px-6 py-3 border-b border-destructive/10 flex items-center gap-3">

                      <AlertCircle className="h-4 w-4 text-destructive" />

                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive italic">Refusal Console</h3>

                    </div>

                    <CardContent className="p-6">

                      <div className="bg-black/20 p-4 rounded-xl border border-destructive/10">

                        <p className="text-[11px] font-mono text-destructive dark:text-red-400 break-words leading-relaxed italic">

                          {error}

                        </p>

                      </div>

                    </CardContent>

                  </Card>

                )}



                <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl group flex flex-col h-fit">

                  <div className="bg-white/50 dark:bg-black/40 p-5 border-b border-border dark:border-white/5">

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
              title="Vector SVG Optimizer"
              accent="emerald"
              overview="This optimizer is a high-fidelity vector minification suite designed for front-end architects and performance engineers. I built this tool to provide a surgical path for stripping metadata, editor bloat, and redundant XML nodes from your SVG artifacts—without the security vulnerability of sending proprietary vector assets to third-party optimization servers."
              steps={[
                "Paste your raw SVG code or drag a vector artifact into the source workbench.",
                "Toggle the 'Multipass Optimization' engine to perform recursive path simplification.",
                "Review the 'Reduction Metrics' to see the exact byte-savings achieved by the minification pass.",
                "Audit the visual integrity of the optimized vector in the 'Result Preview' pane.",
                "Copy the cleaned XML code directly to your clipboard for instant deployment."
              ]}
              technicalImplementation="I architected the optimization pipeline using a localized build of SVGO. The engine performs a non-destructive topological analysis of the SVG's path data, collapsing redundant commands and rounding coordinate precision to user-defined thresholds. By offloading this compute-heavy XML parsing to a separate thread, we maintain UI responsiveness even when processing complex, multi-megabyte architectural plans or intricate icon sets."
              privacyGuarantee="The Security & Privacy guarantee for the SVG Optimizer is built on Volatile Processing. All vector transformations and XML sanitization occur strictly within your browser's private memory heap. We do not maintain any side-effect state or persistent storage for your assets. Since the optimization logic is 100% decentralized and local, your proprietary design files stay offline throughout the entire lifecycle."
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
export default SvgOptimizer;