import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Copy, Trash2, FileJson, Check, AlertCircle, Maximize2, Minimize2, Code, Zap, Undo, Redo, ShieldCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";

const JsonForge = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [lastValid, setLastValid] = useState<string | null>(null);
  const [autoPrettify, setAutoPrettify] = useState(false);

  // 10-step Undo Stack
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleInput(e.target?.result as string);
      toast.success("JSON Artifact Staged");
    };
    reader.readAsText(file);
  };

  usePasteFile(handleFile);

  // Smart Validation Effect
  useEffect(() => {
    if (!input.trim()) {
      setError(null);
      setIsValid(false);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setError(null);
      setIsValid(true);
      setLastValid(input);

      // Auto-prettify only if valid and not already pretty
      if (autoPrettify) {
        const pretty = JSON.stringify(parsed, null, 2);
        if (pretty !== input) {
          const tid = setTimeout(() => {
            handleInput(pretty, true);
            toast.success("Auto-Prettified");
          }, 800);
          return () => clearTimeout(tid);
        }
      }
    } catch (e: any) {
      setError(e.message);
      setIsValid(false);
    }
  }, [input, autoPrettify]);

  const handleInput = (val: string, skipHistory = false) => {
    if (!skipHistory && val !== input) {
      setHistory(prev => {
        const next = prev.slice(0, historyIndex + 1);
        next.push(val);
        if (next.length > 10) next.shift();
        return next;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 9));
    }
    setInput(val);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setInput(history[newIdx]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setInput(history[newIdx]);
    }
  };

  const restoreValid = () => {
    if (lastValid) {
      handleInput(lastValid);
      toast.success("Restored last known valid state");
    }
  };

  const formatJson = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      handleInput(JSON.stringify(parsed, null, 2));
      toast.success("JSON Architecture Prettified");
    } catch (e: any) {
      toast.error("Invalid JSON Syntax");
    }
  };

  const minifyJson = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      handleInput(JSON.stringify(parsed));
      toast.success("JSON Mass Minified");
    } catch (e: any) {
      toast.error("Invalid JSON Syntax");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
    toast.success("Copied to Clipboard");
  };

  const clearInput = () => {
    handleInput("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-utility transition-all duration-500 overflow-x-hidden">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-12 grow overflow-visible">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border dark:border-white/20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all group/back bg-background/80 dark:bg-black/60 shadow-xl dark:shadow-2xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-foreground dark:text-white text-shadow-glow">
                  JSON <span className="text-primary italic">Studio</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 text-[10px]">Professional Data Architecture & Validation</p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
              <AdBox height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-12 items-start overflow-visible">
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl group flex flex-col min-h-[600px]">

                  {/* VS Code Style Header */}
                  <div className="px-4 pt-3 border-b border-border dark:border-white/5 flex items-end justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2 items-center bg-white dark:bg-[#111111] px-4 py-2 rounded-t-lg border-x border-t border-border dark:border-white/5 relative z-10 -mb-[1px] transition-all hover:bg-zinc-50 dark:hover:bg-[#151515]">
                        <FileJson className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400 italic">dataset.json</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white hover:bg-primary/10 dark:hover:bg-white/10 rounded-2xl transition-colors" onClick={undo} disabled={historyIndex <= 0}>
                        <Undo className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white hover:bg-primary/10 dark:hover:bg-white/10 rounded-2xl transition-colors" onClick={redo} disabled={historyIndex >= history.length - 1}>
                        <Redo className="h-3.5 w-3.5" />
                      </Button>
                      <div className="w-[1px] h-4 bg-border dark:bg-white/10 mx-1" />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white hover:bg-primary/10 dark:hover:bg-white/10 rounded-2xl transition-colors" onClick={copyToClipboard} disabled={!input}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/70 hover:text-destructive dark:text-destructive/50 dark:hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/10 rounded-2xl transition-colors" onClick={clearInput} disabled={!input}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 flex overflow-hidden bg-white dark:bg-black min-h-[500px] relative z-0">
                    {/* Line Numbers Gutter */}
                    <div className="w-12 bg-zinc-50 dark:bg-[#050505] border-r border-border dark:border-white/5 flex flex-col py-6 items-center font-mono text-[10px] text-muted-foreground/50 dark:text-zinc-600 select-none min-h-[500px]">
                      {Array.from({ length: Math.max(1, input.split('\n').length) }).map((_, i) => (
                        <div key={i} className="leading-relaxed h-6">{i + 1}</div>
                      ))}
                    </div>

                    <textarea
                      value={input}
                      onChange={(e) => handleInput(e.target.value)}
                      placeholder='{\n  "status": "ready",\n  "data": []\n}'
                      className="flex-1 w-full h-full min-h-[500px] bg-transparent p-6 font-mono text-sm text-orange-700 dark:text-[#ce9178] resize-none outline-none selection:bg-primary/20 dark:selection:bg-primary/30 leading-relaxed scrollbar-hide custom-scrollbar whitespace-pre-wrap break-words"
                      spellCheck={false}
                    />

                    {error && (
                      <div className="absolute bottom-0 inset-x-0 p-4 bg-destructive/10 border-t border-destructive/20 text-destructive flex items-start gap-3 animate-in slide-in-from-bottom-4 z-30 backdrop-blur-md">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">Syntax Error</p>
                          <p className="text-[10px] font-medium opacity-80">{error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Button onClick={formatJson} disabled={!isValid} className="h-20 text-lg font-black rounded-2xl gap-3 shadow-xl dark:shadow-2xl shadow-primary/20 dark:shadow-primary/20 italic uppercase tracking-tight text-white">
                    <Maximize2 className="h-6 w-6" /> Prettify Code
                  </Button>
                  <Button onClick={minifyJson} disabled={!isValid} variant="secondary" className="h-20 text-lg font-black rounded-2xl gap-3 italic uppercase border border-border dark:border-white/10 bg-secondary/50 dark:bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    <Minimize2 className="h-6 w-6" /> Mass Minify
                  </Button>
                </div>
              </div>

              <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
                <Card className="glass-morphism border-border dark:border-primary/10 rounded-2xl overflow-hidden shadow-lg dark:shadow-xl bg-card border-2 dark:border-primary/5">
                  <div className="bg-primary/5 dark:bg-primary/10 p-5 border-b border-border dark:border-primary/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Status Console</h3>
                    {!error && input.length > 0 && <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest animate-pulse"><Check className="h-3 w-3" /> Valid Architecture</span>}
                  </div>
                  <CardContent className="p-8 space-y-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 dark:bg-black/40 p-5 rounded-2xl border border-border dark:border-white/5 shadow-inner">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:opacity-40 mb-1 leading-none">Characters</p>
                        <p className="text-2xl font-black italic tracking-tighter text-foreground dark:text-white">{input.length}</p>
                      </div>
                      <div className="bg-muted/50 dark:bg-black/40 p-5 rounded-2xl border border-border dark:border-white/5 shadow-inner">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:opacity-40 mb-1 leading-none">Lines</p>
                        <p className="text-2xl font-black italic tracking-tighter text-foreground dark:text-white">{input.split('\n').length}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/30 dark:bg-background/20 rounded-2xl border border-border dark:border-white/5 shadow-sm">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-foreground dark:text-white italic"><Wand2 className="h-3.5 w-3.5" /> Auto-Prettify</Label>
                          <p className="text-[9px] text-muted-foreground uppercase font-black dark:opacity-30">Format while typing</p>
                        </div>
                        <Switch checked={autoPrettify} onCheckedChange={setAutoPrettify} />
                      </div>

                      <Button
                        onClick={restoreValid}
                        disabled={!lastValid || isValid}
                        variant="outline"
                        className="w-full h-12 gap-2 text-xs font-black uppercase tracking-widest border-border dark:border-border/50 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-500 hover:border-emerald-500/30 transition-all rounded-xl"
                      >
                        <ShieldCheck className="h-4 w-4" /> Restore Last Valid State
                      </Button>
                    </div>

                    <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest dark:opacity-30 italic leading-relaxed">V8 native parsing • ECMA-404 compliant • Recursive deep-scan</p>
                  </CardContent>
                </Card>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="JSON Studio Forge"
              description="The JSON Studio is a high-speed data architecture utility designed to validate, prettify, and minify complex JSON structures with ECMA-404 compliance."
              transparency="Our validation engine runs entirely on your browser's local V8 JavaScript thread. Whether you're debugging a sensitive API response or formatting a configuration file, your data environment is fully isolated from our servers, ensuring zero leakage of proprietary schemas."
              limitations="While the Studio can handle multi-megabyte JSON payloads, attempting to 'Prettify' an extraordinarily large single-line file (e.g., 50MB+) may cause the browser's UI thread to lock as it calculates thousands of line breaks and indentations. For massive data dumps, we recommend using a CLI-based tool like jq."
              accent="indigo"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />

      {/* Mobile Sticky Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-background/80 dark:bg-black/80 backdrop-blur-sm border-t border-border dark:border-white/10 py-2 h-[66px] overflow-hidden">
        <AdBox height={50} label="320x50 ANCHOR AD" className="w-full" />
      </div>
    </div>
  );
};

export default JsonForge;