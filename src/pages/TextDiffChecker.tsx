import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Copy, History, Split, Type, Zap, Check, ClipboardCheck, Sparkles, Layout, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch"; // assuming you have this from shadcn
import Footer from "@/components/Footer";
import ToolBottomDescription from '@/components/ToolBottomDescription';
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import ControlHint from "@/components/ControlHint";
import { toast } from "sonner";
import * as Diff from "diff";

const TextDiffChecker = () => {
  const [darkMode, setDarkMode] = useState(() => (typeof document !== "undefined" && document.documentElement.classList.contains("dark")));
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diffMode, setDiffMode] = useState<"lines" | "words" | "chars">("lines");
  const [liveMode, setLiveMode] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);



  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  // Debounced inputs for expensive diff calculation
  const [debouncedOriginal, setDebouncedOriginal] = useState(original);
  const [debouncedModified, setDebouncedModified] = useState(modified);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOriginal(original);
      setDebouncedModified(modified);
    }, 300);
    return () => clearTimeout(timer);
  }, [original, modified]);

  const diffResult = useMemo(() => {
    if (!debouncedOriginal && !debouncedModified) return [];

    if (diffMode === "lines") {
      return Diff.diffLines(debouncedOriginal, debouncedModified, { newlineIsToken: true });
    } else if (diffMode === "words") {
      return Diff.diffWords(debouncedOriginal, debouncedModified);
    } else {
      return Diff.diffChars(debouncedOriginal, debouncedModified);
    }
  }, [debouncedOriginal, debouncedModified, diffMode]);

  const diffLines = useMemo(() => {
    const lines: { parts: { value: string; added?: boolean; removed?: boolean }[] }[] = [];
    let currentLine: { parts: { value: string; added?: boolean; removed?: boolean }[] } = { parts: [] };

    diffResult.forEach((part) => {
      const partLines = part.value.split("\n");
      partLines.forEach((content, i) => {
        if (i > 0) {
          lines.push(currentLine);
          currentLine = { parts: [] };
        }
        if (content || (i === 0 && content === "" && partLines.length > 1)) {
          currentLine.parts.push({ value: content, added: part.added, removed: part.removed });
        }
      });
    });
    if (currentLine.parts.length > 0) lines.push(currentLine);
    return lines;
  }, [diffResult]);

  // Improved stats: count actual changes
  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;

    diffResult.forEach((part) => {
      if (part.added) {
        additions += diffMode === "lines"
          ? (part.value.match(/\n/g) || []).length + 1
          : part.value.length;
      }
      if (part.removed) {
        deletions += diffMode === "lines"
          ? (part.value.match(/\n/g) || []).length + 1
          : part.value.length;
      }
    });

    return { additions, deletions };
  }, [diffResult, diffMode]);

  const handleCopy = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  const handleReset = () => {
    setOriginal("");
    setModified("");
    setShowResult(false);
    toast.success("Workspace Purged");
  };

  const handleSwap = () => {
    const temp = original;
    setOriginal(modified);
    setModified(temp);
    toast.success("Artifacts Swapped");
  };

  const handleRunDiff = () => {
    if (!original.trim() && !modified.trim()) {
      toast.error("No Artifacts Detected");
      return;
    }
    setShowResult(true);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  // Auto-run in live mode
  useEffect(() => {
    if (liveMode && (original || modified)) {
      setShowResult(true);
    }
  }, [original, modified, liveMode, diffMode]);

  const totalOriginalLines = original.split(/\r\n|\r|\n/).length;
  const totalModifiedLines = modified.split(/\r\n|\r|\n/).length;

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1600px] px-4 py-8 grow">
          <div className="flex flex-col gap-10">
            <header className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border border-border dark:border-primary/20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all group/back bg-background/80 dark:bg-black/60 shadow-xl dark:shadow-2xl">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-foreground dark:text-white text-shadow-glow">
                    Forensic <span className="text-primary italic">Diff Studio</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 text-[10px]">Private Side-by-Side Content Analysis</p>
                </div>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="flex flex-col gap-12 w-full">
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl group flex flex-col min-h-[550px]">
                  {/* Header */}
                  <div className="px-4 pt-3 border-b border-border dark:border-white/5 flex items-end justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5 items-center bg-white dark:bg-[#111111] px-4 py-2 rounded-t-lg border-x border-t border-border dark:border-white/5 relative z-10 -mb-[1px]">
                        <History className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400">Forensic Workspace</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="text-muted-foreground">Live</span>
                        <Switch id="diff-live-mode-switch" name="diff-live-mode-switch" checked={liveMode} onCheckedChange={setLiveMode} />
                      </div>

                      <Button onClick={handleRunDiff} disabled={liveMode} className="h-9 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest italic rounded-xl">
                        Run Forensic Diff
                      </Button>

                      <Button size="icon" variant="ghost" onClick={handleSwap} title="Swap">
                        <Layout className="h-4 w-4" />
                      </Button>

                      <Button size="icon" variant="ghost" onClick={() => handleCopy(original + "\n\n" + modified, "Full Source Copied")}>
                        <Copy className="h-4 w-4" />
                      </Button>

                      <Button size="icon" variant="ghost" onClick={handleReset} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row bg-white dark:bg-black min-h-[550px]">
                    {/* Original */}
                    <div className="flex-1 border-b md:border-b-0 md:border-r border-border dark:border-white/5 flex flex-col">
                      <div className="px-6 pt-4 pb-2 flex justify-between items-center border-b border-border dark:border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ORIGINAL ARTIFACT</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{totalOriginalLines} lines</span>
                      </div>
                      <textarea
                        id="diff-original-input"
                        name="diff-original-input"
                        value={original}
                        onChange={(e) => setOriginal(e.target.value)}
                        placeholder="Paste original text here..."
                        className="flex-1 w-full p-6 font-mono text-sm bg-transparent resize-none outline-none selection:bg-primary/20 leading-relaxed custom-scrollbar"
                        spellCheck={false}
                      />
                    </div>

                    {/* Modified */}
                    <div className="flex-1 flex flex-col">
                      <div className="px-6 pt-4 pb-2 flex justify-between items-center border-b border-border dark:border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">MODIFIED VERSION</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{totalModifiedLines} lines</span>
                      </div>
                      <textarea
                        id="diff-modified-input"
                        name="diff-modified-input"
                        value={modified}
                        onChange={(e) => setModified(e.target.value)}
                        placeholder="Paste modified version here..."
                        className="flex-1 w-full p-6 font-mono text-sm bg-transparent resize-none outline-none selection:bg-primary/20 leading-relaxed custom-scrollbar"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </Card>

                {/* Diff Result */}
                {showResult && (
                  <Card ref={resultRef} className="glass-morphism border-border dark:border-primary/10 overflow-hidden shadow-lg dark:shadow-2xl rounded-2xl">
                    <div className="px-6 py-5 border-b border-border dark:border-white/5 bg-background/70 backdrop-blur flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Split className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-black uppercase tracking-widest text-sm">Diff Result</h3>
                          <p className="text-[10px] text-muted-foreground">Forensic Comparison</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> +{stats.additions}
                          </span>
                          <span className="flex items-center gap-1.5 text-destructive">
                            <div className="w-2 h-2 rounded-full bg-destructive" /> -{stats.deletions}
                          </span>
                        </div>

                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="bg-zinc-950/40 border border-primary/10 rounded-2xl px-4 h-11 text-[10px] font-black uppercase tracking-tighter flex items-center justify-between hover:bg-zinc-900/60 shadow-inner min-w-[120px]"
                            >
                              <span className="truncate">{diffMode}</span>
                              <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="glass-morphism border-primary/20 min-w-[120px] bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl"
                          >
                            <div className="flex items-center gap-2 px-3 py-2">
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary">Diff Mode</span>
                              <ControlHint
                                label="Diff mode"
                                title="Diff Mode"
                                description="Choose how detailed the comparison should be."
                                rows={[
                                  { label: "Lines", description: "Fastest overview for documents and code blocks." },
                                  { label: "Words", description: "Best for prose edits and sentence changes." },
                                  { label: "Chars", description: "Most precise view for tiny token differences." },
                                ]}
                              />
                            </div>
                            {["lines", "words", "chars"].map((mode) => (
                              <DropdownMenuItem
                                key={mode}
                                onClick={() => setDiffMode(mode as any)}
                                className="text-[10px] font-black uppercase tracking-widest focus:bg-accent focus:text-accent-foreground cursor-pointer py-3 transition-colors"
                              >
                                {mode}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          onClick={() => handleCopy(diffResult.map(p => p.value).join(""), "Diff Result Copied")}
                          variant="outline"
                          className="gap-2 text-xs"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          Copy Diff
                        </Button>

                        <Button onClick={handleReset} variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col font-mono text-[13px] bg-white dark:bg-[#050505] min-h-[400px] max-h-[720px] overflow-auto custom-scrollbar border border-border dark:border-white/5 rounded-xl shadow-inner divide-y divide-border/5">
                      {diffLines.length === 0 ? (
                        <div className="text-center text-muted-foreground py-20 flex flex-col items-center gap-4">
                          <Check className="h-8 w-8 opacity-20" />
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">No Forensic Deviations Detected</span>
                        </div>
                      ) : (
                        diffLines.map((line, lineIdx) => {
                          const hasAdded = line.parts.some(p => p.added);
                          const hasRemoved = line.parts.some(p => p.removed);

                          return (
                            <div 
                              key={lineIdx} 
                              className={`group flex items-start transition-colors min-h-[28px] ${
                                hasAdded && !hasRemoved ? "bg-emerald-500/10 hover:bg-emerald-500/15" : 
                                hasRemoved && !hasAdded ? "bg-red-500/10 hover:bg-red-500/15" : 
                                hasAdded && hasRemoved ? "bg-yellow-500/5 hover:bg-yellow-500/10" :
                                "hover:bg-muted/30"
                              }`}
                            >
                              <div className={`w-12 shrink-0 flex items-center justify-center border-r border-border/10 text-[10px] font-black select-none opacity-40 mt-[7px] ${
                                hasAdded && !hasRemoved ? "text-emerald-500" : hasRemoved ? "text-red-500" : "text-muted-foreground"
                              }`}>
                                {hasAdded && !hasRemoved ? "+" : hasRemoved ? "-" : " "}
                              </div>
                              <div className="pl-6 pr-4 whitespace-pre-wrap break-all leading-[28px] flex flex-wrap">
                                {line.parts.map((part, partIdx) => (
                                  <span 
                                    key={partIdx}
                                    className={`${
                                      part.added ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-0.5 rounded" : 
                                      part.removed ? "bg-red-500/20 text-red-600 dark:text-red-400 line-through opacity-80 px-0.5 rounded ml-1 mr-1" : 
                                      "text-foreground/80 dark:text-zinc-300"
                                    }`}
                                  >
                                    {part.value}
                                  </span>
                                ))}
                                {line.parts.length === 0 && <span className="opacity-0"> </span>}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            <ToolBottomDescription toolId="/text-diff-checker" />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>

      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default TextDiffChecker;
