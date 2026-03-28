import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6 gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Tools
          </Button>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">Text Case Formatter</h1>
        <p className="mt-1 text-muted-foreground">Quickly change the case of any text right in your browser.</p>

        <Card className="mt-8">
          <CardContent className="p-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here…"
              className="min-h-[180px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Button variant="secondary" onClick={() => setText(text.toUpperCase())}>
                UPPERCASE
              </Button>
              <Button variant="secondary" onClick={() => setText(text.toLowerCase())}>
                lowercase
              </Button>
              <Button variant="secondary" onClick={() => setText(toTitleCase(text))}>
                Title Case
              </Button>
              <Button variant="secondary" onClick={() => setText(toSentenceCase(text))}>
                Sentence case
              </Button>
            </div>

            <Button className="mt-4 w-full gap-2" onClick={copy} disabled={!text}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TextCaseFormatter;
