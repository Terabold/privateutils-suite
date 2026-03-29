import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Copy, Trash2, FileJson, Check, AlertCircle, Maximize2, Minimize2, Code, Zap, Undo, Redo, ShieldCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";

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
      
      // Auto-prettify only if valid and not already pretty (to avoid cursor jumping constantly)
      if (autoPrettify) {
        const pretty = JSON.stringify(parsed, null, 2);
        if (pretty !== input) {
           // We use a small timeout to allow the user to finish typing a char before jumping
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
          if (next.length > 10) next.shift(); // 10-step history limit
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
                   JSON <span className="text-primary italic">Forge</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Data Architecture & Validation Engine</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card className="glass-morphism border-primary/10 overflow-hidden relative bg-zinc-950 shadow-2xl rounded-2xl group">
                <div className="absolute top-4 left-4 flex gap-2 z-20">
                   <Button size="icon" variant="ghost" className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl" onClick={undo} disabled={historyIndex <= 0}>
                      <Undo className="h-4 w-4" />
                   </Button>
                   <Button size="icon" variant="ghost" className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl" onClick={redo} disabled={historyIndex >= history.length - 1}>
                      <Redo className="h-4 w-4" />
                   </Button>
                </div>
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                   <Button size="icon" variant="ghost" className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl" onClick={copyToClipboard} disabled={!input}>
                      <Copy className="h-4 w-4" />
                   </Button>
                   <Button size="icon" variant="ghost" className="h-10 w-10 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-2xl" onClick={clearInput} disabled={!input}>
                      <Trash2 className="h-4 w-4" />
                   </Button>
                </div>

                <textarea
                  value={input}
                  onChange={(e) => handleInput(e.target.value)}
                  placeholder='Paste your JSON artifact here...'
                  className="w-full h-[600px] bg-transparent pt-20 px-10 pb-20 font-mono text-sm text-primary/90 resize-none outline-none selection:bg-primary/30 leading-relaxed"
                  spellCheck={false}
                />

                {error && (
                  <div className="absolute bottom-0 inset-x-0 p-6 bg-destructive/10 border-t border-destructive/20 text-destructive flex items-start gap-3 animate-in slide-in-from-bottom-4">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Syntax Error Detected</p>
                      <p className="text-xs font-medium opacity-80">{error}</p>
                    </div>
                  </div>
                )}
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <Button onClick={formatJson} disabled={!isValid} className="h-20 text-lg font-black rounded-2xl gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tight">
                    <Maximize2 className="h-6 w-6" /> Prettify Code
                 </Button>
                 <Button onClick={minifyJson} disabled={!isValid} variant="secondary" className="h-20 text-lg font-black rounded-2xl gap-3 italic uppercase border border-border/50">
                    <Minimize2 className="h-6 w-6" /> Mass Minify
                 </Button>
              </div>
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                 <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Status Console</h3>
                   {!error && input.length > 0 && <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest"><Check className="h-3 w-3" /> Valid</span>}
                 </div>
                 <CardContent className="p-8 space-y-10">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-muted/5 p-5 rounded-2xl border border-border/50">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">Characters</p>
                          <p className="text-2xl font-black italic tracking-tighter text-foreground">{input.length}</p>
                       </div>
                       <div className="bg-muted/5 p-5 rounded-2xl border border-border/50">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">Lines</p>
                          <p className="text-2xl font-black italic tracking-tighter text-foreground">{input.split('\n').length}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border/50">
                          <div className="space-y-0.5">
                            <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><Wand2 className="h-3.5 w-3.5"/> Auto-Prettify</Label>
                            <p className="text-[9px] text-muted-foreground uppercase font-medium">Format while typing</p>
                          </div>
                          <Switch checked={autoPrettify} onCheckedChange={setAutoPrettify} />
                       </div>
                       
                       <Button 
                          onClick={restoreValid} 
                          disabled={!lastValid || isValid} 
                          variant="outline" 
                          className="w-full h-12 gap-2 text-xs font-black uppercase tracking-widest border-border/50 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                       >
                          <ShieldCheck className="h-4 w-4" /> Restore Last Valid State
                       </Button>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5" /> High-Density Logic
                       </h4>
                       <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-80 font-medium">
                         Your code is parsed locally using the browser's native V8 engine for instant validation. No data reaches external servers.
                       </p>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-muted-foreground/60 transition-colors hover:text-foreground">
                          <Code className="h-4 w-4" />
                          <span className="text-xs font-medium italic">Standard ECMA-404 Compliant</span>
                       </div>
                       <div className="flex items-center gap-3 text-muted-foreground/60 transition-colors hover:text-foreground">
                          <Brain className="h-4 w-4" />
                          <span className="text-xs font-medium italic">Recursive Object Deep-Scan</span>
                       </div>
                    </div>
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

export default JsonForge;
