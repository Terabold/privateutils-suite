import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, FileJson, Table, RefreshCw, Zap, Table as TableIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import SponsorSidebars from "@/components/SponsorSidebars";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

// Simple CSV to JSON
function csvToJson(csv: string) {
   const lines = csv.split(/\r?\n/).filter(line => line.trim() !== "");
   if (lines.length < 2) return "[]";
   const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
   const result = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((header, i) => {
         obj[header] = values[i] || "";
      });
      return obj;
   });
   return JSON.stringify(result, null, 2);
}

// Simple JSON to CSV
function jsonToCsv(json: string) {
   try {
      const arr = JSON.parse(json);
      if (!Array.isArray(arr) || arr.length === 0) return "";
      const headers = Object.keys(arr[0]);
      const csv = [
         headers.join(','),
         ...arr.map(obj => headers.map(h => `"${String(obj[h] || "").replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      return csv;
   } catch {
      return "Invalid JSON array";
   }
}

const CsvJsonForge = () => {
   const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
   const [input, setInput] = useState("");
   const [output, setOutput] = useState("");
   const [mode, setMode] = useState<'csv2json' | 'json2csv'>('csv2json');
   const [copied, setCopied] = useState(false);
   const [isPasting, setIsPasting] = useState(false);

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
         setInput(e.target?.result as string);
         toast.success("Data Artifact Staged");
      };
      reader.readAsText(file);
   };

   usePasteFile(handleFile);

   const convert = useCallback(() => {
      if (!input) return;
      if (mode === 'csv2json') setOutput(csvToJson(input));
      else setOutput(jsonToCsv(input));
      toast.success(`${mode === 'csv2json' ? 'JSON' : 'CSV'} Staged`);
   }, [input, mode]);

   const copy = async () => {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("Artifact Copied");
   };

   return (
      <div className="min-h-screen bg-[#050505] text-foreground transition-colors duration-500 font-sans theme-utility overflow-x-hidden">
         <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

         <div className="flex justify-center items-start w-full relative">
            <SponsorSidebars position="left" />

            <main className="container mx-auto max-w-[1400px] px-6 py-12 grow">
               <div className="flex flex-col gap-10">
                  <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                     <Link to="/">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                           <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                     </Link>
                     <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                           CSV / JSON <span className="text-primary italic">Forge</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                           Data Translation Studio · Bi-directional Conversion
                        </p>
                     </div>
                  </header>

                  <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-10 items-start">
                     <div className="space-y-10">
                        <div className="flex items-center justify-between gap-4 bg-zinc-900 border border-white/10 p-4 rounded-[2rem] shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                           <div className="flex gap-2.5">
                              <button
                                 onClick={() => setMode('csv2json')}
                                 className={`px-8 py-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2.5 ${mode === 'csv2json' ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/30 scale-105' : 'bg-black/40 border-white/5 text-muted-foreground hover:bg-white/5'
                                    }`}
                              >
                                 <Table className="h-4 w-4" /> CSV to JSON
                              </button>
                              <button
                                 onClick={() => setMode('json2csv')}
                                 className={`px-8 py-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2.5 ${mode === 'json2csv' ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/30 scale-105' : 'bg-black/40 border-white/5 text-muted-foreground hover:bg-white/5'
                                    }`}
                              >
                                 <FileJson className="h-4 w-4" /> JSON to CSV
                              </button>
                           </div>

                           <Button onClick={convert} disabled={!input} className="px-12 gap-3 h-14 text-sm font-black rounded-2xl shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all uppercase italic bg-primary text-white border-b-4 border-primary-foreground/20">
                              <RefreshCw className={`h-4 w-4 ${input && "animate-spin-slow"}`} /> Transform Artifact
                           </Button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                              <Card className="glass-morphism border-primary/20 overflow-hidden relative bg-black shadow-2xl rounded-3xl group flex flex-col min-h-[600px] border-b-8">
                                 <div className="bg-[#0a0a0a] px-6 py-3 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3 relative top-[1px]">
                                       <div className="flex gap-2 items-center bg-[#111111] px-5 py-2.5 rounded-t-xl border-x border-t border-white/10 relative top-[13px] z-10 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.5)]">
                                          <Table className="h-3.5 w-3.5 text-primary" />
                                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{mode === 'csv2json' ? 'source.csv' : 'source.json'}</span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <Button size="icon" variant="ghost" className="h-8 w-8 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all" onClick={() => { setInput(""); setOutput(""); }} disabled={!input}>
                                          <RefreshCw className="h-3.5 w-3.5" />
                                       </Button>
                                    </div>
                                 </div>
                                 <CardContent className="p-0 flex-1 flex flex-col">
                                    <textarea
                                       value={input}
                                       onChange={(e) => setInput(e.target.value)}
                                       placeholder={mode === 'csv2json' ? "name,age,city\nJohn,30,NY\nJane,25,LA" : '[{"name":"John","age":30}]'}
                                       className="flex-1 w-full bg-transparent p-10 pt-12 text-sm font-mono text-[#ce9178] outline-none custom-scrollbar whitespace-pre resize-none scrollbar-hide selection:bg-primary/30"
                                       spellCheck={false}
                                    />
                                 </CardContent>
                              </Card>
                           </motion.div>

                           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                              <Card className="glass-morphism border-emerald-500/20 overflow-hidden relative bg-black shadow-2xl rounded-3xl group flex flex-col min-h-[600px] border-b-8">
                                 <div className="bg-[#0a0a0a] px-6 py-3 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3 relative top-[1px]">
                                       <div className="flex gap-2 items-center bg-[#111111] px-5 py-2.5 rounded-t-xl border-x border-t border-white/10 relative top-[13px] z-10 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.5)]">
                                          <FileJson className="h-3.5 w-3.5 text-emerald-500" />
                                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">output.{mode === 'csv2json' ? 'json' : 'csv'}</span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <Button size="icon" variant="ghost" className={`h-8 w-8 transition-all rounded-xl ${copied ? "text-emerald-500" : "text-white/30 hover:text-white hover:bg-white/10"}`} onClick={copy} disabled={!output}>
                                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                       </Button>
                                    </div>
                                 </div>
                                 <CardContent className="p-0 flex-1 flex flex-col">
                                    <textarea
                                       readOnly
                                       value={output}
                                       placeholder="Transformed artifact will materialize here..."
                                       className="flex-1 w-full bg-transparent p-10 pt-12 text-sm font-mono text-emerald-400/90 outline-none custom-scrollbar whitespace-pre resize-none scrollbar-hide selection:bg-emerald-500/20"
                                       spellCheck={false}
                                    />
                                 </CardContent>
                              </Card>
                           </motion.div>
                        </div>
                     </div>

                     <aside className="space-y-8 lg:sticky lg:top-24 h-fit pb-10">
                        <Card className="glass-morphism border-primary/20 rounded-[2rem] overflow-hidden shadow-2xl bg-zinc-900 animate-in slide-in-from-right-4 duration-500 border-l-4">
                           <div className="bg-primary/10 p-6 border-b border-white/10 flex items-center justify-between">
                              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic">Forge Metrics</h3>
                              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                           </div>
                           <CardContent className="p-8 space-y-8">
                              <div className="bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                                 <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Stage Status</p>
                                 <p className={`text-2xl font-black italic tracking-tighter ${output ? 'text-emerald-500' : 'text-primary'}`}>{output ? 'Baked' : 'Idle'}</p>
                              </div>

                              <div className="space-y-5">
                                 <div className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                       <Zap className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none">Instant Processing</p>
                                       <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">Zero Latency</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                       <TableIcon className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div className="flex-1">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none">Clean Output</p>
                                       <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">Validated Schema</p>
                                    </div>
                                 </div>
                              </div>

                              <p className="text-[8px] text-center text-white/20 font-black uppercase tracking-widest pt-4 border-t border-white/5 italic">
                                 Native Type Inference • Secure Local Context
                              </p>
                           </CardContent>
                        </Card>

                        <div className="px-6 border-t border-white/5 pt-8">
                           <AdPlaceholder format="rectangle" className="opacity-40 grayscale group-hover:grayscale-0 transition-all border-white/10" />
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

export default CsvJsonForge;
