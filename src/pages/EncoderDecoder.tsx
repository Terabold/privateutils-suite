import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Code2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";

type Mode = "base64-encode" | "base64-decode" | "url-encode" | "url-decode" | "html-encode" | "html-decode" | "hex-encode" | "hex-decode";

const MODES: { key: Mode; label: string; group: string }[] = [
   { key: "base64-encode", label: "Encode → Base64", group: "Base64" },
   { key: "base64-decode", label: "Decode ← Base64", group: "Base64" },
   { key: "url-encode", label: "Encode → URL %", group: "URL" },
   { key: "url-decode", label: "Decode ← URL %", group: "URL" },
   { key: "html-encode", label: "Encode → HTML Entities", group: "HTML" },
   { key: "html-decode", label: "Decode ← HTML Entities", group: "HTML" },
   { key: "hex-encode", label: "Encode → Hex", group: "Hex" },
   { key: "hex-decode", label: "Decode ← Hex", group: "Hex" },
];

function htmlEncode(s: string) {
   return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function htmlDecode(s: string) {
   const el = document.createElement("textarea");
   el.innerHTML = s;
   return el.value;
}
function hexEncode(s: string) {
   return Array.from(new TextEncoder().encode(s)).map(b => b.toString(16).padStart(2, "0")).join(" ");
}
function hexDecode(s: string) {
   const bytes = s.trim().replace(/\s+/g, " ").split(" ").map(h => parseInt(h, 16));
   return new TextDecoder().decode(new Uint8Array(bytes));
}

function runMode(mode: Mode, input: string): { output: string; error?: string } {
   try {
      switch (mode) {
         case "base64-encode": return { output: btoa(unescape(encodeURIComponent(input))) };
         case "base64-decode": return { output: decodeURIComponent(escape(atob(input.trim()))) };
         case "url-encode": return { output: encodeURIComponent(input) };
         case "url-decode": return { output: decodeURIComponent(input) };
         case "html-encode": return { output: htmlEncode(input) };
         case "html-decode": return { output: htmlDecode(input) };
         case "hex-encode": return { output: hexEncode(input) };
         case "hex-decode": return { output: hexDecode(input) };
      }
   } catch (e: any) {
      return { output: "", error: e.message || "Conversion failed" };
   }
}

const groupColors: Record<string, string> = {
   Base64: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",
   URL: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20",
   HTML: "text-violet-400 bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20",
   Hex: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20",
};
const activeGroupColors: Record<string, string> = {
   Base64: "text-white bg-blue-500 border-blue-500",
   URL: "text-white bg-emerald-500 border-emerald-500",
   HTML: "text-white bg-violet-500 border-violet-500",
   Hex: "text-white bg-amber-500 border-amber-500",
};

const EncoderDecoder = () => {
   const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
   const [mode, setMode] = useState<Mode>("base64-encode");
   const [input, setInput] = useState("");
   const [copied, setCopied] = useState(false);

   const toggleDark = useCallback(() => {
      const next = !darkMode;
      setDarkMode(next);
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
   }, [darkMode]);

   const { output, error } = input ? runMode(mode, input) : { output: "", error: undefined };

   const copy = async () => {
      if (!output) return;
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
   };

   const swap = () => {
      if (output && !error) {
         setInput(output);
      }
   };

   const groups = Array.from(new Set(MODES.map(m => m.group)));

   return (
      <div className="min-h-screen bg-background text-foreground theme-utility transition-colors duration-500 overflow-x-hidden">
         <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

         <div className="flex justify-center items-start w-full relative">
            <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
               <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
               <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
               <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
            </aside>

            <main className="container mx-auto max-w-[1400px] px-6 py-12 grow overflow-visible">
               <div className="flex flex-col gap-10">
                  <header className="flex items-center gap-6">
                     <Link to="/">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                           <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                     </Link>
                     <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                           Encode / <span className="text-primary italic">Decode</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                           Base64 · URL · HTML · Hex — Instant Local Conversion
                        </p>
                     </div>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                        {/* Mode selector */}
                        <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-muted/5 p-6">
                           <CardContent className="p-0 space-y-4">
                              {groups.map(group => (
                                 <div key={group} className="flex flex-wrap gap-2">
                                    {MODES.filter(m => m.group === group).map(m => (
                                       <button
                                          key={m.key}
                                          onClick={() => setMode(m.key)}
                                          className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border transition-all ${mode === m.key ? activeGroupColors[group] : groupColors[group]}`}
                                       >
                                          {m.label}
                                       </button>
                                    ))}
                                 </div>
                              ))}
                           </CardContent>
                        </Card>

                        {/* Input / Output */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-muted/5 p-6">
                              <CardContent className="p-0 space-y-3">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Input</p>
                                 <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Paste your text here…"
                                    className="min-h-[280px] w-full resize-none bg-transparent border border-border/30 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono leading-relaxed custom-scrollbar"
                                 />
                                 <Button variant="ghost" size="sm" onClick={() => setInput("")} className="text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl h-8 px-3">
                                    Clear
                                 </Button>
                              </CardContent>
                           </Card>

                           <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-muted/5 p-6">
                              <CardContent className="p-0 space-y-3">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Output</p>
                                 {error ? (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium min-h-[280px]">
                                       <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                       {error}
                                    </div>
                                 ) : (
                                    <div className="relative">
                                       <pre className="min-h-[280px] w-full text-sm font-mono leading-relaxed whitespace-pre-wrap break-all text-foreground/80 bg-muted/10 border border-border/30 rounded-xl p-4 custom-scrollbar overflow-auto">
                                          {output || <span className="text-muted-foreground/30">Result will appear here…</span>}
                                       </pre>
                                    </div>
                                 )}
                                 <div className="flex gap-2">
                                    <Button
                                       onClick={copy}
                                       disabled={!output || !!error}
                                       className={`flex-1 gap-2 h-10 text-xs font-bold rounded-xl shadow-lg transition-all duration-300 ${copied ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-[1.01]"}`}
                                    >
                                       {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                       {copied ? "Copied!" : "Copy Result"}
                                    </Button>
                                    <Button
                                       onClick={swap}
                                       disabled={!output || !!error}
                                       variant="outline"
                                       className="gap-2 h-10 text-xs font-bold rounded-xl border-primary/10 hover:bg-primary/5"
                                       title="Use output as next input"
                                    >
                                       <RefreshCw className="h-4 w-4" />
                                       Swap
                                    </Button>
                                 </div>
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
                              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Conversion Stats</h3>
                           </div>
                           <CardContent className="p-8 space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Input Len</p>
                                    <p className="text-2xl font-black italic tracking-tighter">{input.length}</p>
                                 </div>
                                 <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Output Len</p>
                                    <p className="text-2xl font-black italic tracking-tighter">{output.length}</p>
                                 </div>
                              </div>
                              {input && output && !error && (
                                 <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Size Ratio</p>
                                    <p className="text-2xl font-black italic tracking-tighter">
                                       {input.length > 0 ? ((output.length / input.length) * 100).toFixed(0) + "%" : "—"}
                                    </p>
                                 </div>
                              )}
                              <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic">
                                 All conversions are local · Zero uploads
                              </p>
                           </CardContent>
                        </Card>

                        <div className="px-6">
                           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 transition-all border-border/50" />
                        </div>
                     </aside>
                  </div>
               </div>
            </main>

            <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-right-8 duration-1000">
               <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
               <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
               <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
            </aside>
         </div>
         <Footer />
      </div>
   );
};

export default EncoderDecoder;
