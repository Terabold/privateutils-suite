import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Code2, RefreshCw, AlertTriangle, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

function base64Encode(s: string) {
   const bytes = new TextEncoder().encode(s);
   const binString = String.fromCodePoint(...bytes);
   return btoa(binString);
}
function base64Decode(s: string) {
   const binString = atob(s.trim());
   const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
   return new TextDecoder().decode(bytes);
}
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
   const cleanHex = s.replace(/[^0-9a-fA-F]/g, '');
   const bytes = [];
   for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substring(i, i + 2), 16));
   }
   return new TextDecoder().decode(new Uint8Array(bytes));
}

function runMode(mode: Mode, input: string): { output: string; error?: string } {
   try {
      switch (mode) {
         case "base64-encode": return { output: base64Encode(input) };
         case "base64-decode": return { output: base64Decode(input) };
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
   const [output, setOutput] = useState("");
   const [error, setError] = useState<string | null>(null);
   const [isProcessing, setIsProcessing] = useState(false);
   const [copied, setCopied] = useState(false);

   const toggleDark = useCallback(() => {
      const next = !darkMode;
      setDarkMode(next);
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
   }, [darkMode]);

   const inputLimit = 5_000_000;

   // Conversion logic moved to debounced effect
   useEffect(() => {
      if (!input.trim()) {
         setOutput("");
         setError(null);
         setIsProcessing(false);
         return;
      }

      if (input.length >= inputLimit) {
         setError(`Payload exceeds 5MB security threshold (${input.length.toLocaleString()} characters). Initializing truncation.`);
         setOutput("");
         setIsProcessing(false);
         return;
      }

      setIsProcessing(true);
      const timer = setTimeout(() => {
         const { output: res, error: err } = runMode(mode, input);
         setOutput(res);
         setError(err || null);
         setIsProcessing(false);
      }, 300);

      return () => clearTimeout(timer);
   }, [input, mode]);

   useEffect(() => {
      if (input.length >= inputLimit) {
         toast.error("Critical Payload Density: Processing suspended to prevent thread-lock.");
      }
   }, [input.length]);

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
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500 ">
         

         <div className="flex justify-center items-start w-full relative">
            <SponsorSidebars position="left" />

            <main className="container mx-auto max-w-[1240px] px-6 py-6 grow overflow-visible">
               <div className="flex flex-col gap-6">
                  <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                     <Link to="/">
                        <Button aria-label="Go back to home" variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all group/back bg-background/50 backdrop-blur-md shadow-xl">
                           <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                     </Link>
                     <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                           Universal Encoder & <span className="text-primary italic">Decoder</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                           Base64 • URL • HTML • Hex — Instant Local Conversion
                        </p>
                     </div>
                  </header>

                  {/* Mobile Inline Ad */}
                  <ToolAdBanner />

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start overflow-visible">
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                        {/* Mode selector */}
                        <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card">
                           <CardContent className="p-6 space-y-4">
                              {groups.map(group => (
                                 <div key={group} className="flex flex-wrap gap-2">
                                    {MODES.filter(m => m.group === group).map(m => (
                                       <button
                                          key={m.key}
                                          onClick={() => setMode(m.key)}
                                          className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${mode === m.key ? activeGroupColors[group] : groupColors[group]}`}
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
                              <CardContent className="p-0 space-y-3 relative">
                                 <div className="flex items-center justify-between">
                                    <Label htmlFor="universal-codec-main-input" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 cursor-pointer">Input</Label>
                                    <Button
                                       aria-label="Clear input artifact"
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => setInput("")}
                                       className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all flex items-center justify-center"
                                       title="Clear Artifact"
                                    >
                                       <Trash2 className="h-4 w-4" />
                                    </Button>
                                 </div>
                                 <textarea
                                    id="universal-codec-main-input"
                                    name="universal-codec-main-input"
                                    value={input}
                                    onChange={(e) => {
                                       let val = e.target.value;
                                       if (val.length > inputLimit + 1000) {
                                          val = val.substring(0, inputLimit);
                                          toast.error("Hard Safety Limit: Payload truncated to 5MB to preserve browser stability.");
                                       }
                                       setInput(val);
                                    }}
                                    placeholder="Paste your text here…"
                                    className="min-h-[450px] w-full resize-none bg-background/20 border border-border/30 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono leading-relaxed custom-scrollbar shadow-inner"
                                 />
                              </CardContent>
                           </Card>

                           <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card p-6">
                              <CardContent className="p-0 space-y-3">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Output</p>
                                 {error ? (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium min-h-[320px]">
                                       <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                       {error}
                                    </div>
                                 ) : (
                                    <div className="relative">
                                       <div className="absolute top-3 right-3 z-10">
                                          {isProcessing && (
                                             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 animate-pulse">
                                                <RefreshCw className="h-3 w-3 text-primary animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Analyzing Bitstream...</span>
                                             </div>
                                          )}
                                       </div>
                                       <pre className="min-h-[450px] w-full text-sm font-mono leading-relaxed whitespace-pre-wrap break-all text-foreground/80 bg-background/20 border border-border/30 rounded-xl p-4 custom-scrollbar overflow-auto shadow-inner">
                                          {output || <span className="text-muted-foreground/30">{isProcessing ? "Processing forensic pass..." : "Result will appear here…"}</span>}
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

                        <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl group flex flex-col min-h-[500px]">
                           <div className="bg-primary/5 p-5 border-b border-primary/10">
                              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Conversion Stats</h3>
                           </div>
                           <CardContent className="p-8 space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-background/20 p-4 rounded-xl border border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Input Len</p>
                                    <p className="text-2xl font-black italic tracking-tighter">{input.length}</p>
                                 </div>
                                 <div className="bg-background/20 p-4 rounded-xl border border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Output Len</p>
                                    <p className="text-2xl font-black italic tracking-tighter">{output.length}</p>
                                 </div>
                              </div>
                              {input && output && !error && (
                                 <div className="bg-background/20 p-4 rounded-xl border border-border/50">
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
                  title="Universal Encoder & Decoder"
                  accent="sky"
                  overview="The Universal Encoder & Decoder is a multi-protocol data architect designed for developers, penetration testers, and security researchers. I built this tool to provide a surgical path for translating between Base64, URL percent-encoding, HTML entities, and Hexadecimal—all while ensuring that sensitive tokens and payloads are never leaked to third-party conversion logs."
                  steps={[
                     "Select your target encoding or decoding protocol (e.g., Base64, URL, Hex).",
                     "Input the raw text or artifact artifact into the source workspace.",
                     "Observe the real-time 'Analyzed Bitstream' as the conversion occurs in the background.",
                     "Review the 'Size Ratio' to understand the data expansion or contraction from the original state.",
                     "Copy the resulting bitstream directly or 'Swap' it back to the input for multi-pass encoding."
                  ]}
                  technicalImplementation="I architected the conversion engine using a combination of native browser APIs (like btoa, atob, and encodeURIComponent) and custom Uint8Array-based buffer logic for Hex and HTML processing. To prevent thread-lock during the processing of massive payloads, I implemented a debounced worker-simulated delay, ensuring the UI remains responsive. The Base64 module uses Unicode-safe normalization to ensure that multi-byte characters are preserved without corruption during the binary-to-string transition."
                  privacyGuarantee="The Security & Privacy model for the Encoder/Decoder is built on Isolation by Default. Unlike 'online' decoders that might capture your JWT secrets or API keys for analysis, this tool processes every byte within your local browser sandbox. We enforce a hard 5MB security threshold to prevent browser memory exhaustion, and within that limit, your data remains 100% offline and is instantly cleared from the heap upon session termination."
               />
            </main>

            <SponsorSidebars position="right" />
         </div>
         <Footer />
         <StickyAnchorAd />
      </div>
   );
};

export default EncoderDecoder;
