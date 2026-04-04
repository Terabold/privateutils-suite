import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Copy, Check, FileJson, Table, RefreshCw, Zap, 
  Table as TableIcon, Undo, Redo, Trash2, Maximize2, Minimize2, 
  Code, AlertCircle, Wand2, ShieldCheck, Database, Repeat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import SponsorSidebars from "@/components/SponsorSidebars";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";

// --- Logic Helpers ---

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

// --- Main Component ---

const DataForge = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [activeTab, setActiveTab] = useState<'architecture' | 'translation'>('architecture');
  
  // Shared / Architecture State
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [lastValid, setLastValid] = useState<string | null>(null);
  const [autoPrettify, setAutoPrettify] = useState(false);
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Translation State
  const [transMode, setTransMode] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [transOutput, setTransOutput] = useState("");
  const [copiedTrans, setCopiedTrans] = useState(false);

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
      toast.success("Data Artifact Staged");
    };
    reader.readAsText(file);
  };

  usePasteFile(handleFile);

  // --- Architecture Logic ---
  useEffect(() => {
    if (activeTab !== 'architecture') return;
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
  }, [input, autoPrettify, activeTab]);

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

  const formatJson = () => {
    try {
      if (!input.trim()) return;
      handleInput(JSON.stringify(JSON.parse(input), null, 2));
      toast.success("JSON Architecturally Prettified");
    } catch (e) { toast.error("Invalid Syntax"); }
  };

  const minifyJson = () => {
    try {
      if (!input.trim()) return;
      handleInput(JSON.stringify(JSON.parse(input)));
      toast.success("JSON Mass Minified");
    } catch (e) { toast.error("Invalid Syntax"); }
  };

  // --- Translation Logic ---
  const convert = useCallback(() => {
    if (!input) return;
    if (transMode === 'csv2json') setTransOutput(csvToJson(input));
    else setTransOutput(jsonToCsv(input));
  }, [input, transMode]);

  const copyTrans = async () => {
    await navigator.clipboard.writeText(transOutput);
    setCopiedTrans(true);
    setTimeout(() => setCopiedTrans(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-utility transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow overflow-visible">
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
                   Data <span className="text-primary italic">Forge</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Universal Architecture & Translation Studio</p>
              </div>
            </div>

            <div className="flex bg-muted/10 p-1.5 rounded-2xl border border-border/30 backdrop-blur-sm">
               <button 
                 onClick={() => setActiveTab('architecture')}
                 className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'architecture' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-primary/5"}`}
               >
                 <Database className="h-3.5 w-3.5" /> Architecture
               </button>
               <button 
                 onClick={() => setActiveTab('translation')}
                 className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'translation' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-primary/5"}`}
               >
                 <Repeat className="h-3.5 w-3.5" /> Translation
               </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-start">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              {activeTab === 'architecture' ? (
                // ARCHITECTURE TAB
                <div className="space-y-8">
                   <Card className="glass-morphism border-primary/10 overflow-hidden relative bg-black shadow-2xl rounded-2xl group flex flex-col min-h-[600px]">
                      <div className="bg-[#050505] px-4 py-2 border-b border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2 bg-[#0a0a0a] px-4 py-2 rounded-t-lg border-x border-t border-white/5 -mb-[9px] relative z-10">
                            <FileJson className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">workspace.json</span>
                         </div>
                         <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={undo} disabled={historyIndex <= 0} className="h-8 w-8 text-white/40 hover:text-white"><Undo className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-8 w-8 text-white/40 hover:text-white"><Redo className="h-3.5 w-3.5" /></Button>
                            <div className="w-[1px] h-4 bg-white/10 mx-1" />
                            <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(input); toast.success("Copied!"); }} className="h-8 w-8 text-white/40 hover:text-white"><Copy className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => handleInput("")} className="h-8 w-8 text-destructive/50 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                         </div>
                      </div>
                      <div className="flex-1 flex overflow-hidden relative">
                         <div className="w-12 bg-[#050505] border-r border-white/5 flex flex-col py-6 items-center font-mono text-[10px] text-zinc-600 select-none">
                            {Array.from({ length: Math.max(1, input.split('\n').length) }).map((_, i) => (
                               <div key={i} className="leading-relaxed h-6">{i + 1}</div>
                            ))}
                         </div>
                         <textarea
                           value={input}
                           onChange={(e) => handleInput(e.target.value)}
                           className="flex-1 bg-transparent p-6 font-mono text-sm text-[#9cdcfe] resize-none outline-none selection:bg-primary/30 leading-relaxed custom-scrollbar"
                           placeholder='Paste JSON for structural audit...'
                         />
                         {error && (
                           <div className="absolute bottom-0 inset-x-0 p-4 bg-destructive/10 border-t border-destructive/20 text-destructive flex items-start gap-3 backdrop-blur-md">
                             <AlertCircle className="h-4 w-4 mt-0.5" />
                             <div>
                               <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">Syntax Error</p>
                               <p className="text-[10px] font-medium opacity-80">{error}</p>
                             </div>
                           </div>
                         )}
                      </div>
                   </Card>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Button onClick={formatJson} disabled={!isValid} className="h-20 text-lg font-black rounded-2xl gap-3 shadow-2xl shadow-primary/20 italic uppercase bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                         <Maximize2 className="h-6 w-6" /> Prettify Architecture
                      </Button>
                      <Button onClick={minifyJson} disabled={!isValid} variant="secondary" className="h-20 text-lg font-black rounded-2xl gap-3 italic uppercase border border-border/50">
                         <Minimize2 className="h-6 w-6" /> Mass Minify
                      </Button>
                   </div>
                </div>
              ) : (
                // TRANSLATION TAB
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                   <div className="flex gap-2">
                     {(['csv2json', 'json2csv'] as const).map(m => (
                       <button
                         key={m}
                         onClick={() => setTransMode(m)}
                         className={`px-6 py-3 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2 ${transMode === m ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-muted/5 border-border/30 text-muted-foreground hover:bg-primary/5'}`}
                       >
                         {m === 'csv2json' ? <Table className="h-4 w-4" /> : <FileJson className="h-4 w-4" />}
                         {m === 'csv2json' ? 'CSV to JSON' : 'JSON to CSV'}
                       </button>
                     ))}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-muted/5 p-8">
                         <CardContent className="p-0 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{transMode === 'csv2json' ? 'Source CSV' : 'Source JSON'}</p>
                            <textarea
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder={transMode === 'csv2json' ? "name,age\nJohn,30" : '[{"name":"John"}]'}
                              className="h-[400px] w-full bg-zinc-950/40 border border-border/30 rounded-xl p-6 text-xs font-mono text-foreground focus:outline-none focus:border-primary/40 custom-scrollbar"
                            />
                            <Button onClick={convert} className="w-full gap-2 h-12 font-bold rounded-2xl shadow-xl shadow-primary/20 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
                               <RefreshCw className="h-4 w-4" /> Translate Asset
                            </Button>
                         </CardContent>
                      </Card>
                      <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-muted/5 p-8">
                         <CardContent className="p-0 space-y-4">
                            <div className="flex items-center justify-between">
                               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Output Artifact</p>
                               <Button onClick={copyTrans} className={`gap-2 h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${copiedTrans ? "bg-green-600 shadow-green-600/20" : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"}`}>
                                  {copiedTrans ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  {copiedTrans ? "Copied" : "Copy Result"}
                               </Button>
                            </div>
                            <textarea
                              readOnly value={transOutput} placeholder="Translation result..."
                              className="h-[400px] w-full bg-zinc-950/40 border border-border/30 rounded-xl p-6 text-xs font-mono text-foreground/50 selection:bg-primary/30 custom-scrollbar"
                            />
                         </CardContent>
                      </Card>
                   </div>
                </div>
              )}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
               <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Forge Console</h3>
                    {activeTab === 'architecture' && !error && input.length > 0 && <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest"><Check className="h-3 w-3" /> Valid</span>}
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

                     {activeTab === 'architecture' && (
                       <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                          <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border/50">
                             <div className="space-y-0.5">
                               <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><Wand2 className="h-3.5 w-3.5"/> Auto-Prettify</Label>
                               <p className="text-[9px] text-muted-foreground uppercase font-medium">Draft sense logic</p>
                             </div>
                             <Switch checked={autoPrettify} onCheckedChange={setAutoPrettify} />
                          </div>
                          <Button 
                             onClick={() => lastValid && handleInput(lastValid)} 
                             disabled={!lastValid || isValid} 
                             variant="outline" 
                             className="w-full h-12 gap-2 text-xs font-black uppercase tracking-widest border-border/50 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all rounded-2xl"
                          >
                             <ShieldCheck className="h-4 w-4" /> Restore Last Valid
                          </Button>
                       </div>
                     )}

                     <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                           <Zap className="h-4 w-4 text-primary" /> 
                           <span>Local Engine V8</span>
                        </div>
                        {activeTab === 'translation' && (
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                             <TableIcon className="h-4 w-4 text-primary" /> 
                             <span>Bi-Directional Translation</span>
                          </div>
                        )}
                     </div>

                     <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic">No network leakage • 100% Client-side forge</p>
                  </CardContent>
               </Card>
               <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 transition-all border-border/50" />
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

export default DataForge;
