import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Play, AlertTriangle, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { toast } from "sonner";

interface Match {
   index: number;
   value: string;
   groups: (string | undefined)[];
}

// Inline Web Worker Code for Background Execution
const workerBlob = new Blob([`
  self.onmessage = function(e) {
    const { pattern, flags, testStr } = e.data;
    if (!pattern) {
      self.postMessage({ matches: [] });
      return;
    }
    if (e.data.size > 25 * 1024 * 1024) {
      self.postMessage({ error: "Artifact density error: " + Math.round(e.data.size / 1024 / 1024) + "MB exceeds 25MB security threshold." });
      return;
    }
    try {
      const safeFlags = (flags.includes("g") ? flags : flags + "g").replace(/[^gimsuy]/g, "");
      const regex = new RegExp(pattern, safeFlags);
      const matches = [];
      let m;
      let safety = 0;
      // Background thread can still hang, so we use safety limit here too
      // but the main watchdog will kill the worker if it truly freezes.
      while ((m = regex.exec(testStr)) !== null && safety++ < 2000) {
        matches.push({
          index: m.index,
          value: m[0],
          groups: Array.from(m.slice(1)),
        });
        if (m[0].length === 0) regex.lastIndex++;
        if (!safeFlags.includes("g")) break;
      }
      self.postMessage({ matches });
    } catch (err) {
      self.postMessage({ error: err.message });
    }
  };
`], { type: 'application/javascript' });

function highlightText(text: string, matches: Match[]) {
   if (matches.length === 0) return [{ text, highlight: false, isZeroWidth: false }];

   const parts: { text: string; highlight: boolean; matchIdx: number; isZeroWidth?: boolean }[] = [];
   let pos = 0;

   const cleanMatches = [...matches].sort((a, b) => a.index - b.index);

   for (const m of cleanMatches) {
      if (m.index < pos && m.value.length > 0) continue;

      if (m.index > pos) {
         parts.push({ text: text.slice(pos, m.index), highlight: false, matchIdx: -1 });
      }

      const isZero = m.value.length === 0;
      parts.push({
         text: m.value,
         highlight: true,
         matchIdx: parts.length,
         isZeroWidth: isZero
      });

      pos = m.index + m.value.length;
   }

   if (pos < text.length) {
      parts.push({ text: text.slice(pos), highlight: false, matchIdx: -1 });
   }
   return parts;
}

const COMMON_FLAGS = [
   { flag: "g", label: "Global", desc: "Find all matches" },
   { flag: "i", label: "Case Insensitive", desc: "Ignore case" },
   { flag: "m", label: "Multiline", desc: "^ and $ match line boundaries" },
   { flag: "s", label: "Dot-all", desc: ". matches newlines" },
];

const PRESETS = [
   { label: "Email", pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}" },
   { label: "URL", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b[-a-zA-Z0-9()@:%_+.~#?&/=]*" },
   { label: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
   { label: "Phone (US)", pattern: "\\(?\\d{3}\\)?[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{4}" },
   { label: "Hex Color", pattern: "#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\b" },
   { label: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}" },
   { label: "Credit Card", pattern: "\\b\\d{4}[\\s\\-]?\\d{4}[\\s\\-]?\\d{4}[\\s\\-]?\\d{4}\\b" },
   { label: "JWT Token", pattern: "eyJ[A-Za-z0-9_\\-]+\\.eyJ[A-Za-z0-9_\\-]+\\.[A-Za-z0-9_\\-]+" },
];

const EXAMPLE_TEXT = `Contact us at hello@example.com or support@myapp.io.
Visit https://www.example.com/path?ref=header or http://blog.site.org.
Server IP: 192.168.1.1 and external: 8.8.8.8
Call us at (555) 123-4567 or 555.987.6543.
Token: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.signature123
Brand color: #FF5733, alt: #abc`;

const RegexPlayground = () => {
   const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
   const [pattern, setPattern] = useState("");
   const [flags, setFlags] = useState("gi");
   const [testStr, setTestStr] = useState(EXAMPLE_TEXT);
   const [copiedKey, setCopiedKey] = useState<string | null>(null);

   const [matches, setMatches] = useState<Match[]>([]);
   const [error, setError] = useState<string | null>(null);
   const [isCalculating, setIsCalculating] = useState(false);
   const workerRef = useRef<Worker | null>(null);
   const timeoutRef = useRef<number | null>(null);

   const toggleDark = useCallback(() => {
      const next = !darkMode;
      setDarkMode(next);
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
   }, [darkMode]);

   // Background Thread Execution with 2s Watchdog
   useEffect(() => {
      if (!pattern) {
         setMatches([]);
         setError(null);
         return;
      }

      setIsCalculating(true);

      // Clean up previous run
      if (workerRef.current) workerRef.current.terminate();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const worker = new Worker(URL.createObjectURL(workerBlob));
      workerRef.current = worker;

      worker.onmessage = (e) => {
         if (timeoutRef.current) clearTimeout(timeoutRef.current);
         setIsCalculating(false);
         if (e.data.error) {
            setError(e.data.error);
            setMatches([]);
         } else {
            setError(null);
            setMatches(e.data.matches);
         }
         worker.terminate();
      };

      worker.postMessage({ pattern, flags, testStr });

      // 2000ms Safety Watchdog (prevents catastrophic backtracking from hanging)
      timeoutRef.current = window.setTimeout(() => {
         worker.terminate();
         setIsCalculating(false);
         setError("Engine Timeout: Catastrophic backtracking detected. Please optimize your pattern.");
         toast.error("Regex Performance Warning: Execution terminated to save CPU cycles.");
      }, 2000);

      return () => {
         worker.terminate();
         if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
   }, [pattern, flags, testStr]);

   const highlighted = useMemo(() => pattern && !error ? highlightText(testStr, matches) : null, [testStr, matches, pattern, error]);

   const toggleFlag = (f: string) => {
      setFlags(prev => prev.includes(f) ? prev.replace(f, "") : prev + f);
   };

   const copy = async (text: string, key: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
   };

   return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
         <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

         <div className="flex justify-center items-start w-full relative">
            <SponsorSidebars position="left" />

            <main className="container mx-auto max-w-[1240px] px-6 py-12 grow min-w-0">
               <div className="flex flex-col gap-10">
                  <header className="flex items-center gap-6">
                     <Link to="/">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border dark:border-white/20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all group/back bg-background/80 dark:bg-black/60 shadow-xl dark:shadow-2xl">
                           <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                     </Link>
                     <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-foreground dark:text-white text-shadow-glow">
                           Regular Expression <span className="text-primary italic">Studio</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 text-[10px]">
                           Live Match Highlighting · Groups · Background Architecture
                        </p>
                     </div>
                  </header>

                  <ToolAdBanner />

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start min-w-0">
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 min-w-0">

                        <Card className="glass-morphism border-border dark:border-primary/10 rounded-2xl shadow-lg dark:shadow-2xl bg-zinc-100 dark:bg-[#0a0a0a] p-8">
                           <CardContent className="p-0 space-y-4">
                              <div className="space-y-2">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-muted-foreground/60">Pattern</p>
                                 <div className="flex items-center gap-0 shadow-sm rounded-xl overflow-hidden">
                                    <span className="text-muted-foreground font-mono text-lg px-4 h-12 flex items-center bg-white dark:bg-[#111111] border border-r-0 border-border dark:border-white/10">/</span>
                                    <input
                                       type="text"
                                       value={pattern}
                                       onChange={(e) => setPattern(e.target.value)}
                                       placeholder="[a-z]+ or \\d{4}-\\d{2}-\\d{2}"
                                       className="flex-1 bg-white dark:bg-[#111111] border-y border-border dark:border-white/10 h-12 px-4 text-sm font-mono focus:outline-none focus:border-primary text-foreground dark:text-white placeholder:text-muted-foreground/50 transition-all"
                                    />
                                    <span className="text-muted-foreground font-mono text-lg px-3 h-12 flex items-center bg-white dark:bg-[#111111] border border-l-0 border-border dark:border-white/10">/{flags}</span>
                                    <button
                                       onClick={() => copy(`/${pattern}/${flags}`, "pattern")}
                                       className="ml-2 h-12 px-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 text-primary dark:hover:bg-primary/20 transition-all shadow-sm group/copy"
                                    >
                                       {copiedKey === "pattern" ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-500" /> : <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                                    </button>
                                 </div>
                                 {error && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-in slide-in-from-top-2">
                                       <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                       {error}
                                    </div>
                                 )}
                              </div>

                              <div className="flex flex-wrap gap-2">
                                 {COMMON_FLAGS.map(f => (
                                    <button
                                       key={f.flag}
                                       onClick={() => toggleFlag(f.flag)}
                                       title={f.desc}
                                       className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border transition-all shadow-sm ${flags.includes(f.flag) ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground bg-white dark:bg-transparent border-border dark:border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/20"}`}
                                    >
                                       <span className="font-mono mr-1">{f.flag}</span> {f.label}
                                    </button>
                                 ))}
                              </div>

                              <div className="pt-2">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Quick Presets</p>
                                 <div className="flex flex-wrap gap-2">
                                    {PRESETS.map(p => (
                                       <button
                                          key={p.label}
                                          onClick={() => setPattern(p.pattern)}
                                          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border bg-white dark:bg-transparent border-border dark:border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all text-muted-foreground shadow-sm"
                                       >
                                          {p.label}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </CardContent>
                        </Card>

                        <Card className="glass-morphism border-border dark:border-primary/10 rounded-2xl shadow-lg dark:shadow-2xl bg-zinc-100 dark:bg-[#0a0a0a] p-8">
                           <CardContent className="p-0 space-y-4">
                              <div className="flex items-center justify-between">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-muted-foreground/60">Test String</p>
                                 <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-white dark:bg-transparent hover:bg-primary/10 hover:text-primary border border-border dark:border-white/10 rounded-xl transition-all shadow-sm"
                                    onClick={() => setTestStr(EXAMPLE_TEXT)}
                                 >
                                    Load Example
                                 </Button>
                              </div>
                              <textarea
                                 value={testStr}
                                 onChange={(e) => setTestStr(e.target.value)}
                                 placeholder="Enter text to test your regex against…"
                                 className="min-h-[200px] w-full resize-none bg-white dark:bg-[#111111] border border-border dark:border-white/10 rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-primary text-foreground dark:text-white placeholder:text-muted-foreground/40 leading-relaxed custom-scrollbar shadow-inner transition-colors"
                              />
                           </CardContent>
                        </Card>

                        {(highlighted || isCalculating) && (
                           <Card className="glass-morphism border-border dark:border-primary/10 rounded-2xl shadow-lg dark:shadow-xl bg-zinc-100 dark:bg-[#0a0a0a] overflow-hidden">
                              <div className="bg-primary/5 dark:bg-primary/10 p-5 border-b border-border dark:border-primary/10 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    {isCalculating ? <RefreshCw className="h-4 w-4 text-primary animate-spin" /> : <Play className="h-4 w-4 text-primary" />}
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                       {isCalculating ? "Calculating Virtual Match..." : `${matches.length} Match${matches.length !== 1 ? "es" : ""}`}
                                    </h3>
                                 </div>
                                 {!isCalculating && matches.length > 0 && (
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       className="h-8 px-4 text-[9px] font-black uppercase tracking-widest bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl shadow-sm"
                                       onClick={() => copy(matches.map(m => m.value).join("\n"), "matches")}
                                    >
                                       {copiedKey === "matches" ? <><Check className="h-3 w-3 mr-1" />Copied</> : <><Copy className="h-3 w-3 mr-1" />Copy All</>}
                                    </Button>
                                 )}
                              </div>
                              <CardContent className="p-6">
                                 <div className={`text-sm font-mono leading-7 whitespace-pre-wrap break-all bg-white dark:bg-[#111111] p-5 rounded-xl border border-border dark:border-white/10 custom-scrollbar max-h-80 overflow-auto shadow-inner text-foreground dark:text-white/80 transition-opacity ${isCalculating ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                                    {highlighted?.map((part, i) =>
                                       part.highlight ? (
                                          <mark
                                             key={i}
                                             className={`relative ${part.isZeroWidth ? "bg-transparent" : "bg-yellow-200 dark:bg-yellow-500/30 text-yellow-950 dark:text-yellow-200 rounded px-0.5 border border-yellow-400/50 dark:border-yellow-500/30"} not-italic font-bold group/match`}
                                          >
                                             {part.isZeroWidth ? (
                                                <span className="inline-block w-[2px] h-4 bg-yellow-500 align-middle mx-[1px] animate-pulse relative">
                                                   <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-yellow-600 opacity-0 group-hover/match:opacity-100 transition-opacity">EMPTY</span>
                                                </span>
                                             ) : part.text}
                                          </mark>
                                       ) : (
                                          <span key={i} className="opacity-80">{part.text}</span>
                                       )
                                    )}
                                 </div>

                                 {!isCalculating && matches.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Match List</p>
                                       <div className="space-y-2 max-h-48 overflow-auto custom-scrollbar pr-2">
                                          {matches.map((m, i) => (
                                             <div key={i} className="flex items-start gap-3 px-4 py-3 bg-white dark:bg-primary/5 rounded-xl border border-border dark:border-primary/10 shadow-sm">
                                                <span className="text-[9px] font-black text-primary/60 w-6 shrink-0 mt-0.5">#{i + 1}</span>
                                                <span className="text-xs font-mono text-foreground dark:text-primary font-bold break-all">{m.value}</span>
                                                {m.groups.length > 0 && m.groups.some(g => g !== undefined) && (
                                                   <span className="text-[9px] font-mono text-muted-foreground ml-auto shrink-0 bg-muted dark:bg-black/40 px-2 py-1 rounded">
                                                      [{m.groups.filter(g => g !== undefined).join(", ")}]
                                                   </span>
                                                )}
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 )}
                              </CardContent>
                           </Card>
                        )}
                     </div>

                     <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
                        <Card className="glass-morphism border-border dark:border-primary/10 rounded-2xl overflow-hidden shadow-lg dark:shadow-xl bg-card">
                           <div className="bg-primary/5 dark:bg-primary/10 p-5 border-b border-border dark:border-primary/10">
                              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Match Stats</h3>
                           </div>
                           <CardContent className="p-8 space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-muted/50 dark:bg-black/40 p-4 rounded-2xl border border-border dark:border-white/5 shadow-inner">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:opacity-40 mb-1">Matches</p>
                                    <p className={`text-2xl font-black italic tracking-tighter ${matches.length > 0 ? "text-primary" : "text-foreground dark:text-white"}`}>{matches.length}</p>
                                 </div>
                                 <div className="bg-muted/50 dark:bg-black/40 p-4 rounded-2xl border border-border dark:border-white/5 shadow-inner">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:opacity-40 mb-1">Groups</p>
                                    <p className="text-2xl font-black italic tracking-tighter text-foreground dark:text-white">{(pattern.match(/\(/g) || []).length}</p>
                                 </div>
                              </div>
                              <div className="bg-muted/50 dark:bg-black/40 p-4 rounded-2xl border border-border dark:border-white/5 shadow-inner">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:opacity-40 mb-1">Coverage</p>
                                 <p className="text-2xl font-black italic tracking-tighter text-foreground dark:text-white">
                                    {testStr.length > 0 ? Math.round((matches.reduce((s, m) => s + m.value.length, 0) / testStr.length) * 100) : 0}%
                                 </p>
                              </div>
                              <div className="space-y-3 pt-4 border-t border-border dark:border-white/5">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:opacity-30 italic">Cheat Sheet</p>
                                 <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                                    {[
                                       [".", "any char"], ["\\d", "digit"], ["\\w", "word char"], ["\\s", "whitespace"],
                                       ["^", "start"], ["$", "end"], ["+", "1+"], ["*", "0+"], ["?", "0 or 1"],
                                       ["{n}", "exactly n"], ["(a|b)", "a or b"], ["(?:)", "non-capture"],
                                    ].map(([sym, desc]) => (
                                       <div key={sym} className="flex items-center gap-2">
                                          <code className="text-[10px] text-primary font-mono font-black bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded shadow-sm w-8 shrink-0 text-center">{sym}</code>
                                          <span className="text-[8px] text-muted-foreground font-medium truncate">{desc}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest dark:opacity-30 italic pt-4 border-t border-border dark:border-white/5">
                                 Native JS engine · Background Architecture
                              </p>
                           </CardContent>
                        </Card>
                     </aside>
                  </div>
                  <ToolExpertSection
                     title="Regular Expression Studio"
                     description="The Regex Playground is a high-performance Regular Expression evaluator designed for developers and security analysts to test, debug, and optimize complex patterns in real-time."
                     transparency="Our playground utilizes a specialized Web Worker architecture, offloading the V8 RegExp engine to a background thread. This ensures your browser's main UI thread remains fluid even when executing recursive patterns. Every pattern evaluation is shielded by a 2000ms hardware watchdog that terminates execution if catastrophic backtracking is detected."
                     limitations="While our background architecture prevents browser lockups, poorly optimized patterns can still fail to return results within the security threshold. We recommend avoiding nested quantifiers on large datasets to ensure sub-second evaluation."
                     accent="sky"
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

export default RegexPlayground;
