import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Code2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";

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
            <SponsorSidebars position="left" />

            <main className="container mx-auto max-w-[1240px] px-6 py-12 grow overflow-visible">
               <div className="flex flex-col gap-10">
                  <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                     <Link to="/">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                           <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                     </Link>
                     <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                           Encode / <span className="text-primary italic">Decode</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                           Base64 • URL • HTML • Hex — Instant Local Conversion
                        </p>
                     </div>
                  </header>

                  {/* Mobile Inline Ad */}
                  <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
                     <AdBox height={250} label="300x250 AD" className="w-full max-w-[400px]" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start overflow-visible">
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                        {/* Mode selector */}
                        <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-card p-6">
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
                           <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card p-6">
                                <CardContent className="p-0 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Input</p>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Paste your text here…"
                                    className="min-h-[280px] w-full resize-none bg-background/20 border border-border/30 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono leading-relaxed custom-scrollbar shadow-inner"
                                />
                                <Button variant="ghost" size="sm" onClick={() => setInput("")} className="text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl h-8 px-3">
                                    Clear
                                </Button>
                                </CardContent>
                           </Card>

                           <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card p-6">
                              <CardContent className="p-0 space-y-3">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Output</p>
                                 {error ? (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium min-h-[280px]">
                                       <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                       {error}
                                    </div>
                                 ) : (
                                    <div className="relative">
                                       <pre className="min-h-[280px] w-full text-sm font-mono leading-relaxed whitespace-pre-wrap break-all text-foreground/80 bg-background/20 border border-border/30 rounded-xl p-4 custom-scrollbar overflow-auto shadow-inner">
                                          {output || <span className="text-muted-foreground/30">Result will appear here…</span>}
                                       </pre>
                                    </div>
                                 )}
                                 <div className="flex gap-2">
                                    <Button
                                       onClick={copy}
                                       disabled={!output || !!error}
                                       className={`flex-1 gap-2 h-10 text-xs font-bold rounded-xl shadow-lg transition-all duration-300 ${copied ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" : "bg-primary text-primary-foreground border border-primary/20 hover:scale-[1.01]"}`}
                                    >
                                       {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                       {copied ? "Copied!" : "Copy Result"}
                                    </Button>
                                    <Button
                                       onClick={swap}
                                       disabled={!output || !!error}
                                       variant="outline"
                                       className="gap-2 h-10 text-xs font-bold rounded-xl border-primary/10 hover:bg-primary/5 shadow-md"
                                       title="Use output as next input"
                                    >
                                       <RefreshCw className="h-4 w-4" />
                                       Swap
                                    </Button>
                                 </div>
                              </CardContent>
                           </Card>
                        </div>
                     </div>

                     <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
                        <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card">
                           <div className="bg-primary/5 p-5 border-b border-primary/10">
                              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Conversion Stats</h3>
                           </div>
                           <CardContent className="p-8 space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-background/20 p-4 rounded-2xl border border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Input Len</p>
                                    <p className="text-2xl font-black italic tracking-tighter">{input.length}</p>
                                 </div>
                                 <div className="bg-background/20 p-4 rounded-2xl border border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Output Len</p>
                                    <p className="text-2xl font-black italic tracking-tighter">{output.length}</p>
                                 </div>
                              </div>
                              {input && output && !error && (
                                 <div className="bg-background/20 p-4 rounded-2xl border border-border/50">
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
                     </aside>
                  </div>
               </div>
               {/* SEO & Tool Guide Section */}
               <ToolExpertSection
                  title="Universal Encoder / Decoder"
                  description="The Universal Encoder / Decoder is a Swiss-army knife for data sanitization, translation, and forensic analysis, supporting Base64, URL percent-encoding, HTML entities, and Hexadecimal formats."
                  transparency="Unlike online converters that log your queries to a central server, this tool operates exclusively within your browser's local memory. Whether you're decoding a sensitive Base64 token or encoding a URL for a secure API request, the process remains fully air-gapped from our servers."
                  limitations="While highly efficient for text-based payloads, encoding extraordinarily large files into Hex or Base64 can lead to a 33-400% increase in string size. Processing multi-megabyte blobs in a single tab may cause temporary UI freezes as the browser handles the massive string allocation."
                  accent="blue"
               />
            </main>

            <SponsorSidebars position="right" />
         </div>
         <Footer />

         {/* Mobile Sticky Anchor Ad */}
         <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-black/80 backdrop-blur-sm border-t border-white/10 py-2 h-[66px] overflow-hidden">
            <AdBox height={50} label="320x50 ANCHOR AD" className="w-full" />
         </div>
      </div>
   );
};

export default EncoderDecoder;
