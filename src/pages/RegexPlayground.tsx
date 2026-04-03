import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Play, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";

interface Match {
   index: number;
   value: string;
   groups: (string | undefined)[];
}

function runRegex(pattern: string, flags: string, testStr: string): { matches: Match[]; error?: string } {
   if (!pattern) return { matches: [] };
   try {
      const safeFlags = (flags.includes("g") ? flags : flags + "g").replace(/[^gimsuy]/g, "");
      const regex = new RegExp(pattern, safeFlags);
      const matches: Match[] = [];
      let m: RegExpExecArray | null;
      let safety = 0;
      while ((m = regex.exec(testStr)) !== null && safety++ < 1000) {
         matches.push({
            index: m.index,
            value: m[0],
            groups: m.slice(1),
         });
         if (!safeFlags.includes("g")) break;
      }
      return { matches };
   } catch (e: any) {
      return { matches: [], error: e.message };
   }
}

function highlightText(text: string, matches: Match[]) {
   if (matches.length === 0) return [{ text, highlight: false }];

   const parts: { text: string; highlight: boolean; matchIdx: number }[] = [];
   let pos = 0;

   for (const m of matches) {
      if (m.index > pos) {
         parts.push({ text: text.slice(pos, m.index), highlight: false, matchIdx: -1 });
      }
      parts.push({ text: m.value, highlight: true, matchIdx: parts.length });
      pos = m.index + m.value.length;
      if (m.value.length === 0) { pos++; } // prevent infinite loop on zero-width matches
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

   const toggleDark = useCallback(() => {
      const next = !darkMode;
      setDarkMode(next);
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
   }, [darkMode]);

   const { matches, error } = useMemo(() => runRegex(pattern, flags, testStr), [pattern, flags, testStr]);
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
      <div className="min-h-screen bg-background text-foreground theme-utility transition-colors duration-500">
         <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

         <div className="flex justify-center items-start w-full relative">
            <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
               <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
               <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
               <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
            </aside>

            <main className="container mx-auto max-w-[1400px] px-6 py-12 grow">
               <div className="flex flex-col gap-10">
                  <header className="flex items-center gap-6">
                     <Link to="/">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                           <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                     </Link>
                     <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                           Regex <span className="text-primary italic">Playground</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                           Live Match Highlighting · Groups · 8 Presets
                        </p>
                     </div>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                        {/* Pattern Input */}
                        <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-muted/5 p-8">
                           <CardContent className="p-0 space-y-4">
                              <div className="space-y-2">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Pattern</p>
                                 <div className="flex items-center gap-0">
                                    <span className="text-muted-foreground/40 font-mono text-lg px-4 h-12 flex items-center bg-muted/20 border border-r-0 border-border/30 rounded-l-xl">/</span>
                                    <input
                                       type="text"
                                       value={pattern}
                                       onChange={(e) => setPattern(e.target.value)}
                                       placeholder="[a-z]+ or \\d{4}-\\d{2}-\\d{2}"
                                       className="flex-1 bg-muted/10 border-y border-border/30 h-12 px-4 text-sm font-mono focus:outline-none focus:border-primary/40 text-foreground placeholder:text-muted-foreground/30"
                                    />
                                    <span className="text-muted-foreground/40 font-mono text-lg px-3 h-12 flex items-center bg-muted/20 border border-l-0 border-border/30">/{flags}</span>
                                    <button
                                       onClick={() => copy(`/${pattern}/${flags}`, "pattern")}
                                       className="ml-2 h-12 px-4 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-sm group/copy"
                                    >
                                       {copiedKey === "pattern" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                                    </button>
                                 </div>
                                 {error && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                                       <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                       {error}
                                    </div>
                                 )}
                              </div>

                              {/* Flags */}
                              <div className="flex flex-wrap gap-2">
                                 {COMMON_FLAGS.map(f => (
                                    <button
                                       key={f.flag}
                                       onClick={() => toggleFlag(f.flag)}
                                       title={f.desc}
                                       className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border transition-all ${flags.includes(f.flag) ? "bg-primary text-white border-primary" : "text-muted-foreground border-border/30 hover:bg-primary/10 hover:text-primary hover:border-primary/20"}`}
                                    >
                                       <span className="font-mono mr-1">{f.flag}</span> {f.label}
                                    </button>
                                 ))}
                              </div>

                              {/* Presets */}
                              <div>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Quick Presets</p>
                                 <div className="flex flex-wrap gap-2">
                                    {PRESETS.map(p => (
                                       <button
                                          key={p.label}
                                          onClick={() => setPattern(p.pattern)}
                                          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-border/30 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all text-muted-foreground"
                                       >
                                          {p.label}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </CardContent>
                        </Card>

                        {/* Test String */}
                        <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-muted/5 p-8">
                           <CardContent className="p-0 space-y-4">
                              <div className="flex items-center justify-between">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Test String</p>
                                 <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary/5 border border-border/20 rounded-xl"
                                    onClick={() => setTestStr(EXAMPLE_TEXT)}
                                 >
                                    Load Example
                                 </Button>
                              </div>
                              <textarea
                                 value={testStr}
                                 onChange={(e) => setTestStr(e.target.value)}
                                 placeholder="Enter text to test your regex against…"
                                 className="min-h-[200px] w-full resize-none bg-transparent border border-border/30 rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/30 leading-relaxed custom-scrollbar"
                              />
                           </CardContent>
                        </Card>

                        {/* Highlighted Result */}
                        {highlighted && (
                           <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-muted/5 overflow-hidden">
                              <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <Play className="h-4 w-4 text-primary" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                       {matches.length} Match{matches.length !== 1 ? "es" : ""}
                                    </h3>
                                 </div>
                                 {matches.length > 0 && (
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       className="h-8 px-4 text-[9px] font-black uppercase tracking-widest bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl shadow-lg shadow-primary/5"
                                       onClick={() => copy(matches.map(m => m.value).join("\n"), "matches")}
                                    >
                                       {copiedKey === "matches" ? <><Check className="h-3 w-3 mr-1" />Copied</> : <><Copy className="h-3 w-3 mr-1" />Copy All</>}
                                    </Button>
                                 )}
                              </div>
                              <CardContent className="p-6">
                                 <div className="text-sm font-mono leading-7 whitespace-pre-wrap break-all bg-muted/10 p-4 rounded-xl border border-border/40 custom-scrollbar max-h-80 overflow-auto">
                                    {highlighted.map((part, i) =>
                                       part.highlight ? (
                                          <mark key={i} className="bg-primary/30 text-primary rounded px-0.5 border border-primary/20 not-italic font-bold">
                                             {part.text}
                                          </mark>
                                       ) : (
                                          <span key={i} className="text-foreground/60">{part.text}</span>
                                       )
                                    )}
                                 </div>

                                 {matches.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Match List</p>
                                       <div className="space-y-1 max-h-48 overflow-auto custom-scrollbar">
                                          {matches.map((m, i) => (
                                             <div key={i} className="flex items-start gap-3 px-3 py-2 bg-primary/5 rounded-lg border border-primary/10">
                                                <span className="text-[9px] font-black text-primary/60 w-6 shrink-0 mt-0.5">#{i + 1}</span>
                                                <span className="text-xs font-mono text-primary font-bold break-all">{m.value}</span>
                                                {m.groups.length > 0 && m.groups.some(g => g !== undefined) && (
                                                   <span className="text-[9px] font-mono text-muted-foreground/50 ml-auto shrink-0">
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

                        <div className="flex justify-center">
                           <AdPlaceholder format="banner" className="opacity-50 grayscale hover:grayscale-0 transition-all" />
                        </div>
                     </div>

                     <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
                        <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                           <div className="bg-primary/5 p-5 border-b border-primary/10">
                              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Match Stats</h3>
                           </div>
                           <CardContent className="p-8 space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Matches</p>
                                    <p className={`text-2xl font-black italic tracking-tighter ${matches.length > 0 ? "text-primary" : ""}`}>{matches.length}</p>
                                 </div>
                                 <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Groups</p>
                                    <p className="text-2xl font-black italic tracking-tighter">{(pattern.match(/\(/g) || []).length}</p>
                                 </div>
                              </div>
                              <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                                 <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Coverage</p>
                                 <p className="text-2xl font-black italic tracking-tighter">
                                    {testStr.length > 0 ? Math.round((matches.reduce((s, m) => s + m.value.length, 0) / testStr.length) * 100) : 0}%
                                 </p>
                              </div>
                              <div className="space-y-3">
                                 <p className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">Cheat Sheet</p>
                                 {[
                                    [".", "any char"], ["\\d", "digit"], ["\\w", "word char"], ["\\s", "whitespace"],
                                    ["^", "start"], ["$", "end"], ["+", "1+"], ["*", "0+"], ["?", "0 or 1"],
                                    ["{n}", "exactly n"], ["(a|b)", "a or b"], ["(?:)", "non-capture"],
                                 ].map(([sym, desc]) => (
                                    <div key={sym} className="flex items-center gap-2">
                                       <code className="text-[10px] text-primary font-mono font-black bg-primary/10 px-2 py-0.5 rounded w-16 text-center">{sym}</code>
                                       <span className="text-[9px] text-muted-foreground/50 font-medium">{desc}</span>
                                    </div>
                                 ))}
                              </div>
                              <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic">
                                 Native JS engine · Zero uploads
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

export default RegexPlayground;
