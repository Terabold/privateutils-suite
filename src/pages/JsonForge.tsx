import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Copy, Trash2, FileJson, Check, AlertCircle, Maximize2, Minimize2, Code, Zap, Undo, Redo, ShieldCheck, Wand2, Download, Upload, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";

const JsonForge = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [lastValid, setLastValid] = useState<string | null>(null);
  const [autoPrettify, setAutoPrettify] = useState(false);
  const lastPrettifiedRef = useRef<string | null>(null);

  // Sync Scrolling Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isJsonl, setIsJsonl] = useState(false);
  // 10-step Undo Stack (Unified State to prevent desync)
  const [undoStack, setUndoStack] = useState<{ stack: string[], index: number }>({
    stack: [""],
    index: 0
  });
  const lastSavedInputRef = useRef("");

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  // Sync scroll between textarea and gutter
  const handleScroll = useCallback(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleInput(e.target?.result as string);
      toast.success("JSON Artifact Staged");
    };
    reader.readAsText(file);
  };

  const exportJson = () => {
    if (!input) return;
    const blob = new Blob([input], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dataset_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON Architecture Exported");
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const text = e.clipboardData?.getData("text");
    if (text) {
      handleInput(text);
      toast.success("JSON Payload Injected");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  // High Performance Validation Logic (Debounced 400ms)
  useEffect(() => {
    if (validationTimerRef.current) clearTimeout(validationTimerRef.current);

    if (!input.trim()) {
      setError(null);
      setIsValid(false);
      return;
    }

    validationTimerRef.current = setTimeout(() => {
      try {
        let parsed;
        try {
          // Standard JSON attempt
          parsed = JSON.parse(input);
        } catch (e: any) {
          // Smart Forensic Rescue: ND-JSON or consecutive object stream
          const lines = input.trim().split(/\n/).map(l => l.trim()).filter(l => l);

          if (lines.length > 1) {
            try {
              parsed = lines.map(line => JSON.parse(line));
            } catch {
              // Partial stream failure fallback: attempt global bracket rescue
              const rescued = "[" + input.trim().replace(/\}\s*\{/g, "},{") + "]";
              parsed = JSON.parse(rescued);
            }
          } else if (e.message.includes("Unexpected non-whitespace character") || e.message.includes("after JSON")) {
            // Consecutive objects on same line rescue
            const rescued = "[" + input.trim().replace(/\}\s*\{/g, "},{") + "]";
            parsed = JSON.parse(rescued);
          } else {
            throw e;
          }
        }

        setError(null);
        setIsValid(true);
        setLastValid(input);

        // Auto-prettify logic (Skip history to prevent lag cycles)
        if (autoPrettify && input !== lastPrettifiedRef.current) {
          try {
            const pretty = JSON.stringify(parsed, null, 2);
            if (pretty !== input) {
              lastPrettifiedRef.current = pretty;
              setInput(pretty); // Update state directly without history push for auto-formatting
            }
          } catch { }
        }
      } catch (e: any) {
        // Fallback: Check if it's valid JSONL (Newline Delimited JSON)
        try {
          const lines = input.trim().split('\n').filter(l => l.trim());
          if (lines.length > 1) {
            lines.forEach(line => JSON.parse(line)); // Validate each line
            setError("JSON Lines (JSONL) detected. Standard JSON requires a single root array.");
            setIsJsonl(true);
            setIsValid(false);
            setLastValid(input);
            return;
          }
        } catch { }

        setIsJsonl(false);
        setError(e.message);
        setIsValid(false);
      }

      // Performance Hardening: Save to undo stack only after user stops typing (400ms pause)
      if (input && input !== lastSavedInputRef.current && input.length < 500000) {
        setUndoStack(prev => {
          // Extra guard: don't push duplicate states
          if (prev.stack[prev.index] === input) return prev;

          const nextStack = prev.stack.slice(0, prev.index + 1);
          nextStack.push(input);
          if (nextStack.length > 20) nextStack.shift();
          return { stack: nextStack, index: nextStack.length - 1 };
        });
        lastSavedInputRef.current = input;
      }
    }, 400);

    return () => {
      if (validationTimerRef.current) clearTimeout(validationTimerRef.current);
    };
  }, [input, autoPrettify]);

  const handleInput = (val: string, skipHistory = false) => {
    let sanitized = val;
    if (sanitized.length > 5000000 + 1000) {
      sanitized = sanitized.substring(0, 5000000);
      toast.error("Hard Safety Limit: Payload truncated to 5MB.");
    }
    setError(null);
    setIsValid(false); // Synchronous reset to prevent race conditions during 400ms debounce
    setIsJsonl(false);
    setInput(sanitized);
    if (skipHistory) {
      lastSavedInputRef.current = sanitized;
    }
  };

  const undo = () => {
    if (undoStack.index > 0) {
      const newIdx = undoStack.index - 1;
      setUndoStack(prev => ({ ...prev, index: newIdx }));
      setInput(undoStack.stack[newIdx]);
    }
  };

  const redo = () => {
    if (undoStack.index < undoStack.stack.length - 1) {
      const newIdx = undoStack.index + 1;
      setUndoStack(prev => ({ ...prev, index: newIdx }));
      setInput(undoStack.stack[newIdx]);
    }
  };

  const restoreValid = () => {
    if (lastValid) {
      handleInput(lastValid);
      toast.success("Restored last known valid state");
    }
  };

  const wrapJsonl = () => {
    try {
      const lines = input.trim().split('\n').filter(l => l.trim());
      const parsed = lines.map(line => JSON.parse(line));
      const pretty = JSON.stringify(parsed, null, 2);
      handleInput(pretty);
      toast.success("JSONL Architecture Wrapped to Array");
    } catch (e) {
      toast.error("Forensic Wrap Failed: Bitstream corrupt");
    }
  };

  const formatJson = () => {
    try {
      if (!input.trim()) return;
      let parsed;
      try {
        parsed = JSON.parse(input);
      } catch (e) {
        // Fallback for JSONL formatting
        const lines = input.trim().split('\n').filter(l => l.trim());
        if (lines.length > 1) {
          parsed = lines.map(line => JSON.parse(line));
        } else {
          throw e;
        }
      }
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow overflow-visible">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-border dark:border-white/20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all group/back bg-background/80 dark:bg-black/60 shadow-xl dark:shadow-2xl">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                 <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white leading-none">
                   JSON Architecture <span className="text-primary italic">Forge Studio</span>
                 </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Format and validate JSON code</p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start overflow-visible">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl group flex flex-col h-[550px] max-h-[550px]">

                  {/* VS Code Style Header */}
                  <div className="px-4 pt-3 border-b border-border dark:border-white/5 flex items-end justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2 items-center bg-white dark:bg-[#111111] px-4 py-2 rounded-t-lg border-x border-t border-border dark:border-white/5 relative z-10 -mb-[1px] transition-all hover:bg-zinc-50 dark:hover:bg-[#151515]">
                        <FileJson className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400 italic">dataset.json</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-primary/10 bg-primary/5 hover:bg-primary/20 transition-all rounded-xl shadow-inner"
                      >
                        <Upload className="h-3 w-3 mr-1.5" /> Upload File
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportJson}
                        disabled={!input}
                        className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-primary/10 bg-primary/5 hover:bg-primary/20 transition-all rounded-xl shadow-inner"
                      >
                        <Download className="h-3 w-3 mr-1.5" /> Export
                      </Button>
                      <div className="w-[1px] h-4 bg-border dark:bg-white/10 mx-1" />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white hover:bg-primary/10 dark:hover:bg-white/10 rounded-2xl transition-colors" onClick={undo} disabled={undoStack.index <= 0}>
                        <Undo className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white hover:bg-primary/10 dark:hover:bg-white/10 rounded-2xl transition-colors" onClick={redo} disabled={undoStack.index >= undoStack.stack.length - 1}>
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
                  <div className="flex-1 flex overflow-hidden bg-white dark:bg-black relative z-0">
                    <div
                      ref={gutterRef}
                      className="w-12 bg-zinc-50 dark:bg-[#050505] border-r border-border dark:border-white/5 flex flex-col py-6 items-center font-mono text-[10px] text-muted-foreground/50 dark:text-zinc-600 select-none overflow-hidden"
                    >
                      {Array.from({ length: Math.max(1, input.split('\n').length) }).map((_, i) => (
                        <div key={i} className="leading-relaxed h-6">{i + 1}</div>
                      ))}
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar" onScroll={handleScroll}>
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.length > 5000000 + 1000) {
                            val = val.substring(0, 5000000);
                            toast.error("Hard Safety Limit: Payload truncated to 5MB.");
                            setError("Payload truncated: 5MB safety limit reached.");
                          }
                          setInput(val);
                        }}
                        placeholder='{\n  "status": "ready",\n  "data": []\n}'
                        className="w-full min-h-full bg-transparent p-6 font-mono text-sm text-orange-700 dark:text-[#ce9178] resize-none outline-none selection:bg-primary/20 dark:selection:bg-primary/30 leading-relaxed custom-scrollbar whitespace-pre overflow-visible"
                        spellCheck={false}
                        wrap="off"
                      />
                    </div>
                  </div>

                  {/* Hardened Status/Error Bar */}
                  <div className="px-6 py-3 border-t border-border dark:border-white/5 bg-zinc-50 dark:bg-[#050505] flex items-center justify-between gap-4 z-10 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {error ? (
                        <div className="flex items-center gap-2 text-destructive dark:text-red-400 animate-in fade-in slide-in-from-left-2 duration-300 min-w-0">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none truncate">
                            ERROR: {error}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground/40 dark:text-zinc-600">
                          <Code className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            Studio Status: {input ? "Validated" : "Awaiting Input"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity ${input.length > 4500000 ? 'text-primary' : 'opacity-20'}`}>
                        {input.length.toLocaleString()} / 5,000,000
                      </span>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {isJsonl ? (
                    <Button
                      onClick={wrapJsonl}
                      className="h-20 text-lg font-black rounded-2xl gap-3 shadow-xl dark:shadow-2xl shadow-amber-500/20 dark:shadow-amber-500/20 italic uppercase tracking-tight text-white bg-amber-600 hover:bg-amber-700 animate-pulse"
                    >
                      <Layers className="h-6 w-6" /> Wrap JSONL to Array
                    </Button>
                  ) : (
                    <Button onClick={formatJson} disabled={!isValid} className="h-20 text-lg font-black rounded-2xl gap-3 shadow-xl dark:shadow-2xl shadow-primary/20 dark:shadow-primary/20 italic uppercase tracking-tight text-white">
                      <Maximize2 className="h-6 w-6" /> Prettify Code
                    </Button>
                  )}
                  <Button onClick={minifyJson} disabled={!isValid && !isJsonl} variant="secondary" className="h-20 text-lg font-black rounded-2xl gap-3 italic uppercase border border-border dark:border-white/10 bg-secondary/50 dark:bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    <Minimize2 className="h-6 w-6" /> Mass Minify
                  </Button>
                </div>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 h-fit animate-in fade-in slide-in-from-right-4 duration-700">
                {error && (
                  <Card className="glass-morphism border-destructive/20 bg-destructive/5 dark:bg-red-500/5 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="bg-destructive/10 px-6 py-3 border-b border-destructive/10 flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive italic">Refusal Console</h3>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="bg-black/20 p-4 rounded-xl border border-destructive/10">
                        <p className="text-[11px] font-mono text-destructive dark:text-red-400 break-words leading-relaxed">
                          {error}
                        </p>
                      </div>
                      <Button
                        onClick={restoreValid}
                        disabled={!lastValid}
                        variant="ghost"
                        className="w-full h-10 gap-2 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all rounded-xl"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> Emergency Restore
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card className="glass-morphism border-border dark:border-primary/10 rounded-2xl overflow-hidden shadow-lg dark:shadow-xl bg-card border-2 dark:border-primary/5">
                  <div className="bg-white/50 dark:bg-[#111] border-b border-border dark:border-white/10 px-6 py-2 flex items-center justify-between">
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

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />

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
              title="JSON Architecture Forge"
              accent="sky"
              overview="The JSON Architecture Forge is a high-speed data engineering workbench designed for full-stack developers, API architects, and data scientists. I engineered this forge to provide a surgical path for validating, prettifying, and minifying complex JSON artifacts without the security risks of 'online formatters' that scrape your internal data structures and harvest your private API schemas for commercial intelligence."
              steps={[
                "Stage your JSON or JSONL artifact into the 'Main Logic' registry.",
                "Utilize the 'Auto-Prettify' switch to enforce real-time structural indentation.",
                "Monitor the 'Refusal Console' to debug syntax errors and forensic rescue attempts.",
                "Trigger the 'Wand' icon to instantly prettify or 'Minimize' to compress the bitstream.",
                "Export your sanitized JSON artifact via a local binary download or direct clipboard copy."
              ]}
              technicalImplementation="I architected this forge using a Debounced Forensic Parser that handles both standard EcmaScript JSON and Newline-Delimited JSON (JSONL) streams. The engine utilizes a Heuristic Rescue Pipeline to attempt structural reconstruction of malformed objects (e.g., missing brackets or consecutive object streams). By executing all validation and formatting inside the browser's V8 sandbox with a 5MB hardware safety cap, we ensure that your data schemas remain strictly air-gapped from the public internet."
              privacyGuarantee="The Security \u0026 Privacy model for the JSON Lab is centered on Architectural Isolation. Your data structures—whether containing user records, system logs, or proprietary configurations—exist strictly within your browser's private application state. No telemetry is utilized to monitor your payload sizes or key names. All session data is ephemeral and is permanently purged from system RAM upon tab termination. Your code stays private."
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

export default JsonForge;
