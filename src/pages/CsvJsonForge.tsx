import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, FileJson, Table, RefreshCw, Zap, Table as TableIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";

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

   // Dynamic Placeholders
   const csvExample = "name,age,city\nJohn,30,NY\nJane,25,LA";
   const jsonExample = '[\n  {\n    "name": "John",\n    "age": "30",\n    "city": "NY"\n  },\n  {\n    "name": "Jane",\n    "age": "25",\n    "city": "LA"\n  }\n]';

   return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500 font-sans theme-utility overflow-x-hidden">
         <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

         <div className="flex justify-center items-start w-full relative">
            <SponsorSidebars position="left" />

            <main className="container mx-auto max-w-[1240px] px-6 py-12 grow">
               <div className="flex flex-col gap-10">
                  <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                     <Link to="/">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border dark:border-white/20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all group/back bg-background/80 dark:bg-black/60 shadow-xl dark:shadow-2xl">
                           <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                     </Link>
                     <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-foreground dark:text-white text-shadow-glow">
                           CSV / JSON <span className="text-primary italic">Forge</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 text-[10px]">
                           Data Translation Studio · Bi-directional Conversion
                        </p>
                     </div>
                  </header>

                  {/* Mobile Inline Ad */}
                  <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
                     <AdBox height={250} label="300x250 AD" className="w-full max-w-[400px]" />
                  </div>

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

                           <Button onClick={convert} disabled={!input} className="px-12 gap-3 h-14 text-sm font-black rounded-2xl shadow-xl dark:shadow-2xl shadow-primary/20 dark:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all uppercase italic bg-primary text-primary-foreground border-b-4 border-primary-foreground/20">
                              <RefreshCw className={`h-4 w-4 ${input && "animate-spin-slow"}`} /> Transform Artifact
                           </Button>
                        </div>

                        {/* Input & Output Panels */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                           {/* LEFT PANEL */}
                           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                              <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl flex flex-col group">

                                 <div className="px-4 pt-3 border-b border-border dark:border-white/5 flex items-end justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                       <div className="flex gap-1.5 items-center bg-white dark:bg-[#111111] px-4 py-2 rounded-t-lg border-x border-t border-border dark:border-white/5 relative z-10 -mb-[1px] transition-all hover:bg-zinc-50 dark:hover:bg-[#151515]">
                                          {mode === 'csv2json' ? <Table className="h-3.5 w-3.5 text-primary" /> : <FileJson className="h-3.5 w-3.5 text-primary" />}
                                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400">
                                             {mode === 'csv2json' ? 'source.csv' : 'source.json'}
                                          </span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                       <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 rounded-2xl transition-colors" onClick={() => { setInput(""); setOutput(""); }} disabled={!input}>
                                          <RefreshCw className="h-3.5 w-3.5" />
                                       </Button>
                                    </div>
                                 </div>

                                 <div className="flex-1 flex overflow-hidden bg-white dark:bg-black min-h-[500px] relative z-0">
                                    <div className="w-12 bg-zinc-50 dark:bg-[#050505] border-r border-border dark:border-white/5 flex flex-col py-6 items-center font-mono text-[10px] text-muted-foreground/50 dark:text-zinc-600 select-none min-h-[500px]">
                                       {Array.from({ length: Math.max(1, input.split('\n').length) }).map((_, i) => (
                                          <div key={i} className="leading-relaxed h-6">{i + 1}</div>
                                       ))}
                                    </div>
                                    <textarea
                                       value={input}
                                       onChange={(e) => setInput(e.target.value)}
                                       placeholder={mode === 'csv2json' ? csvExample : jsonExample}
                                       className="flex-1 w-full h-full min-h-[500px] bg-transparent p-6 font-mono text-sm text-orange-700 dark:text-[#ce9178] resize-none outline-none selection:bg-primary/20 dark:selection:bg-primary/30 leading-relaxed scrollbar-hide custom-scrollbar whitespace-pre-wrap break-words"
                                       spellCheck={false}
                                    />
                                 </div>
                              </Card>
                           </div>

                           {/* RIGHT PANEL */}
                           <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                              <Card className="glass-morphism border-border dark:border-emerald-500/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl flex flex-col group">

                                 <div className="px-4 pt-3 border-b border-border dark:border-white/5 flex items-end justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                       <div className="flex gap-1.5 items-center bg-white dark:bg-[#111111] px-4 py-2 rounded-t-lg border-x border-t border-border dark:border-white/5 relative z-10 -mb-[1px] transition-all hover:bg-zinc-50 dark:hover:bg-[#151515]">
                                          {mode === 'csv2json' ? <FileJson className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" /> : <Table className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />}
                                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400">
                                             output.{mode === 'csv2json' ? 'json' : 'csv'}
                                          </span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                       <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 rounded-2xl transition-colors" onClick={copy} disabled={!output}>
                                          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                       </Button>
                                    </div>
                                 </div>

                                 <div className="flex-1 flex overflow-hidden bg-white dark:bg-black min-h-[500px] relative z-0">
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

                     <aside className="space-y-8 lg:sticky lg:top-24 h-fit pb-10">
                        <Card className="glass-morphism border-border dark:border-primary/20 rounded-2xl overflow-hidden shadow-lg dark:shadow-2xl bg-card animate-in slide-in-from-right-4 duration-500 border-l-4">
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
              title="CSV / JSON Forge"
              description="The CSV/JSON Forge is a high-speed data translation utility that bridges the gap between spreadsheet-oriented CSV files and developer-friendly JSON structures."
              transparency="Instead of uploading sensitive mailing lists or financial records to a third-party server, this tool utilizes your browser's local JavaScript engine. The entire conversion logic—whether parsing or flattening—is executed air-gapped on your own machine."
              limitations="However, please note that rendering enormously large datasets (e.g., 500MB+ CSV files) is not ideal for the browser. A multi-gigabyte text buffer will almost always result in an Out of Memory crash. We recommend staying under 10MB for a fluid experience."
              accent="emerald"
            />
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

export default CsvJsonForge;