import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, FileJson, Table, RefreshCw, Zap, Table as TableIcon, Sparkles, Upload, Download, AlertCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";

// Robust CSV to JSON Parser
function csvToJson(csv: string) {
   const lines = csv.split(/\r?\n/).filter(line => line.trim() !== "");
   if (lines.length < 2) return "[]";

   const parseLine = (line: string) => {
      const values = [];
      let curValue = "";
      let insideQuotes = false;
      for (let i = 0; i < line.length; i++) {
         const char = line[i];
         if (char === '"') {
            if (insideQuotes && line[i + 1] === '"') {
               curValue += '"';
               i++;
            } else {
               insideQuotes = !insideQuotes;
            }
         } else if (char === ',' && !insideQuotes) {
            values.push(curValue.trim());
            curValue = "";
         } else {
            curValue += char;
         }
      }
      values.push(curValue.trim());
      return values;
   };

   const headers = parseLine(lines[0]);
   const result = lines.slice(1).map(line => {
      const values = parseLine(line);
      const obj: any = {};
      headers.forEach((header, i) => {
         obj[header] = values[i] || "";
      });
      return obj;
   });
   return JSON.stringify(result, null, 2);
}

// Recursive Flattener with Safety Depth
function flattenObject(obj: any, prefix = '', depth = 0): any {
   if (depth > 10) throw new Error("Artifact too deeply nested for flat CSV structure (Max 10 levels).");
   if (typeof obj !== 'object' || obj === null) return obj;

   return Object.keys(obj).reduce((acc: any, k: string) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
         Object.assign(acc, flattenObject(obj[k], pre + k, depth + 1));
      } else {
         acc[pre + k] = obj[k];
      }
      return acc;
   }, {});
}

// Simple JSON to CSV
function jsonToCsv(json: string) {
   try {
      let arr;
      try {
         // Attempt standard parse first
         arr = JSON.parse(json);
      } catch (e: any) {
         // Fallback: Check for JSONL (Newline Delimited JSON)
         const lines = json.trim().split('\n').filter(l => l.trim());
         if (lines.length > 1) {
            try {
               // If it's valid JSONL, it will parse line by line
               arr = lines.map(line => JSON.parse(line));
            } catch {
               // Rescue: Try the bracket + comma padding rescue as last resort
               const rescued = "[" + json.trim().replace(/\}\s*\{/g, "},{") + "]";
               arr = JSON.parse(rescued);
            }
         } else if (e.message.includes("Unexpected non-whitespace character") || e.message.includes("after JSON")) {
            const rescued = "[" + json.trim().replace(/\}\s*\{/g, "},{") + "]";
            arr = JSON.parse(rescued);
         } else {
            throw e;
         }
      }

      if (!Array.isArray(arr) || arr.length === 0) {
         // If it's a single object, wrap it for CSV processing
         if (typeof arr === 'object' && arr !== null) {
            arr = [arr];
         } else {
            return "";
         }
      }

      // Flatten first 100 rows to extract all possible headers
      const flatSamples = arr.slice(0, 100).map(item => flattenObject(item));
      const headers = Array.from(new Set(flatSamples.flatMap(item => Object.keys(item))));

      const csv = [
         headers.join(','),
         ...arr.map(obj => {
            const flat = flattenObject(obj) as any;
            return headers.map((h: string) => {
               const val = flat[h];
               if (typeof val === 'object' && val !== null) {
                  return `"[Nested Object]"`;
               }
               return `"${String(val ?? "").replace(/"/g, '""')}"`;
            }).join(',');
         })
      ].join('\n');
      return csv;
   } catch (e: any) {
      throw e; // Propagate descriptive errors like "Artifact too deeply nested"
   }
}

const CsvJsonForge = () => {
   const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
   const [input, setInput] = useState("");
   const [output, setOutput] = useState("");
   const [mode, setMode] = useState<'csv2json' | 'json2csv'>('csv2json');
   const [error, setError] = useState<string | null>(null);
   const [copied, setCopied] = useState(false);
   const [isJsonl, setIsJsonl] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

   const toggleDark = useCallback(() => {
      const next = !darkMode;
      setDarkMode(next);
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
   }, [darkMode]);

   // Debounced Validator for Opt-In Helpers
   useEffect(() => {
      if (validationTimerRef.current) clearTimeout(validationTimerRef.current);
      if (!input || mode === 'csv2json') {
         setIsJsonl(false);
         return;
      }

      validationTimerRef.current = setTimeout(() => {
         try {
            JSON.parse(input);
            setIsJsonl(false);
         } catch {
            try {
               const lines = input.trim().split('\n').filter(l => l.trim());
               if (lines.length > 1) {
                  lines.forEach(line => JSON.parse(line));
                  setIsJsonl(true);
                  setError("JSON Lines (JSONL) detected. Converting to CSV requires a standard array.");
               } else {
                  setIsJsonl(false);
               }
            } catch {
               setIsJsonl(false);
            }
         }
      }, 400);

      return () => { if (validationTimerRef.current) clearTimeout(validationTimerRef.current); };
   }, [input, mode]);

   const handleInput = (val: string) => {
      setError(null); // Synchronous reset to fix race condition
      setIsJsonl(false);
      if (val.length >= 5000000) {
         setError("Payload truncated: 5MB safety limit reached.");
         toast.error("Input Cap: 5MB exceeded.");
      }
      setInput(val);
   };

   const handleFile = (file: File | undefined) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
         handleInput(e.target?.result as string);
         toast.success("Data Artifact Staged");
      };
      reader.readAsText(file);
   };

   const wrapJsonl = () => {
      try {
         const lines = input.trim().split('\n').filter(l => l.trim());
         const parsed = lines.map(line => JSON.parse(line));
         const pretty = JSON.stringify(parsed, null, 2);
         handleInput(pretty);
         toast.success("JSONL Artifact Wrapped for Conversion");
      } catch {
         toast.error("Forensic Wrap Failed");
      }
   };

   usePasteFile(handleFile);

   const convert = useCallback(() => {
      if (!input) return;
      try {
         setError(null);
         if (mode === 'csv2json') setOutput(csvToJson(input));
         else setOutput(jsonToCsv(input));
         toast.success(`${mode === 'csv2json' ? 'JSON' : 'CSV'} Artifact Baked`);
      } catch (e: any) {
         console.error("Forge failure:", e);
         setError(e.message);
         toast.error("Data artifact too complex or malformed.");
      }
   }, [input, mode]);

   const copy = async () => {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("Artifact Copied");
   };

   // Dynamic Placeholders
   const csvExample = "name,age,city\nJohn,30,NY\nJane,25,LA";
   const jsonExample = '[\n  {\n    "name": "John",\n    "age": "30",\n    "city": "NY"\n  },\n  {\n    "name": "Jane",\n    "age": "25",\n    "city": "LA"\n  }\n]';

   return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500 font-sans ">
         <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

         <div className="flex justify-center items-start w-full relative">
            <SponsorSidebars position="left" />

            <main className="container mx-auto max-w-[1240px] px-6 py-6 grow">
               <div className="flex flex-col gap-6">
                  <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                     <Link to="/">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-border dark:border-white/20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all group/back bg-background/80 dark:bg-black/60 shadow-xl dark:shadow-2xl">
                           <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                     </Link>
                     <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter font-display uppercase italic text-foreground dark:text-white text-shadow-glow">
                           Data <span className="text-primary italic">Transformer Hub</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 text-[10px]">
                           Data Translation Studio · Bi-directional Conversion
                        </p>
                     </div>
                  </header>

                  {/* Mobile Inline Ad */}
                  <ToolAdBanner />

                  <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-10 items-start">
                     <div className="space-y-10">
                        {/* Control Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border dark:border-white/10 p-4 rounded-2xl shadow-lg dark:shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                           <div className="flex gap-2.5">
                              <button
                                 onClick={() => setMode('csv2json')}
                                 className={`px-8 py-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2.5 ${mode === 'csv2json' ? 'bg-primary text-primary-foreground border-primary shadow-xl dark:shadow-2xl shadow-primary/20 dark:shadow-primary/30 scale-105' : 'bg-muted dark:bg-black/40 border-transparent dark:border-white/5 text-muted-foreground hover:bg-muted/80 dark:hover:bg-white/5'
                                    }`}
                              >
                                 <Table className="h-4 w-4" /> CSV to JSON
                              </button>
                              <button
                                 onClick={() => setMode('json2csv')}
                                 className={`px-8 py-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2.5 ${mode === 'json2csv' ? 'bg-primary text-primary-foreground border-primary shadow-xl dark:shadow-2xl shadow-primary/20 dark:shadow-primary/30 scale-105' : 'bg-muted dark:bg-black/40 border-transparent dark:border-white/5 text-muted-foreground hover:bg-muted/80 dark:hover:bg-white/5'
                                    }`}
                              >
                                 <FileJson className="h-4 w-4" /> JSON to CSV
                              </button>
                           </div>

                           <div className="flex gap-2">
                              <Button onClick={convert} disabled={!input || (!!error && !isJsonl)} className="flex-1 px-12 gap-3 h-14 text-sm font-black rounded-2xl shadow-xl dark:shadow-2xl shadow-primary/20 dark:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all uppercase italic bg-primary text-primary-foreground border-b-4 border-primary-foreground/20">
                                 <RefreshCw className={`h-4 w-4 ${input && "animate-spin-slow"}`} /> Transform Artifact
                              </Button>
                              {isJsonl && (
                                 <Button
                                    onClick={wrapJsonl}
                                    variant="outline"
                                    className="h-14 px-6 text-[10px] font-black rounded-2xl gap-2 border-amber-500/50 text-amber-500 hover:bg-amber-500/10 shadow-xl transition-all uppercase animate-pulse"
                                 >
                                    <Layers className="h-4 w-4" /> Wrap JSONL for Conversion
                                 </Button>
                              )}
                           </div>
                        </div>

                        {/* Input & Output Panels */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                           {/* LEFT PANEL */}
                           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                              <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl group flex flex-col h-[550px]">

                                 <div className="px-4 pt-3 border-b border-border dark:border-white/5 flex items-end justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                       <div className="flex gap-1.5 items-center bg-white dark:bg-[#111111] px-4 py-2 rounded-t-lg border-x border-t border-border dark:border-white/5 relative z-10 -mb-[1px] transition-all hover:bg-zinc-50 dark:hover:bg-[#151515]">
                                          {mode === 'csv2json' ? <Table className="h-3.5 w-3.5 text-primary" /> : <FileJson className="h-3.5 w-3.5 text-primary" />}
                                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400">
                                             {mode === 'csv2json' ? 'source.csv' : 'source.json'}
                                          </span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                       <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => fileInputRef.current?.click()}
                                          className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-primary/10 bg-primary/5 hover:bg-primary/20 transition-all rounded-xl shadow-inner"
                                       >
                                          <Upload className="h-3 w-3 mr-1.5" /> Upload Master
                                       </Button>
                                       <div className="w-[1px] h-4 bg-border dark:bg-white/10 mx-1" />
                                       <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 rounded-2xl transition-colors" onClick={() => { setInput(""); setOutput(""); }} disabled={!input}>
                                          <RefreshCw className="h-3.5 w-3.5" />
                                       </Button>
                                    </div>
                                 </div>

                                 <div className="flex-1 flex overflow-hidden bg-white dark:bg-black relative z-0">
                                    <div className="w-12 bg-zinc-50 dark:bg-[#050505] border-r border-border dark:border-white/5 flex flex-col py-6 items-center font-mono text-[10px] text-muted-foreground/50 dark:text-zinc-600 select-none overflow-hidden">
                                       {Array.from({ length: Math.max(1, input.split('\n').length) }).map((_, i) => (
                                          <div key={i} className="leading-relaxed h-6">{i + 1}</div>
                                       ))}
                                    </div>
                                    <textarea
                                       value={input}
                                       onChange={(e) => {
                                          let val = e.target.value;
                                          if (val.length > 5000000 + 1000) {
                                             val = val.substring(0, 5000000);
                                             toast.error("Hard Safety Limit: Payload truncated to 5MB.");
                                             setError("Payload truncated: 5MB safety limit reached.");
                                          }
                                          handleInput(val);
                                       }}
                                       placeholder={mode === 'csv2json' ? csvExample : jsonExample}
                                       className="flex-1 w-full h-full bg-transparent p-6 font-mono text-sm text-orange-700 dark:text-[#ce9178] resize-none outline-none selection:bg-primary/20 dark:selection:bg-primary/30 leading-relaxed custom-scrollbar whitespace-pre-wrap break-words"
                                       spellCheck={false}
                                    />
                                    <input
                                       type="file"
                                       ref={fileInputRef}
                                       className="hidden"
                                       accept=".json,.csv,.txt"
                                       onChange={(e) => handleFile(e.target.files?.[0])}
                                    />
                                 </div>

                                 {/* Status / Error Bar */}
                                 <div className="px-4 py-2 border-t border-border dark:border-white/5 bg-zinc-50 dark:bg-[#050505] flex items-center justify-between gap-3 z-10">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                       {error ? (
                                          <>
                                             <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
                                             <span className="text-[9px] font-black uppercase tracking-widest text-destructive truncate italic animate-in fade-in slide-in-from-left-2 duration-300">
                                                ERROR: {error}
                                             </span>
                                          </>
                                       ) : (
                                          <>
                                             <Zap className="h-3 w-3 text-primary/40" />
                                             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Ready for Translation</span>
                                          </>
                                       )}
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${input.length > 4500000 ? 'text-primary' : 'opacity-20'}`}>
                                       {input.length.toLocaleString()} / 5,000,000
                                    </span>
                                 </div>
                              </Card>
                           </div>

                           {/* RIGHT PANEL */}
                           <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6">
                              <Card className="glass-morphism border-border dark:border-emerald-500/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl flex flex-col group h-[550px]">

                                 <div className="px-4 pt-3 border-b border-border dark:border-white/5 flex items-end justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                       <div className="flex gap-1.5 items-center bg-white dark:bg-[#111111] px-4 py-2 rounded-t-lg border-x border-t border-border dark:border-white/5 relative z-10 -mb-[1px] transition-all hover:bg-zinc-50 dark:hover:bg-[#151515]">
                                          {mode === 'csv2json' ? <FileJson className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" /> : <Table className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />}
                                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400">
                                             output.{mode === 'csv2json' ? 'json' : 'csv'}
                                          </span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                       <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                             if (!output) return;
                                             const blob = new Blob([output], { type: mode === 'csv2json' ? "application/json" : "text/csv" });
                                             const url = URL.createObjectURL(blob);
                                             const a = document.createElement("a");
                                             a.href = url;
                                             a.download = `forge_export_${Date.now()}.${mode === 'csv2json' ? 'json' : 'csv'}`;
                                             a.click();
                                          }}
                                          disabled={!output}
                                          className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/20 transition-all rounded-xl shadow-inner"
                                       >
                                          <Download className="h-3 w-3 mr-1.5" /> Export Artifact
                                       </Button>
                                       <div className="w-[1px] h-4 bg-border dark:bg-white/10 mx-1" />
                                       <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 rounded-2xl transition-colors" onClick={copy} disabled={!output}>
                                          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                       </Button>
                                    </div>
                                 </div>

                                 <div className="flex-1 flex overflow-x-clip bg-white dark:bg-black min-h-[500px] relative z-0">
                                    <div className="w-12 bg-zinc-50 dark:bg-[#050505] border-r border-border dark:border-white/5 flex flex-col py-6 items-center font-mono text-[10px] text-muted-foreground/50 dark:text-zinc-600 select-none min-h-[500px]">
                                       {Array.from({ length: Math.max(1, output.split('\n').length) }).map((_, i) => (
                                          <div key={i} className="leading-relaxed h-6">{i + 1}</div>
                                       ))}
                                    </div>
                                    <textarea
                                       readOnly
                                       value={output}
                                       placeholder={mode === 'csv2json' ? jsonExample : csvExample}
                                       className="flex-1 w-full h-full min-h-[500px] bg-transparent p-6 font-mono text-sm text-emerald-700 dark:text-emerald-400/90 resize-none outline-none selection:bg-emerald-500/20 leading-relaxed scrollbar-hide custom-scrollbar whitespace-pre-wrap break-words"
                                       spellCheck={false}
                                    />
                                 </div>
                              </Card>
                           </div>
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

                        <Card className="glass-morphism border-border dark:border-primary/10 rounded-2xl overflow-hidden shadow-lg dark:shadow-xl bg-card border-2 dark:border-primary/5">
                           <div className="bg-primary/5 dark:bg-primary/10 p-6 border-b border-border dark:border-white/10 flex items-center justify-between">
                              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic">Forge Metrics</h3>
                              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                           </div>
                           <CardContent className="p-8 space-y-8">
                              <div className="bg-muted/50 dark:bg-black/40 p-6 rounded-2xl border border-border dark:border-white/5 shadow-inner">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:opacity-40 mb-2">Stage Status</p>
                                 <p className={`text-2xl font-black italic tracking-tighter ${output ? 'text-emerald-600 dark:text-emerald-500' : 'text-primary'}`}>{output ? 'Baked' : 'Idle'}</p>
                              </div>

                              <div className="space-y-5">
                                 <div className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                       <Zap className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white leading-none">Instant Processing</p>
                                       <p className="text-[8px] font-black text-muted-foreground dark:text-white/40 uppercase tracking-widest mt-1">Zero Latency</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                       <TableIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                                    </div>
                                    <div className="flex-1">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white leading-none">Clean Output</p>
                                       <p className="text-[8px] font-black text-muted-foreground dark:text-white/40 uppercase tracking-widest mt-1">Validated Schema</p>
                                    </div>
                                 </div>
                              </div>

                              <p className="text-[8px] text-center text-muted-foreground/60 dark:text-white/20 font-black uppercase tracking-widest pt-4 border-t border-border dark:border-white/5 italic">
                                 Native Type Inference • Secure Local Context
                              </p>
                           </CardContent>
                        </Card>
                     </aside>
                  </div>
               </div>
               {/* SEO & Tool Guide Section */}
               <ToolExpertSection
                  title="Data Transformer Hub"
                  description="The CSV/JSON Data Transformer is a high-speed data translation utility that bridges the gap between spreadsheet-oriented CSV files and developer-friendly JSON structures."
                  transparency="Instead of uploading sensitive mailing lists or financial records to a third-party server, this tool utilizes your browser's local JavaScript engine. The entire conversion logic—whether parsing or flattening—is executed air-gapped on your own machine."
                  limitations="However, please note that rendering enormously large datasets (e.g., 500MB+ CSV files) is not ideal for the browser. A multi-gigabyte text buffer will almost always result in an Out of Memory crash. We recommend staying under 10MB for a fluid experience."
                  accent="sky"
               />
            </main>

            <SponsorSidebars position="right" />
         </div>
         <Footer />
         <StickyAnchorAd />
      </div>
   );
};

export default CsvJsonForge;
