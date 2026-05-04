import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import ToolBottomDescription from '@/components/ToolBottomDescription';
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";

const WORDS = `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam eius modi tempora incidunt`.split(" ");
const BUZZWORDS = `synergize leverage disruption paradigm shift agile scalable blockchain deep dive circle back bandwidth pivot ecosystem holistic ideation low-hanging fruit boil the ocean move the needle drill down value-add best-of-breed cross-functional tiger team bandwidth optics deliverable proactive robust cutting-edge best practice mission-critical turnkey`.split(" ");
const HIPSTER = `artisan twee gastropub brooklyn fixie kale chips skateboard mlkshk quinoa biodiesel roof party vegan humblebrag messenger bag pour-over bespoke typewriter selvage lumbersexual cold-pressed normcore austin fingerstache banh mi chicharrones polaroid tofu`.split(" ");

type Style = "classic" | "buzzword" | "hipster";

function pickWords(style: Style, n: number): string[] {
  const pool = style === "classic" ? WORDS : style === "buzzword" ? BUZZWORDS : HIPSTER;
  const result: string[] = [];
  for (let i = 0; i < n; i++) result.push(pool[Math.floor(Math.random() * pool.length)]);
  return result;
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function buildSentence(style: Style): string {
  const len = 6 + Math.floor(Math.random() * 10);
  const words = pickWords(style, len);
  return capitalize(words.join(" ")) + ".";
}

function buildParagraph(style: Style, sentences: number): string {
  return Array.from({ length: sentences }, () => buildSentence(style)).join(" ");
}

function buildLoremText(style: Style, unit: "words" | "sentences" | "paragraphs", count: number): string {
  if (unit === "words") return capitalize(pickWords(style, count).join(" ")) + ".";
  if (unit === "sentences") return Array.from({ length: count }, () => buildSentence(style)).join(" ");
  const sentencesPerPara = 4 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, () => buildParagraph(style, sentencesPerPara)).join("\n\n");
}

const STYLES: { key: Style; label: string; emoji: string }[] = [
  { key: "classic", label: "Classic Latin", emoji: "📜" },
  { key: "buzzword", label: "Corporate Buzzword", emoji: "💼" },
  { key: "hipster", label: "Hipster", emoji: "🧔" },
];

const UNITS: { key: "words" | "sentences" | "paragraphs"; label: string }[] = [
  { key: "words", label: "Words" },
  { key: "sentences", label: "Sentences" },
  { key: "paragraphs", label: "Paragraphs" },
];

const LoremGenerator = () => {
  const [darkMode, setDarkMode] = useState(() => (typeof document !== "undefined" && document.documentElement.classList.contains("dark")));
  const [style, setStyle] = useState<Style>("classic");
  const [unit, setUnit] = useState<"words" | "sentences" | "paragraphs">("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState(() => buildLoremText("classic", "paragraphs", 3));
  const [copied, setCopied] = useState(false);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const generate = useCallback((s = style, u = unit, c = count, startLorem = startWithLorem) => {
    // Safety Gate: Hard Cap to prevent DOM freeze
    const safeCount = Math.min(100, c);
    let text = buildLoremText(s, u, safeCount);
    if (startLorem && s === "classic") {
      text = "Lorem ipsum dolor sit amet, " + text.charAt(0).toLowerCase() + text.slice(1);
    }
    setOutput(text);
  }, [style, unit, count, startWithLorem]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const wordCount = output.split(/\s+/).filter(Boolean).length;
  const sentenceCount = (output.match(/[.!?]/g) || []).length;
  const paraCount = output.split("\n\n").filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 ">
      

      <div className="flex justify-center items-start w-full relative">
        {/* SponsorSidebars position="left" removed */}

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
                  Lorem Ipsum <span className="text-primary italic">& AI Content Lab</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Placeholder Text · 3 Styles · Instant Generate
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start overflow-visible">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card p-4 lg:p-6 border-2 border-primary/5">
                  <CardContent className="p-0 space-y-4">
                    {/* Style */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 opacity-60 italic">Matrix Style</p>
                      <div className="flex flex-wrap gap-2">
                        {STYLES.map(s => (
                          <button
                            key={s.key}
                            onClick={() => { setStyle(s.key); generate(s.key, unit, count, startWithLorem); }}
                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all ${style === s.key ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" : "text-muted-foreground border-primary/10 bg-background/20 hover:bg-primary/10 hover:text-primary"}`}
                          >
                            {s.emoji} {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Unit + Count */}
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 opacity-60 italic">Atomic Unit</p>
                        <div className="flex gap-2">
                          {UNITS.map(u => (
                            <button
                              key={u.key}
                              onClick={() => { setUnit(u.key); generate(style, u.key, count, startWithLorem); }}
                              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all ${unit === u.key ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" : "text-muted-foreground border-primary/10 bg-background/20 hover:bg-primary/10 hover:text-primary"}`}
                            >
                              {u.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 opacity-60 italic">Quantity</p>
                        <div className="flex items-center gap-3 bg-background/20 p-1.5 rounded-xl border border-primary/10">
                          <button onClick={() => { const c = Math.max(1, count - 1); setCount(c); generate(style, unit, c, startWithLorem); }} className="h-7 w-7 rounded-xl border border-primary/10 font-black hover:bg-primary/10 transition-all flex items-center justify-center text-base shadow-inner">−</button>
                          <span className="text-lg font-black w-6 text-center text-primary italic">{count}</span>
                          <button onClick={() => { const c = Math.min(100, count + 1); setCount(c); generate(style, unit, c, startWithLorem); }} className="h-7 w-7 rounded-xl border border-primary/10 font-black hover:bg-primary/10 transition-all flex items-center justify-center text-base shadow-inner">+</button>
                        </div>
                      </div>
                      {style === "classic" && (
                        <label className="flex items-center gap-3 cursor-pointer select-none pb-2">
                          <input
                            id="lorem-generator-start-with-check"
                            name="lorem-generator-start-with-check"
                            type="checkbox"
                            checked={startWithLorem}
                            onChange={e => { setStartWithLorem(e.target.checked); generate(style, unit, count, e.target.checked); }}
                            className="accent-primary w-4 h-4 rounded-2xl"
                          />
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 opacity-60 italic">Start with "Lorem ipsum"</span>
                        </label>
                      )}
                    </div>

                    <div className="flex justify-start pt-3 border-t border-primary/5">
                      <Button
                        onClick={() => generate()}
                        className="gap-3 h-12 px-8 font-black text-xs rounded-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase italic border border-primary/20 shadow-xl"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Generate Stream
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Output */}
                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card p-4 lg:p-6 border-2 border-primary/5">
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 opacity-60 italic px-1">Acoustic Output</p>
                      <Button
                        onClick={copy}
                        disabled={!output}
                        className={`gap-2 h-8 px-4 text-[9px] font-black uppercase rounded-2xl shadow-lg transition-all duration-300 ${copied ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" : "bg-primary text-primary-foreground border border-primary/20 hover:scale-[1.05]"}`}
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied" : "Copy All"}
                      </Button>
                    </div>
                    <div className="min-h-[250px] text-sm leading-8 text-foreground/80 bg-background/20 border border-primary/10 rounded-xl p-6 custom-scrollbar whitespace-pre-wrap font-serif shadow-inner">
                      {output}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card border-2 border-primary/5">
                  <div className="bg-primary/5 p-5 border-b border-primary/10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Acoustic Metrics</h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/20 p-4 rounded-xl border border-primary/10 shadow-inner">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none italic">Words</p>
                        <p className="text-2xl font-black italic tracking-tighter text-primary">{wordCount}</p>
                      </div>
                      <div className="bg-background/20 p-4 rounded-xl border border-primary/10 shadow-inner">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none italic">Chars</p>
                        <p className="text-2xl font-black italic tracking-tighter text-primary">{output.length}</p>
                      </div>
                      <div className="bg-background/20 p-4 rounded-xl border border-primary/10 shadow-inner">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none italic">Sentences</p>
                        <p className="text-2xl font-black italic tracking-tighter text-primary">{sentenceCount}</p>
                      </div>
                      <div className="bg-background/20 p-4 rounded-xl border border-primary/10 shadow-inner">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none italic">Paragraphs</p>
                        <p className="text-2xl font-black italic tracking-tighter text-primary">{paraCount}</p>
                      </div>
                    </div>
                    <div className="bg-background/20 p-4 rounded-xl border border-primary/10 shadow-inner">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none italic text-center">Reading Time</p>
                      <p className="text-xl font-black italic tracking-tighter text-primary text-center">~{Math.max(1, Math.ceil(wordCount / 200))} MIN</p>
                    </div>
                    <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic leading-relaxed">
                      Local generation · Zero data uploads
                    </p>
                  </CardContent>
                </Card>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolBottomDescription toolId="/lorem-generator" />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default LoremGenerator;
