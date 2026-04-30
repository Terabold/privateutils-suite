import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, RefreshCw, Eraser, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import ToolBottomDescription from '@/components/ToolBottomDescription';
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";

const WhitespaceScrubber = () => {
  const [darkMode, setDarkMode] = useState(() => (typeof document !== "undefined" && document.documentElement.classList.contains("dark")));
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const [optExtraSpaces, setOptExtraSpaces] = useState(true);
  const [optEmptyLines, setOptEmptyLines] = useState(true);
  const [optTrimEachLine, setOptTrimEachLine] = useState(true);
  const [optOneLine, setOptOneLine] = useState(false);

  const [copied, setCopied] = useState(false);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const scrub = useCallback(() => {
    let result = input;

    if (optTrimEachLine) {
      result = result.split('\n').map(line => line.trim()).join('\n');
    }

    if (optExtraSpaces) {
      result = result.replace(/[ \t]+/g, ' ');
    }

    if (optEmptyLines) {
      result = result.split('\n').filter(line => line.trim() !== '').join('\n');
    }

    if (optOneLine) {
      result = result.replace(/\n+/g, ' ');
    }

    setOutput(result.trim());
  }, [input, optExtraSpaces, optEmptyLines, optTrimEachLine, optOneLine]);

  useEffect(() => {
    scrub();
  }, [scrub]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 ">
      

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow overflow-visible">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all group/back bg-background/50 backdrop-blur-md shadow-xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  Clean Code <span className="text-primary italic">Hub</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Text Sanitization · Ghost Space Removal · One-Line Mode
                </p>
              </div>
            </header>
            <ToolAdBanner />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start overflow-visible">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card p-4 lg:p-6 border-2 border-primary/5">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 opacity-60 italic">Dirty Buffer</p>
                      <Button variant="ghost" size="sm" onClick={clear} className="h-6 px-3 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 rounded-lg">
                        <Eraser className="h-3 w-3 mr-2" /> Clear All
                      </Button>
                    </div>
                    <textarea
                      id="scrub-main-input"
                      name="scrub-main-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Paste text with messy spaces or extra lines here..."
                      className="w-full h-48 bg-background/20 border border-primary/10 rounded-xl p-4 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all custom-scrollbar shadow-inner"
                    />

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 opacity-60 italic">Sanitized Artifact</p>
                        <Button
                          onClick={copy}
                          disabled={!output}
                          className={`gap-2 h-8 px-4 text-[9px] font-black uppercase rounded-2xl shadow-lg transition-all duration-300 ${copied ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" : "bg-primary text-primary-foreground border border-primary/20"}`}
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copied ? "Copied" : "Copy Result"}
                        </Button>
                      </div>
                      <div className="w-full min-h-[150px] max-h-[300px] overflow-y-auto bg-background/40 border border-primary/20 rounded-xl p-4 text-sm font-medium whitespace-pre-wrap custom-scrollbar shadow-inner text-primary/90">
                        {output || <span className="opacity-20 italic font-medium">awaiting input...</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card border-2 border-primary/5">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-2">
                    <AlignLeft className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Scrubbing Options</h3>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input id="scrub-extra-spaces-check" name="scrub-extra-spaces-check" type="checkbox" checked={optExtraSpaces} onChange={e => setOptExtraSpaces(e.target.checked)} className="w-4 h-4 rounded bg-background border-primary/20 accent-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Collapse Spaces</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input id="scrub-empty-lines-check" name="scrub-empty-lines-check" type="checkbox" checked={optEmptyLines} onChange={e => setOptEmptyLines(e.target.checked)} className="w-4 h-4 rounded bg-background border-primary/20 accent-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Ghost Lines</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input id="scrub-trim-lines-check" name="scrub-trim-lines-check" type="checkbox" checked={optTrimEachLine} onChange={e => setOptTrimEachLine(e.target.checked)} className="w-4 h-4 rounded bg-background border-primary/20 accent-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Trim Edges</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group pt-2 border-t border-primary/5">
                      <input id="scrub-one-line-check" name="scrub-one-line-check" type="checkbox" checked={optOneLine} onChange={e => setOptOneLine(e.target.checked)} className="w-4 h-4 rounded bg-background border-primary/20 accent-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Join All (One line)</span>
                    </label>

                    <div className="pt-4 mt-2">
                      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-2">
                        <p className="text-[8px] font-black uppercase tracking-widest text-primary opacity-60">Metrics</p>
                        <div className="flex justify-between items-end">
                          <span className="text-[9px] font-black uppercase opacity-40">Reduction</span>
                          <span className="text-xl font-black italic text-primary">
                            {input.length > 0 ? Math.max(0, Math.floor(((input.length - output.length) / input.length) * 100)) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>

            <ToolBottomDescription toolId="/whitespace-scrubber" />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default WhitespaceScrubber;
