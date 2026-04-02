import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, FileJson, Table, RefreshCw, Zap, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";

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
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

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
  }, [input, mode]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-utility transition-colors duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <main className="container mx-auto max-w-[1400px] px-6 py-12">
        <div className="flex flex-col gap-10">
          <header className="flex items-center gap-6">
            <Link to="/">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                CSV / JSON <span className="text-primary italic">Forge</span>
              </h1>
              <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                Data Translation Studio · Bi-directional Conversion
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              <div className="flex items-center justify-between gap-4 bg-primary/5 p-4 rounded-3xl border border-primary/10 shadow-inner">
                 <div className="flex gap-2">
                    <button 
                     onClick={() => setMode('csv2json')}
                     className={`px-6 py-3 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2 ${
                       mode === 'csv2json' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-muted/5 border-border/30 text-muted-foreground hover:bg-primary/5'
                     }`}
                    >
                       <Table className="h-4 w-4" /> CSV to JSON
                    </button>
                    <button 
                     onClick={() => setMode('json2csv')}
                     className={`px-6 py-3 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2 ${
                       mode === 'json2csv' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-muted/5 border-border/30 text-muted-foreground hover:bg-primary/5'
                     }`}
                    >
                       <FileJson className="h-4 w-4" /> JSON to CSV
                    </button>
                 </div>

                 <Button onClick={convert} disabled={!input} className="px-10 gap-3 h-12 text-sm font-black rounded-xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase italic">
                    <RefreshCw className={`h-4 w-4 ${input && "animate-spin-slow"}`} /> Transform Data
                 </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-muted/5 p-8">
                    <CardContent className="p-0 space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{mode === 'csv2json' ? 'Paste CSV' : 'Paste JSON'}</p>
                       <textarea
                         value={input}
                         onChange={(e) => setInput(e.target.value)}
                         placeholder={mode === 'csv2json' ? "name,age,city\nJohn,30,NY\nJane,25,LA" : '[{"name":"John","age":30}]'}
                         className="h-[400px] w-full bg-zinc-950/40 border border-border/30 rounded-xl p-6 text-xs font-mono text-foreground focus:outline-none focus:border-primary/40 custom-scrollbar whitespace-pre"
                       />
                    </CardContent>
                 </Card>

                 <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-muted/5 p-8">
                    <div className="px-6 space-y-1 text-center">
                      <p className="text-4xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Data Master</p>
                      <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 italic mt-2">CSV or JSON Source Files Supported</p>
                    </div>
                    <CardContent className="p-0 space-y-4 mt-6">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Output</p>
                          <Button 
                             onClick={copy}
                             className={`gap-2 h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${copied ? "bg-green-600 shadow-green-600/20" : "shadow-primary/30"}`}
                          >
                             {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                             {copied ? "Copied" : "Copy"}
                          </Button>
                       </div>
                       <textarea
                         readOnly
                         value={output}
                         placeholder="Result will appear here..."
                         className="h-[400px] w-full bg-zinc-950/40 border border-border/30 rounded-xl p-6 text-xs font-mono text-foreground/50 resize-none focus:outline-none custom-scrollbar whitespace-pre"
                       />
                    </CardContent>
                 </Card>
              </div>

              <div className="flex justify-center">
                <AdPlaceholder format="banner" className="opacity-50 grayscale hover:grayscale-0 transition-all" />
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-primary/5 p-5 border-b border-primary/10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Data Insights</h3>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Status</p>
                    <p className="text-2xl font-black italic tracking-tighter">{output ? 'Converted' : 'Idle'}</p>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                        <Zap className="h-4 w-4 text-emerald-500" /> 
                        <span>Local Data Transform</span>
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                        <TableIcon className="h-4 w-4 text-primary" /> 
                        <span>Smart Header Parsing</span>
                     </div>
                  </div>
                </CardContent>
              </Card>

              <div className="px-6 border-t border-border/50 pt-6">
                 <AdPlaceholder format="rectangle" />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CsvJsonForge;
