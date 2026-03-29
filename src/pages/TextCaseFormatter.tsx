import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Type, Hash, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";

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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-10">
          <header className="space-y-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50">
                <ArrowLeft className="h-4 w-4" /> Back to Tools
              </Button>
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display">
                  Text Case <span className="text-primary">Formatter</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl font-medium opacity-80">
                  Professional string transformations for creators, editors, and developers.
                </p>
              </div>
              
              <div className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 shadow-inner">
                 <div className="text-center px-4">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Words</p>
                    <p className="text-xl font-bold font-mono">{stats.words}</p>
                 </div>
                 <div className="w-[1px] bg-border/50" />
                 <div className="text-center px-4">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Characters</p>
                    <p className="text-xl font-bold font-mono">{stats.chars}</p>
                 </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8 items-start">
            <div className="space-y-6">
              <Card className="glass-morphism border-primary/10 rounded-[2.5rem] shadow-2xl overflow-hidden bg-muted/5">
                <CardContent className="p-8">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your content, script, or code list here…"
                    className="min-h-[350px] w-full resize-none bg-transparent border-none text-lg text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 font-medium leading-relaxed"
                  />
                  
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="secondary" className="font-bold rounded-xl h-12 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20" onClick={() => setText(text.toUpperCase())}>
                      UPPERCASE
                    </Button>
                    <Button variant="secondary" className="font-bold rounded-xl h-12 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20" onClick={() => setText(text.toLowerCase())}>
                      lowercase
                    </Button>
                    <Button variant="secondary" className="font-bold rounded-xl h-12 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20" onClick={() => setText(toTitleCase(text))}>
                      Title Case
                    </Button>
                    <Button variant="secondary" className="font-bold rounded-xl h-12 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20" onClick={() => setText(toSentenceCase(text))}>
                      Sentence
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button variant="outline" className="gap-2 font-mono text-xs rounded-xl h-10 border-primary/10 bg-primary/5 text-primary hover:bg-primary/20" onClick={() => setText(toSnakeCase(text))}>
                      <Terminal className="h-3.5 w-3.5" /> snake_case
                    </Button>
                    <Button variant="outline" className="gap-2 font-mono text-xs rounded-xl h-10 border-primary/10 bg-primary/5 text-primary hover:bg-primary/20" onClick={() => setText(toKebabCase(text))}>
                      <Hash className="h-3.5 w-3.5" /> kebab-case
                    </Button>
                    <Button variant="outline" className="gap-2 font-mono text-xs rounded-xl h-10 border-primary/10 bg-primary/5 text-primary hover:bg-primary/20" onClick={() => setText(toConstantCase(text))}>
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

            <aside className="space-y-6">
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 space-y-4">
                 <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                    <Type className="h-4 w-4" /> Quick Tip
                 </h4>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                    Use **CONSTANT_CASE** for environment variables and **kebab-case** for URL slugs. 
                    <br/><br/>
                    Our algorithm preserves numbers and special characters correctly across all conversions.
                 </p>
              </div>
              
              <AdPlaceholder format="rectangle" />
              
              <div className="p-8 rounded-[2rem] bg-muted/20 border border-border/50 text-xs text-muted-foreground leading-relaxed italic opacity-70">
                Privacy First: All text processing is done 100% locally in your browser. Nothing is sent to any server.
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TextCaseFormatter;

