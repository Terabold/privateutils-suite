import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Type, Hash, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { toast } from "sonner";

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

  const handleTextChange = (val: string) => {
    if (val.length > 10000000) {
      toast.error("Payload Exceeds 10MB Stability Gate", {
        description: "Please process smaller segments to prevent browser thread saturation."
      });
      return;
    }
    if (val.length > 5000000) {
      toast.warning("Large Payload Detected", {
        description: "Operations may take several seconds on this volume of text."
      });
    }
    setText(val);
  };

  const stats = {
    chars: text.length,
    words: text.length > 1000000 ? "..." : (text.trim() ? text.trim().split(/\s+/).length : 0),
    lines: text.length > 2000000 ? "..." : (text.trim() ? text.split('\n').length : 0)
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="w-full max-w-[1800px] mx-auto px-6 py-12 grow overflow-visible">
          <div className="flex flex-col gap-10">
            <header className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                    Text Case <span className="text-primary italic">Transformer</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Professional String Transformation Lab</p>
                </div>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 items-start w-full">
              <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-muted/5 p-8 md:p-10">
                  <CardContent className="p-0">
                    <textarea
                      id="case-transformer-main-input"
                      name="case-transformer-main-input"
                      value={text}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="Paste your content, script, or code list here…"
                      className="min-h-[500px] w-full resize-none bg-transparent border-none text-base text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 font-medium leading-relaxed custom-scrollbar"
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
              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
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
                      <div className="bg-muted/5 p-5 rounded-xl border border-primary/10 transition-colors hover:border-primary/30">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 leading-none italic">Entropy (Words)</p>
                        <p className="text-3xl font-black italic tracking-tighter text-primary">{stats.words}</p>
                      </div>
                      <div className="bg-muted/5 p-5 rounded-xl border border-primary/10 transition-colors hover:border-primary/30">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 leading-none italic">Weight (Chars)</p>
                        <p className="text-3xl font-black italic tracking-tighter text-primary">{stats.chars}</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic">Local computation • CONSTANT_CASE for env vars • kebab-case for URLs</p>
                  </CardContent>
                </Card>
              </aside>

            </div>

            {/* SEO & Tool Guide Section */}
            <div className="max-w-[1240px] w-full mt-10">
              <ToolExpertSection
                title="Text Case Transformer"
                accent="emerald"
                overview="The Case Transformer is a professional-grade string manipulation lab designed for software engineers, database architects, and technical writers. I built this tool to provide a surgical path for standardizing text across different naming conventions—ensuring that your environment variables, URL slugs, and documentation remain consistent without the privacy risk of 'cloud converters' that scrape your input data."
                steps={[
                  "Paste your raw string, list, or code segment into the Transformer Workspace.",
                  "Choose a 'Standard Case' (UPPERCASE, lowercase, Title Case, or Sentence Case).",
                  "Selecting a 'Code naming convention' (snake_case, kebab-case, or CONSTANT_CASE) for development artifacts.",
                  "Review the 'Text Analysis' suite to audit word count and character weight.",
                  "Extract the transformed result directly to your clipboard for instant integration into your codebase."
                ]}
                technicalImplementation="I architected the transformation engine using regular expression (RegEx) lookahead and lookbehind assertions. The 'Snake' and 'Kebab' modules utilize a multi-pass strategy to identify word boundaries at camelCase transitions, numbers, and symbols, ensuring accurate delimiting. To maintain system stability, I implemented a 10MB Stability Gate that prevents the browser's main thread from saturating during extremely large string allocations."
                privacyGuarantee="The Security \u0026 Privacy model for the Transformer is defined by Zero-Telemetry Isolation. All string arithmetic and mapping occurs strictly within your browser's private V8 execution context. Your text scripts, variables, and drafts never touch a network interface. All state is strictly ephemeral and is cleared from the volatile heap once the session ends."
              />
            </div>
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default TextCaseFormatter;


