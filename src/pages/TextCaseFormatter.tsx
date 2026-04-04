import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Type, Hash, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import SponsorSidebars from "@/components/SponsorSidebars";

const toTitleCase = (s: string) =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const toSentenceCase = (s: string) =>
  s
    .split(/(?<=[.!?]\s+)/)
    .map((sentence) => {
      const trimmed = sentence.replace(/^\s+/, "");
      if (!trimmed) return sentence;
      const leading = sentence.slice(0, sentence.length - trimmed.length);
      return leading + trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    })
    .join("");

const toSnakeCase = (s: string) =>
  s
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map(x => x.toLowerCase())
    .join('_') || "";

const toKebabCase = (s: string) =>
  s
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map(x => x.toLowerCase())
    .join('-') || "";

const toConstantCase = (s: string) =>
  s
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map(x => x.toUpperCase())
    .join('_') || "";

const TextCaseFormatter = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const stats = {
    chars: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.trim() ? text.split('\n').length : 0
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-utility transition-colors duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow overflow-visible">
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
                  Text Case <span className="text-primary italic">Formatter</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Professional String Transformation Lab</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-muted/5 p-8 md:p-10">
                <CardContent className="p-0">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your content, script, or code list here…"
                    className="min-h-[400px] w-full resize-none bg-transparent border-none text-base text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 font-medium leading-relaxed custom-scrollbar"
                  />

                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="secondary" className="font-bold rounded-2xl h-12 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20" onClick={() => setText(text.toUpperCase())}>
                      UPPERCASE
                    </Button>
                    <Button variant="secondary" className="font-bold rounded-2xl h-12 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20" onClick={() => setText(text.toLowerCase())}>
                      lowercase
                    </Button>
                    <Button variant="secondary" className="font-bold rounded-2xl h-12 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20" onClick={() => setText(toTitleCase(text))}>
                      Title Case
                    </Button>
                    <Button variant="secondary" className="font-bold rounded-2xl h-12 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20" onClick={() => setText(toSentenceCase(text))}>
                      Sentence
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button variant="outline" className="gap-2 font-mono text-xs rounded-2xl h-10 border-primary/10 bg-primary/5 text-primary hover:bg-primary/20" onClick={() => setText(toSnakeCase(text))}>
                      <Terminal className="h-3.5 w-3.5" /> snake_case
                    </Button>
                    <Button variant="outline" className="gap-2 font-mono text-xs rounded-2xl h-10 border-primary/10 bg-primary/5 text-primary hover:bg-primary/20" onClick={() => setText(toKebabCase(text))}>
                      <Hash className="h-3.5 w-3.5" /> kebab-case
                    </Button>
                    <Button variant="outline" className="gap-2 font-mono text-xs rounded-2xl h-10 border-primary/10 bg-primary/5 text-primary hover:bg-primary/20" onClick={() => setText(toConstantCase(text))}>
                      <Terminal className="h-3.5 w-3.5" /> CONSTANT_CASE
                    </Button>
                  </div>

                  <Button
                    className={`mt-8 w-full gap-3 h-16 text-lg font-bold rounded-2xl shadow-xl transition-all duration-300 ${copied ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'shadow-primary/30 hover:scale-[1.01]'}`}
                    onClick={copy}
                    disabled={!text}
                  >
                    {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                    {copied ? "Text Copied!" : "Copy to Clipboard"}
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <AdPlaceholder format="banner" className="opacity-50 grayscale hover:grayscale-0 transition-all" />
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Text Analysis</h3>
                  {text && (
                    <Button
                      onClick={() => setText("")}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-2xl transition-all"
                    >
                      Reset Stage
                    </Button>
                  )}
                </div>
                <CardContent className="p-8 space-y-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/5 p-5 rounded-2xl border border-primary/10 transition-colors hover:border-primary/30">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 leading-none italic">Entropy (Words)</p>
                      <p className="text-3xl font-black italic tracking-tighter text-primary">{text.trim() ? text.trim().split(/\s+/).length : 0}</p>
                    </div>
                    <div className="bg-muted/5 p-5 rounded-2xl border border-primary/10 transition-colors hover:border-primary/30">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 leading-none italic">Weight (Chars)</p>
                      <p className="text-3xl font-black italic tracking-tighter text-primary">{text.length}</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic">Local computation • CONSTANT_CASE for env vars • kebab-case for URLs</p>
                </CardContent>
              </Card>

              <div className="px-6">
                <AdPlaceholder format="rectangle" className="opacity-40 grayscale group-hover:grayscale-0 transition-all border-border/50" />
              </div>
            </aside>
          </div>
        </div>
      </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
    </div>
  );
};

export default TextCaseFormatter;


