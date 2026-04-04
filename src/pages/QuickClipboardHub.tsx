import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, ClipboardCopy, Download, FileCheck, ShieldCheck, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import SponsorSidebars from "@/components/SponsorSidebars";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const QuickClipboardHub = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [history, setHistory] = useState<{ name: string; size: string; time: string; url: string }[]>([]);


  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    const size = (f.size / 1024).toFixed(2) + " KB";
    const time = new Date().toLocaleTimeString();
    
    // Auto-download logic (Skip and ignore for text to prevent accidents)
    if (f.type === "text/plain") {
      toast.error("Text payload ignored. File expected.");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = f.name || `clipboard_${Date.now()}.${f.type.split('/')[1] || 'bin'}`;
    link.click();
    toast.success(`Dispatched: ${f.name || "Clipboard Asset"}`);
    
    setHistory(prev => [{ name: f.name || "Clipboard Artifact", size, time, url }, ...prev].slice(0, 10));
  }, []);

  usePasteFile(handleFile);

  return (
    <div className="min-h-screen bg-background text-foreground theme-utility transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow">
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
                   Quick <span className="text-primary italic">Clipboard Hub</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Instant Clipboard-to-Disk Extraction engine</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
             {/* Master Paste Zone */}
             <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                <Card 
                  className="glass-morphism border-primary/20 overflow-hidden relative bg-black shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] rounded-2xl group border-2 cursor-pointer"
                  onClick={async () => {
                    try {
                      const items = await navigator.clipboard.read();
                      // Priority check
                      const priority = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'text/plain'];
                      for (const item of items) {
                        for (const pType of priority) {
                          if (item.types.includes(pType)) {
                            const blob = await item.getType(pType);
                            const ext = pType.split('/')[1] || 'bin';
                            // Special extension for text
                            const finalExt = pType === 'text/plain' ? 'txt' : ext;
                            const f = new File([blob], `clipboard_${Date.now()}.${finalExt}`, { type: pType });
                            handleFile(f);
                            return;
                          }
                        }
                        // Fallback
                        for (const type of item.types) {
                          if (type === 'text/html') continue;
                          const blob = await item.getType(type);
                          const ext = type.split('/')[1] || 'bin';
                          const finalExt = type === 'text/plain' ? 'txt' : ext;
                          const f = new File([blob], `clipboard_${Date.now()}.${finalExt}`, { type });
                          handleFile(f);
                          return;
                        }
                      }
                      toast.error("Clipboard is empty or contains unsupported data");
                    } catch {
                      toast.error("Clipboard access denied — use Ctrl+V instead");
                    }
                  }}
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                   
                   <div className="relative p-20 flex flex-col items-center justify-center text-center min-h-[400px]">
                      <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                         <ClipboardCopy className="h-12 w-12 text-primary" />
                      </div>
                      
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none">Tap to Extract</h2>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Click here or use Ctrl+V to download clipboard</p>
                        <KbdShortcut />
                        <p className="text-muted-foreground text-[10px] mt-6 font-black uppercase tracking-widest opacity-20 max-w-[300px] mx-auto leading-relaxed italic">
                          IMAGE, PDF, TEXT, OR SNIPPETS
                        </p>
                      </div>

                      <div className="mt-12 flex items-center gap-3 bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 animate-pulse">
                         <Zap className="h-4 w-4 text-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Listener Active</span>
                      </div>
                   </div>
                </Card>
             </div>

             {/* History / Status Side */}
             <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
                 <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic px-4">Local memory only • Auto MIME detection • PNG, JPEG, PDF, Binary</p>

                <Card className="glass-morphism border-primary/10 rounded-2xl bg-zinc-950/50 shadow-xl overflow-hidden">
                   <div className="bg-[#0a0a0a] px-6 py-4 border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                         <History className="h-3.5 w-3.5" /> Extraction Log
                      </h3>
                      {history.length > 0 && (
                        <Button 
                          onClick={() => setHistory([])} 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-2xl transition-all"
                        >
                          Reset Stage
                        </Button>
                      )}
                   </div>
                   <CardContent className="p-0 max-h-[300px] overflow-auto custom-scrollbar">
                      {history.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground/30 italic text-xs uppercase font-black tracking-widest">
                           No artifacts dispatched yet
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5">
                           {history.map((h, i) => (
                             <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                                      <FileCheck className="h-5 w-5" />
                                   </div>
                                   <div>
                                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{h.name}</p>
                                      <p className="text-[10px] font-mono text-muted-foreground opacity-60">{h.size} • {h.time}</p>
                                   </div>
                                </div>
                                <Button size="icon" variant="ghost" className="rounded-lg h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                   <a href={h.url} download={h.name}>
                                      <Download className="h-4 w-4" />
                                   </a>
                                </Button>
                             </div>
                           ))}
                        </div>
                      )}
                   </CardContent>
                </Card>

                <div className="px-6 py-4 bg-muted/5 rounded-2xl border border-border/50">
                   <AdPlaceholder format="banner" className="opacity-40 grayscale hover:grayscale-0 transition-all border-none" />
                </div>
             </div>
          </div>
        </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
    </div>
  );
};

export default QuickClipboardHub;
